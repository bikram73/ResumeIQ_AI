from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import uuid
import os
import shutil
import sys

from .database import get_db
from .models import Resume, Analysis, User
from .ai.pipeline import analyze_resume, generate_suggestions_for_result
from .auth import get_current_user

router = APIRouter()

BASE_DIR = os.path.dirname(__file__)
UPLOAD_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'uploads'))
os.makedirs(UPLOAD_DIR, exist_ok=True)

ML_PATH = os.path.abspath(os.path.join(BASE_DIR, '..', '..', '..', 'ml-models'))
if ML_PATH not in sys.path:
    sys.path.insert(0, ML_PATH)


# ── Upload ────────────────────────────────────────────────────────────────────

@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith('.pdf'):
        return JSONResponse({"detail": "Only PDF files are supported."}, status_code=400)

    uid = str(uuid.uuid4())
    filename = f"{uid}_{file.filename}"
    dest_path = os.path.join(UPLOAD_DIR, filename)

    with open(dest_path, "wb") as dest:
        shutil.copyfileobj(file.file, dest)

    db_resume = Resume(resume_url=dest_path, user_id=current_user.id)
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    return {"analysis_id": str(db_resume.id), "filename": file.filename}


# ── Analyze ───────────────────────────────────────────────────────────────────

@router.post("/analyze")
async def analyze(
    analysis_id: str = Form(...),
    job_description: str = Form(None),
    job_title: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        resume_id = int(analysis_id)
    except ValueError:
        return JSONResponse({"error": "invalid analysis_id format"}, status_code=400)

    db_resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == current_user.id
    ).first()
    if not db_resume:
        return JSONResponse({"error": "analysis_id not found"}, status_code=404)

    try:
        result = analyze_resume(db_resume.resume_url, job_description or "")

        db_resume.ats_score = result["ats_score"]
        db_resume.semantic_score = result["semantic_score"]
        db_resume.keyword_match = result["keyword_match"]
        db_resume.layout_score = result["layout_score"]
        if job_title and job_title.strip():
            db_resume.job_title = job_title.strip()

        db_analysis = db.query(Analysis).filter(Analysis.resume_id == resume_id).first()
        if not db_analysis:
            db_analysis = Analysis(resume_id=db_resume.id)
            db.add(db_analysis)

        db_analysis.keywords = result.get("extracted_skills", [])
        db_analysis.missing_skills = result.get("missing_skills", [])
        db_analysis.suggestions = result.get("suggestions", [])
        db_analysis.jd_provided = 1 if result.get("jd_provided") else 0

        db.commit()
        result["analysis_id"] = str(resume_id)
        return result

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# ── Results ───────────────────────────────────────────────────────────────────

@router.get("/results/{analysis_id}")
def get_results(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        resume_id = int(analysis_id)
    except ValueError:
        return JSONResponse({"error": "invalid analysis_id format"}, status_code=400)

    db_resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == current_user.id
    ).first()
    if not db_resume:
        return JSONResponse({"error": "not found"}, status_code=404)

    db_analysis = db.query(Analysis).filter(Analysis.resume_id == resume_id).first()

    return {
        "ats_score": db_resume.ats_score,
        "semantic_score": db_resume.semantic_score,
        "keyword_match": db_resume.keyword_match,
        "layout_score": db_resume.layout_score,
        "job_title": db_resume.job_title,
        "extracted_skills": db_analysis.keywords if db_analysis else [],
        "missing_skills": db_analysis.missing_skills if db_analysis else [],
        "jd_provided": bool(db_analysis.jd_provided) if db_analysis else False,
    }


# ── Resume history ────────────────────────────────────────────────────────────

@router.get("/resumes")
def get_resume_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "job_title": r.job_title,
            "ats_score": r.ats_score,
            "semantic_score": r.semantic_score,
            "keyword_match": r.keyword_match,
            "layout_score": r.layout_score,
            "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None,
        }
        for r in resumes
    ]


# ── Delete ────────────────────────────────────────────────────────────────────

@router.delete("/resumes/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == current_user.id
    ).first()
    if not db_resume:
        return JSONResponse({"error": "not found"}, status_code=404)

    # Delete analysis record
    db.query(Analysis).filter(Analysis.resume_id == resume_id).delete()

    # Delete file from disk
    if db_resume.resume_url and os.path.exists(db_resume.resume_url):
        try:
            os.remove(db_resume.resume_url)
        except Exception:
            pass

    db.delete(db_resume)
    db.commit()
    return {"deleted": True, "id": resume_id}


# ── Suggestions ───────────────────────────────────────────────────────────────

@router.get("/suggestions/{analysis_id}")
def get_suggestions(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        resume_id = int(analysis_id)
    except ValueError:
        return JSONResponse({"error": "invalid analysis_id"}, status_code=400)

    db_resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == current_user.id
    ).first()
    if not db_resume:
        return JSONResponse({"error": "not found"}, status_code=404)

    db_analysis = db.query(Analysis).filter(Analysis.resume_id == resume_id).first()
    return {"suggestions": db_analysis.suggestions if db_analysis else []}


# ── Role recommendations ──────────────────────────────────────────────────────

@router.get("/roles/{analysis_id}")
def get_role_recommendations(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        resume_id = int(analysis_id)
    except ValueError:
        return JSONResponse({"error": "invalid analysis_id"}, status_code=400)

    db_resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == current_user.id
    ).first()
    if not db_resume:
        return JSONResponse({"error": "not found"}, status_code=404)

    db_analysis = db.query(Analysis).filter(Analysis.resume_id == resume_id).first()
    skills = db_analysis.keywords if db_analysis else []

    try:
        from recommendation.engine import recommend_roles
        roles = recommend_roles(skills, top_n=5)
    except Exception:
        roles = []

    return {"role_recommendations": roles}


# ── Rescore ───────────────────────────────────────────────────────────────────

@router.post("/rescore/{analysis_id}")
def rescore_resume(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        resume_id = int(analysis_id)
    except ValueError:
        return JSONResponse({"error": "invalid analysis_id"}, status_code=400)

    db_resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == current_user.id
    ).first()
    if not db_resume:
        return JSONResponse({"error": "not found"}, status_code=404)

    if not os.path.exists(db_resume.resume_url):
        return JSONResponse({"error": "resume file not found on disk"}, status_code=404)

    try:
        result = analyze_resume(db_resume.resume_url, "")

        db_resume.ats_score = result["ats_score"]
        db_resume.semantic_score = result["semantic_score"]
        db_resume.keyword_match = result["keyword_match"]
        db_resume.layout_score = result["layout_score"]

        db_analysis = db.query(Analysis).filter(Analysis.resume_id == resume_id).first()
        if not db_analysis:
            db_analysis = Analysis(resume_id=db_resume.id)
            db.add(db_analysis)

        db_analysis.keywords = result.get("extracted_skills", [])
        db_analysis.missing_skills = result.get("missing_skills", [])
        db_analysis.suggestions = result.get("suggestions", [])
        db_analysis.jd_provided = 0

        db.commit()
        result["analysis_id"] = str(resume_id)
        return result
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
