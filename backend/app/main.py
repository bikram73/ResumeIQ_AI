from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from . import resume
from . import auth

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ResumeIQ AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router)
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
