import os
import re
from typing import Optional, Dict, Any, List

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    import numpy as np
except Exception:
    TfidfVectorizer = None
    np = None

_sbert_model = None

COMMON_SKILLS = {
    "python", "java", "c++", "c#", "javascript", "react", "node.js", "sql",
    "aws", "docker", "kubernetes", "machine learning", "fastapi",
    "html", "css", "typescript", "nlp", "deep learning", "mongodb",
    "postgresql", "git", "linux", "agile", "scrum", "tensorflow", "pytorch",
    "express", "django", "flask", "pandas", "numpy", "spacy", "redis",
    "graphql", "rest api", "microservices", "ci/cd", "azure", "gcp",
    "data analysis", "tableau", "power bi", "excel", "spark", "hadoop",
    "selenium", "junit", "pytest", "spring boot", "angular", "vue.js",
}

SECTION_KEYWORDS = {
    "experience": ["experience", "work history", "employment", "professional background"],
    "education": ["education", "academic", "degree", "university", "college"],
    "skills": ["skills", "technical skills", "competencies", "technologies"],
    "projects": ["projects", "portfolio", "work samples"],
    "certifications": ["certifications", "certificates", "credentials", "licenses"],
    "summary": ["summary", "objective", "profile", "about me"],
}


def _get_sbert_model():
    global _sbert_model
    if _sbert_model is not None:
        return _sbert_model
    try:
        from sentence_transformers import SentenceTransformer
        _sbert_model = SentenceTransformer("all-MiniLM-L6-v2")
    except Exception:
        _sbert_model = None
    return _sbert_model


def extract_text_from_pdf(path: str) -> str:
    """Try pdfplumber first, fall back to PyMuPDF (fitz) for image-heavy PDFs."""
    # Attempt 1: pdfplumber
    try:
        import pdfplumber
        text = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text.append(t)
        result = "\n".join(text).strip()
        if result:
            return result
    except Exception:
        pass

    # Attempt 2: PyMuPDF (fitz) — handles more PDF types
    try:
        import fitz  # pymupdf
        doc = fitz.open(path)
        text = []
        for page in doc:
            t = page.get_text()
            if t:
                text.append(t)
        doc.close()
        result = "\n".join(text).strip()
        if result:
            return result
    except Exception:
        pass

    return ""


def compute_semantic_similarity(resume_text: str, jd_text: str) -> float:
    model = _get_sbert_model()
    if model is None:
        return 0.0
    try:
        from sentence_transformers import util
        emb1 = model.encode(resume_text, convert_to_tensor=True)
        emb2 = model.encode(jd_text, convert_to_tensor=True)
        return float(util.cos_sim(emb1, emb2).item())
    except Exception:
        return 0.0


def tfidf_keyword_match(resume_text: str, jd_text: str) -> float:
    if TfidfVectorizer is None or np is None:
        return 0.0
    try:
        vec = TfidfVectorizer().fit([resume_text, jd_text])
        m = vec.transform([resume_text, jd_text]).toarray()
        a, b = m[0], m[1]
        denom = np.linalg.norm(a) * np.linalg.norm(b)
        if denom == 0:
            return 0.0
        return float(np.dot(a, b) / denom)
    except Exception:
        return 0.0


def layout_score(path: str, resume_text: str) -> float:
    """Heuristic layout scoring based on section presence and file size."""
    score = 0.0
    text_lower = resume_text.lower()

    # Check for key sections (40% of layout score)
    sections_found = 0
    for section, keywords in SECTION_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            sections_found += 1
    section_score = sections_found / len(SECTION_KEYWORDS)
    score += 0.4 * section_score

    # File size heuristic — reasonable resume is 20KB–200KB (40%)
    try:
        size = os.path.getsize(path)
        if 10_000 <= size <= 300_000:
            size_score = 1.0
        elif size < 10_000:
            size_score = size / 10_000
        else:
            size_score = max(0.3, 1.0 - (size - 300_000) / 500_000)
        score += 0.4 * size_score
    except Exception:
        score += 0.2

    # Text length heuristic — good resume has 300–1500 words (20%)
    word_count = len(resume_text.split())
    if 300 <= word_count <= 1500:
        word_score = 1.0
    elif word_count < 300:
        word_score = word_count / 300
    else:
        word_score = max(0.5, 1.0 - (word_count - 1500) / 2000)
    score += 0.2 * word_score

    return round(min(1.0, score), 4)


def extract_skills(text: str) -> List[str]:
    text_lower = text.lower()
    found = set()
    for skill in COMMON_SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            found.add(skill)
    return sorted(found)


def resume_quality_score(resume_text: str) -> float:
    """
    When no JD is provided, score the resume on its own quality:
    - Skill density: how many known skills are present
    - Action verb usage: strong verbs indicate well-written bullets
    - Content richness: word variety via TF-IDF self-score
    Returns a 0.0–1.0 score.
    """
    if not resume_text:
        return 0.0

    text_lower = resume_text.lower()
    words = resume_text.split()
    score = 0.0

    # Skill density (40%): more recognized skills = better resume
    found_skills = extract_skills(resume_text)
    skill_score = min(1.0, len(found_skills) / 15.0)  # 15+ skills = full score
    score += 0.40 * skill_score

    # Action verbs (30%): strong resume language
    action_verbs = [
        "developed", "built", "designed", "implemented", "created", "led",
        "managed", "optimized", "improved", "delivered", "architected",
        "deployed", "automated", "reduced", "increased", "achieved",
        "collaborated", "analyzed", "researched", "published", "launched",
        "integrated", "maintained", "tested", "debugged", "refactored",
    ]
    verb_hits = sum(1 for v in action_verbs if v in text_lower)
    verb_score = min(1.0, verb_hits / 8.0)  # 8+ action verbs = full score
    score += 0.30 * verb_score

    # Content richness (30%): unique word ratio (vocabulary diversity)
    if words:
        unique_ratio = min(1.0, len(set(w.lower() for w in words)) / max(len(words), 1))
        # Good resumes have ~60-80% unique word ratio
        richness = min(1.0, unique_ratio / 0.65)
        score += 0.30 * richness

    return round(min(1.0, score), 4)


def analyze_resume(resume_path: str, jd_text: Optional[str] = "") -> Dict[str, Any]:
    resume_text = extract_text_from_pdf(resume_path)

    resume_skills = extract_skills(resume_text)
    has_jd = bool(jd_text and jd_text.strip())

    jd_skills = extract_skills(jd_text) if has_jd else []
    missing_skills = sorted(set(jd_skills) - set(resume_skills))

    semantic = 0.0
    keyword = 0.0

    if has_jd and resume_text:
        # JD provided: compare resume against job description
        mode = os.getenv("RESUMEIQ_SEMANTIC_MODE", "fast").lower()
        if mode == "sbert":
            semantic = compute_semantic_similarity(resume_text, jd_text)
        else:
            semantic = tfidf_keyword_match(resume_text, jd_text)
        keyword = tfidf_keyword_match(resume_text, jd_text)
    elif resume_text:
        # No JD: score resume quality on its own merits
        quality = resume_quality_score(resume_text)
        semantic = quality
        keyword = quality

    layout = layout_score(resume_path, resume_text)
    ats = 0.5 * semantic + 0.3 * keyword + 0.2 * layout

    return {
        "ats_score": round(ats * 100, 2),
        "semantic_score": round(semantic, 4),
        "keyword_match": round(keyword, 4),
        "layout_score": round(layout, 4),
        "extracted_skills": resume_skills,
        "missing_skills": missing_skills,
        "jd_provided": has_jd,
    }


def generate_suggestions(result: Dict[str, Any], jd_text: str) -> List[str]:
    """Generate actionable improvement suggestions based on analysis results."""
    suggestions = []
    ats = result.get("ats_score", 0)
    semantic = result.get("semantic_score", 0)
    keyword = result.get("keyword_match", 0)
    layout = result.get("layout_score", 0)
    missing = result.get("missing_skills", [])
    found = result.get("extracted_skills", [])
    has_jd = result.get("jd_provided", bool(jd_text and jd_text.strip()))

    if not has_jd:
        # Resume-only mode suggestions
        suggestions.append(
            "No job description was provided. These scores reflect your resume's standalone quality. "
            "For a full ATS analysis with semantic matching and skill gap detection, paste a job description and re-analyze."
        )
        if semantic < 0.5:
            suggestions.append(
                "Your resume quality score is below 50%. Add more recognized technical skills, "
                "use strong action verbs (Developed, Built, Optimized, Led), and enrich your content."
            )
        if len(found) < 8:
            suggestions.append(
                "Only a few technical skills were detected. Add a dedicated Skills section listing "
                "all relevant technologies, tools, frameworks, and languages you know."
            )
        if layout < 0.6:
            suggestions.append(
                "Improve your resume structure. Ensure clearly labeled sections: Summary, Experience, "
                "Education, Skills, Projects, and Certifications."
            )
        suggestions.append(
            "Use strong action verbs at the start of each bullet: Developed, Architected, Optimized, "
            "Led, Delivered, Reduced, Increased, Automated."
        )
        suggestions.append(
            "Quantify your achievements with numbers — e.g., 'Improved API response time by 40%' "
            "or 'Built a system serving 10,000+ users'."
        )
        return suggestions

    # JD-provided mode suggestions
    if ats < 50:
        suggestions.append(
            "Your ATS score is below 50%. Focus on tailoring your resume specifically to the job description by mirroring its language and keywords."
        )

    if semantic < 0.3:
        suggestions.append(
            "Semantic similarity is low. Rewrite your professional summary and experience bullets to align more closely with the job description's context and terminology."
        )

    if keyword < 0.3:
        suggestions.append(
            "Keyword match is low. Identify the most important technical and soft skill keywords from the job description and incorporate them naturally into your resume."
        )

    if layout < 0.6:
        suggestions.append(
            "Improve your resume structure. Ensure you have clearly labeled sections: Summary, Experience, Education, Skills, Projects, and Certifications."
        )

    if missing:
        top_missing = missing[:5]
        suggestions.append(
            f"Add these missing skills to your resume if you have them: {', '.join(top_missing)}. "
            "Even brief mentions in project descriptions count."
        )

    if len(found) < 5:
        suggestions.append(
            "Your resume lists very few recognizable technical skills. Add a dedicated Skills section with relevant technologies, tools, and frameworks."
        )

    if not suggestions:
        suggestions.append(
            "Your resume is well-optimized! Consider quantifying your achievements with numbers (e.g., 'improved performance by 30%') to further stand out."
        )
        suggestions.append(
            "Use strong action verbs at the start of each bullet point: Developed, Architected, Optimized, Led, Delivered, Reduced, Increased."
        )

    suggestions.append(
        "Ensure your resume is in a clean, single-column ATS-friendly format. Avoid tables, graphics, and headers/footers that ATS systems may not parse correctly."
    )

    return suggestions
