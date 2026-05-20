"""
Semantic similarity module.
Supports two modes:
  - "sbert"  : sentence-transformers all-MiniLM-L6-v2 (accurate, needs ~90MB RAM)
  - "tfidf"  : TF-IDF cosine similarity (fast, no extra deps)
"""
from __future__ import annotations
import os
from typing import Optional

_sbert_model = None


def _get_sbert():
    global _sbert_model
    if _sbert_model is not None:
        return _sbert_model
    try:
        from sentence_transformers import SentenceTransformer
        _sbert_model = SentenceTransformer("all-MiniLM-L6-v2")
    except Exception:
        _sbert_model = None
    return _sbert_model


def sbert_similarity(text_a: str, text_b: str) -> float:
    """Cosine similarity via SBERT embeddings. Returns 0.0 on failure."""
    model = _get_sbert()
    if model is None:
        return tfidf_similarity(text_a, text_b)
    try:
        from sentence_transformers import util
        e1 = model.encode(text_a, convert_to_tensor=True)
        e2 = model.encode(text_b, convert_to_tensor=True)
        return float(util.cos_sim(e1, e2).item())
    except Exception:
        return tfidf_similarity(text_a, text_b)


def tfidf_similarity(text_a: str, text_b: str) -> float:
    """TF-IDF cosine similarity. Fast fallback."""
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        import numpy as np
        vec = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            max_features=8000,
        ).fit([text_a, text_b])
        m = vec.transform([text_a, text_b]).toarray()
        a, b = m[0], m[1]
        denom = np.linalg.norm(a) * np.linalg.norm(b)
        return float(np.dot(a, b) / denom) if denom else 0.0
    except Exception:
        return 0.0


def compute_similarity(text_a: str, text_b: str, mode: Optional[str] = None) -> float:
    """
    Compute semantic similarity between two texts.
    mode: "sbert" | "tfidf" | None (reads RESUMEIQ_SEMANTIC_MODE env var, default tfidf)
    """
    if not text_a or not text_b:
        return 0.0
    m = (mode or os.getenv("RESUMEIQ_SEMANTIC_MODE", "tfidf")).lower()
    if m == "sbert":
        return sbert_similarity(text_a, text_b)
    return tfidf_similarity(text_a, text_b)


def keyword_overlap(resume_text: str, jd_text: str) -> float:
    """
    Keyword-level overlap: fraction of JD keywords present in resume.
    Complements semantic similarity with exact term matching.
    """
    if not resume_text or not jd_text:
        return 0.0
    try:
        from sklearn.feature_extraction.text import CountVectorizer
        import numpy as np
        cv = CountVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            max_features=5000,
        ).fit([jd_text])
        jd_terms = set(cv.get_feature_names_out())
        resume_lower = resume_text.lower()
        hits = sum(1 for t in jd_terms if t in resume_lower)
        return round(hits / max(len(jd_terms), 1), 4)
    except Exception:
        return tfidf_similarity(resume_text, jd_text)
