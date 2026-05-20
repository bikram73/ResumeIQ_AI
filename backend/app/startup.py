"""
Startup tasks — runs once when the FastAPI server starts.

Fixes stale resume scores in the DB:
  - Resumes with jd_provided=1 but no job description stored (semantic ≈ keyword)
    were scored incorrectly. Re-score them in quality mode.
  - Resumes with ats_score < 5 (near-zero) are clearly wrong — re-score.
  - Resumes whose file still exists get a fresh quality-mode score.
"""
from __future__ import annotations
import os
import sys
import logging

logger = logging.getLogger("resumeiq.startup")


def _add_ml_path():
    ml_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml-models")
    )
    if ml_path not in sys.path:
        sys.path.insert(0, ml_path)


def rescore_stale_resumes():
    """
    Re-score resumes that have wrong/stale scores.
    A score is considered stale if:
      - ats_score is None or < 5  (near-zero = old broken pipeline)
      - jd_provided=1 but semantic_score == keyword_match (means quality mode
        was run but flagged as JD mode — old bug)
    """
    _add_ml_path()

    try:
        from app.ai.pipeline import analyze_resume
        from app.database import SessionLocal
        from app.models import Resume, Analysis
    except Exception as e:
        logger.warning(f"Startup rescore skipped — import error: {e}")
        return

    db = SessionLocal()
    try:
        resumes = db.query(Resume).all()
        fixed = 0

        for r in resumes:
            if not r.resume_url or not os.path.exists(r.resume_url):
                continue

            # Detect stale score conditions
            is_stale = (
                r.ats_score is None
                or r.ats_score < 5.0
                or (
                    # Old bug: jd_provided=1 but semantic == keyword (quality mode mislabeled)
                    r.semantic_score is not None
                    and r.keyword_match is not None
                    and abs(r.semantic_score - r.keyword_match) < 0.001
                    and r.semantic_score < 0.15  # low quality score = old broken run
                )
            )

            if not is_stale:
                continue

            try:
                result = analyze_resume(r.resume_url, "")
                r.ats_score = result["ats_score"]
                r.semantic_score = result["semantic_score"]
                r.keyword_match = result["keyword_match"]
                r.layout_score = result["layout_score"]

                analysis = db.query(Analysis).filter(Analysis.resume_id == r.id).first()
                if analysis:
                    analysis.keywords = result.get("extracted_skills", [])
                    analysis.missing_skills = result.get("missing_skills", [])
                    analysis.suggestions = result.get("suggestions", [])
                    analysis.jd_provided = 0  # quality mode — no JD

                fixed += 1
                logger.info(f"Re-scored resume {r.id}: ATS={result['ats_score']}%")
            except Exception as e:
                logger.warning(f"Failed to re-score resume {r.id}: {e}")

        if fixed > 0:
            db.commit()
            logger.info(f"Startup rescore complete — fixed {fixed} resume(s)")
        else:
            logger.info("Startup rescore — all scores look correct, nothing to fix")

    except Exception as e:
        logger.warning(f"Startup rescore error: {e}")
    finally:
        db.close()
