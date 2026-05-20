from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("Resume", back_populates="owner")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resume_url = Column(String)
    job_title = Column(String, nullable=True)       # role the user applied for
    ats_score = Column(Float, nullable=True)
    semantic_score = Column(Float, nullable=True)
    keyword_match = Column(Float, nullable=True)
    layout_score = Column(Float, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="resumes")
    analysis = relationship("Analysis", back_populates="resume", uselist=False)

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    keywords = Column(JSON)
    missing_skills = Column(JSON)
    suggestions = Column(JSON)
    jd_provided = Column(Integer, default=0)  # 0=False, 1=True

    resume = relationship("Resume", back_populates="analysis")