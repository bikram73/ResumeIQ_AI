"""
ResumeIQ AI Pipeline — Backend entry point.

Delegates to ml-models package for all ML logic:
  - ml_models.parsers     → text extraction, skill/section detection
  - ml_models.embeddings  → semantic similarity, keyword overlap
  - ml_models.scoring     → ATS score with multi-granularity breakdown
  - ml_models.recommendation → suggestions, role recommendations, skill gap
"""
from __future__ import annotations
import sys
import os
from typing import Optional, Dict, Any, List

# Make ml-models importable from backend
_ML_MODELS_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml-models")
)
if _ML_MODELS_PATH not in sys.path:
    sys.path.insert(0, _ML_MODELS_PATH)

# ── Import ml-models modules ──────────────────────────────────────────────────
try:
    from parsers.extractor import (
        extract_text, extract_skills, extract_skills_by_category,
        detect_sections, extract_contact_info, parse_resume,
    )
    from embeddings.semantic import compute_similarity, keyword_overlap, tfidf_similarity
    from scoring.ats_scorer import compute_ats_score
    from recommendation.engine import generate_suggestions, recommend_roles, skill_gap_report
    _ML_AVAILABLE = True
except ImportError as e:
    _ML_AVAILABLE = False
    _ML_IMPORT_ERROR = str(e)


# ── Fallback implementations (if ml-models import fails) ─────────────────────

def _fallback_extract_text(path: str) -> str:
    try:
        import pdfplumber
        pages = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    pages.append(t)
        result = "\n".join(pages).strip()
        if result:
            return result
    except Exception:
        pass
    try:
        import fitz
        doc = fitz.open(path)
        pages = [p.get_text() for p in doc]
        doc.close()
        return "\n".join(p for p in pages if p).strip()
    except Exception:
        return ""


_FALLBACK_SKILLS = {
    "python", "java", "javascript", "react", "node.js", "sql", "aws",
    "docker", "kubernetes", "machine learning", "fastapi", "html", "css",
    "typescript", "nlp", "deep learning", "mongodb", "postgresql", "git",
    "linux", "agile", "scrum", "tensorflow", "pytorch", "express", "django",
    "flask", "pandas", "numpy", "spacy", "redis", "graphql", "rest api",
    "microservices", "ci/cd", "azure", "gcp", "data analysis", "tableau",
    "power bi", "excel", "spark", "hadoop", "selenium", "pytest",
    "spring boot", "angular", "vue.js", "c++", "c#", "typescript",
}

import re as _re

def _fallback_extract_skills(text: str) -> List[str]:
    text_lower = text.lower()
    return sorted(s for s in _FALLBACK_SKILLS
                  if _re.search(r'\b' + _re.escape(s) + r'\b', text_lower))


def _fallback_tfidf(a: str, b: str) -> float:
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        import numpy as np
        vec = TfidfVectorizer(ngram_range=(1, 2), stop_words="english").fit([a, b])
        m = vec.transform([a, b]).toarray()
        denom = np.linalg.norm(m[0]) * np.linalg.norm(m[1])
        return float(np.dot(m[0], m[1]) / denom) if denom else 0.0
    except Exception:
        return 0.0


def _fallback_quality(text: str, skills: List[str]) -> float:
    text_lower = text.lower()
    words = text.split()
    verbs = ["developed","built","designed","implemented","created","led","managed",
             "optimized","improved","delivered","deployed","automated","reduced",
             "increased","achieved","analyzed","launched","integrated","engineered"]
    verb_score = min(1.0, sum(1 for v in verbs if v in text_lower) / 8.0)
    skill_score = min(1.0, len(skills) / 15.0)
    richness = min(1.0, (len(set(w.lower() for w in words)) / max(len(words), 1)) / 0.65) if words else 0.0
    return round(0.40 * skill_score + 0.30 * verb_score + 0.30 * richness, 4)


def _fallback_layout(path: str, text: str) -> float:
    text_lower = text.lower()
    sections = ["experience", "education", "skills", "summary", "projects", "certifications"]
    sec_score = sum(1 for s in sections if s in text_lower) / len(sections)
    try:
        size = os.path.getsize(path)
        size_score = 1.0 if 10_000 <= size <= 300_000 else (size / 10_000 if size < 10_000 else max(0.3, 1.0 - (size - 300_000) / 500_000))
    except Exception:
        size_score = 0.5
    wc = len(text.split())
    wc_score = 1.0 if 300 <= wc <= 1500 else (wc / 300 if wc < 300 else max(0.5, 1.0 - (wc - 1500) / 2000))
    return round(min(1.0, 0.4 * sec_score + 0.4 * size_score + 0.2 * wc_score), 4)


# ── Public API ────────────────────────────────────────────────────────────────

def analyze_resume(resume_path: str, jd_text: Optional[str] = "") -> Dict[str, Any]:
    """
    Full resume analysis. Uses ml-models if available, falls back to
    inline implementations otherwise.
    """
    has_jd = bool(jd_text and jd_text.strip())

    if _ML_AVAILABLE:
        # ── ML-models path ────────────────────────────────────────────────────
        parsed = parse_resume(resume_path)
        resume_text = parsed["text"]
        skills = parsed["skills"]
        skills_by_cat = parsed["skills_by_category"]
        sections_found = parsed["sections_found"]
        contact_info = parsed["contact_info"]

        ats_result = compute_ats_score(
            resume_path=resume_path,
            resume_text=resume_text,
            jd_text=jd_text or "",
            resume_skills=skills,
            sections_found=sections_found,
        )

        missing = ats_result["missing_skills"]
        suggestions = generate_suggestions(
            ats_score=ats_result["ats_score"],
            semantic_score=ats_result["semantic_score"],
            keyword_score=ats_result["keyword_match"],
            layout_score=ats_result["layout_score"],
            missing_skills=missing,
            found_skills=skills,
            has_jd=has_jd,
            score_breakdown=ats_result.get("score_breakdown", {}),
        )

        role_recs = recommend_roles(skills, top_n=3)
        gap_report = skill_gap_report(skills, missing)

        return {
            "ats_score": ats_result["ats_score"],
            "semantic_score": ats_result["semantic_score"],
            "keyword_match": ats_result["keyword_match"],
            "layout_score": ats_result["layout_score"],
            "jd_provided": has_jd,
            "extracted_skills": skills,
            "skills_by_category": skills_by_cat,
            "missing_skills": missing,
            "matched_skills": ats_result.get("matched_skills", []),
            "score_breakdown": ats_result.get("score_breakdown", {}),
            "layout_detail": ats_result.get("layout_detail", {}),
            "suggestions": suggestions,
            "role_recommendations": role_recs,
            "skill_gap_report": gap_report,
            "contact_info": contact_info,
            "word_count": parsed["word_count"],
        }

    else:
        # ── Fallback path ─────────────────────────────────────────────────────
        resume_text = _fallback_extract_text(resume_path)
        skills = _fallback_extract_skills(resume_text)

        if has_jd and resume_text:
            semantic = _fallback_tfidf(resume_text, jd_text)
            keyword = _fallback_tfidf(resume_text, jd_text)
            jd_skills = set(_fallback_extract_skills(jd_text))
            missing = sorted(jd_skills - set(skills))
        elif resume_text:
            quality = _fallback_quality(resume_text, skills)
            semantic = quality
            keyword = quality
            missing = []
        else:
            semantic = keyword = 0.0
            missing = []

        layout = _fallback_layout(resume_path, resume_text)
        ats = 0.5 * semantic + 0.3 * keyword + 0.2 * layout

        return {
            "ats_score": round(ats * 100, 2),
            "semantic_score": round(semantic, 4),
            "keyword_match": round(keyword, 4),
            "layout_score": round(layout, 4),
            "jd_provided": has_jd,
            "extracted_skills": skills,
            "skills_by_category": {},
            "missing_skills": missing,
            "matched_skills": [],
            "score_breakdown": {},
            "layout_detail": {},
            "suggestions": [],
            "role_recommendations": [],
            "skill_gap_report": {},
            "contact_info": {},
            "word_count": len(resume_text.split()),
        }


def generate_suggestions_for_result(result: Dict[str, Any], jd_text: str) -> List[str]:
    """Generate suggestions from a stored analysis result dict."""
    if _ML_AVAILABLE:
        return generate_suggestions(
            ats_score=result.get("ats_score", 0),
            semantic_score=result.get("semantic_score", 0),
            keyword_score=result.get("keyword_match", 0),
            layout_score=result.get("layout_score", 0),
            missing_skills=result.get("missing_skills", []),
            found_skills=result.get("extracted_skills", []),
            has_jd=result.get("jd_provided", bool(jd_text and jd_text.strip())),
            score_breakdown=result.get("score_breakdown", {}),
        )
    # Fallback: basic suggestions
    suggestions = []
    if result.get("ats_score", 0) < 50:
        suggestions.append("Your ATS score is below 50%. Tailor your resume to the job description.")
    if result.get("missing_skills"):
        suggestions.append(f"Add missing skills: {', '.join(result['missing_skills'][:5])}")
    return suggestions
