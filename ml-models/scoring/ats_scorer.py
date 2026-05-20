"""
ATS Scoring Engine — Multi-Granularity Analysis

Scoring formula:
    ATS = 0.50 × semantic_score
        + 0.30 × keyword_score
        + 0.20 × layout_score

Each component is broken into sub-scores for transparency.
"""
from __future__ import annotations
import os
import re
from typing import Dict, Any, List, Optional


# ── Layout scorer ─────────────────────────────────────────────────────────────

def score_layout(path: str, text: str, sections_found: Dict[str, bool]) -> Dict[str, Any]:
    """
    Layout score breakdown:
      - section_coverage  (40%): how many key sections are present
      - file_size         (30%): optimal resume size 10KB–300KB
      - word_count        (20%): optimal 300–1500 words
      - formatting        (10%): bullet points, consistent structure
    """
    # Section coverage
    key_sections = ["experience", "education", "skills", "summary"]
    present = sum(1 for s in key_sections if sections_found.get(s, False))
    section_score = present / len(key_sections)

    # File size
    try:
        size = os.path.getsize(path)
        if 10_000 <= size <= 300_000:
            size_score = 1.0
        elif size < 10_000:
            size_score = size / 10_000
        else:
            size_score = max(0.3, 1.0 - (size - 300_000) / 500_000)
    except Exception:
        size_score = 0.5

    # Word count
    wc = len(text.split())
    if 300 <= wc <= 1500:
        wc_score = 1.0
    elif wc < 300:
        wc_score = wc / 300
    else:
        wc_score = max(0.5, 1.0 - (wc - 1500) / 2000)

    # Formatting: presence of bullet points / dashes
    bullet_lines = sum(1 for line in text.split("\n") if re.match(r"^\s*[•\-\*\u2022]", line))
    format_score = min(1.0, bullet_lines / 5)

    total = (
        0.40 * section_score +
        0.30 * size_score +
        0.20 * wc_score +
        0.10 * format_score
    )

    return {
        "layout_score": round(min(1.0, total), 4),
        "breakdown": {
            "section_coverage": round(section_score, 4),
            "file_size_score": round(size_score, 4),
            "word_count_score": round(wc_score, 4),
            "formatting_score": round(format_score, 4),
        },
        "word_count": wc,
        "sections_present": [s for s in key_sections if sections_found.get(s, False)],
        "sections_missing": [s for s in key_sections if not sections_found.get(s, False)],
    }


# ── Keyword scorer ────────────────────────────────────────────────────────────

def score_keywords(resume_text: str, jd_text: str, resume_skills: List[str]) -> Dict[str, Any]:
    """
    Keyword score breakdown:
      - tfidf_cosine    (60%): TF-IDF cosine similarity
      - skill_overlap   (40%): fraction of JD skills found in resume
    """
    from embeddings.semantic import tfidf_similarity

    tfidf = tfidf_similarity(resume_text, jd_text)

    # Skill overlap
    from parsers.extractor import extract_skills
    jd_skills = set(extract_skills(jd_text))
    resume_skill_set = set(resume_skills)
    if jd_skills:
        overlap = len(jd_skills & resume_skill_set) / len(jd_skills)
    else:
        overlap = tfidf

    total = 0.60 * tfidf + 0.40 * overlap
    missing = sorted(jd_skills - resume_skill_set)

    return {
        "keyword_score": round(min(1.0, total), 4),
        "breakdown": {
            "tfidf_cosine": round(tfidf, 4),
            "skill_overlap": round(overlap, 4),
        },
        "jd_skills": sorted(jd_skills),
        "matched_skills": sorted(jd_skills & resume_skill_set),
        "missing_skills": missing,
    }


# ── Quality scorer (no JD) ────────────────────────────────────────────────────

def score_quality(text: str, skills: List[str]) -> Dict[str, Any]:
    """
    Resume quality score when no JD is provided.
    Components:
      - skill_density   (35%): # recognized skills / 15
      - action_verbs    (25%): strong action verb count / 10
      - content_richness(25%): unique word ratio
      - quantification  (15%): presence of numbers/metrics
    """
    text_lower = text.lower()
    words = text.split()

    # Skill density
    skill_score = min(1.0, len(skills) / 15.0)

    # Action verbs
    action_verbs = [
        "developed", "built", "designed", "implemented", "created", "led",
        "managed", "optimized", "improved", "delivered", "architected",
        "deployed", "automated", "reduced", "increased", "achieved",
        "collaborated", "analyzed", "researched", "launched", "integrated",
        "maintained", "tested", "debugged", "refactored", "engineered",
        "spearheaded", "streamlined", "accelerated", "mentored", "scaled",
    ]
    verb_hits = sum(1 for v in action_verbs if v in text_lower)
    verb_score = min(1.0, verb_hits / 10.0)

    # Content richness
    if words:
        unique_ratio = len(set(w.lower() for w in words)) / max(len(words), 1)
        richness = min(1.0, unique_ratio / 0.65)
    else:
        richness = 0.0

    # Quantification: numbers, percentages, metrics
    quant_matches = re.findall(r'\b\d+[\.,]?\d*\s*(%|x|k|m|b|ms|s|hrs?|days?|months?|years?|users?|requests?|gb|tb|mb)?\b', text_lower)
    quant_score = min(1.0, len(quant_matches) / 5.0)

    total = (
        0.35 * skill_score +
        0.25 * verb_score +
        0.25 * richness +
        0.15 * quant_score
    )

    return {
        "quality_score": round(min(1.0, total), 4),
        "breakdown": {
            "skill_density": round(skill_score, 4),
            "action_verbs": round(verb_score, 4),
            "content_richness": round(richness, 4),
            "quantification": round(quant_score, 4),
        },
        "action_verb_count": verb_hits,
        "metric_count": len(quant_matches),
    }


# ── ATS score assembler ───────────────────────────────────────────────────────

def compute_ats_score(
    resume_path: str,
    resume_text: str,
    jd_text: str,
    resume_skills: List[str],
    sections_found: Dict[str, bool],
) -> Dict[str, Any]:
    """
    Compute the full ATS score with detailed breakdown.
    Returns all sub-scores and the final weighted ATS score.
    """
    has_jd = bool(jd_text and jd_text.strip())

    # Layout (always computed)
    layout_result = score_layout(resume_path, resume_text, sections_found)
    layout = layout_result["layout_score"]

    if has_jd:
        # Semantic similarity
        from embeddings.semantic import compute_similarity
        semantic = compute_similarity(resume_text, jd_text)

        # Keyword score
        from parsers.extractor import extract_skills as _extract_skills
        kw_result = score_keywords(resume_text, jd_text, resume_skills)
        keyword = kw_result["keyword_score"]
        missing_skills = kw_result["missing_skills"]
        jd_skills = kw_result["jd_skills"]
        matched_skills = kw_result["matched_skills"]
        kw_breakdown = kw_result["breakdown"]
        quality_result = {}
    else:
        # Quality mode
        quality_result = score_quality(resume_text, resume_skills)
        semantic = quality_result["quality_score"]
        keyword = quality_result["quality_score"]
        missing_skills = []
        jd_skills = []
        matched_skills = []
        kw_breakdown = {}

    # Final ATS score
    ats = 0.50 * semantic + 0.30 * keyword + 0.20 * layout

    return {
        "ats_score": round(ats * 100, 2),
        "semantic_score": round(semantic, 4),
        "keyword_match": round(keyword, 4),
        "layout_score": round(layout, 4),
        "jd_provided": has_jd,
        "missing_skills": missing_skills,
        "jd_skills": jd_skills,
        "matched_skills": matched_skills,
        "score_breakdown": {
            "semantic": round(semantic, 4),
            "keyword": kw_breakdown,
            "layout": layout_result["breakdown"],
            "quality": quality_result.get("breakdown", {}),
        },
        "layout_detail": layout_result,
    }
