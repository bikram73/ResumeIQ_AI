import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from . import resume
from . import auth

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("resumeiq")

# Create database tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup tasks before serving requests."""
    logger.info("ResumeIQ starting up — running startup checks...")
    try:
        from .startup import rescore_stale_resumes
        rescore_stale_resumes()
    except Exception as e:
        logger.warning(f"Startup task failed (non-fatal): {e}")
    yield
    logger.info("ResumeIQ shutting down.")


app = FastAPI(title="ResumeIQ AI Backend", lifespan=lifespan)

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
