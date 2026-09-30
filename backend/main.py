from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from resume_generator import generate_resume


# --------------------------------------------------
# FastAPI App
# --------------------------------------------------

app = FastAPI(
    title="AI Resume Maker API",
    description="AI-powered ATS-friendly resume generator",
    version="1.0.0"
)


# --------------------------------------------------
# CORS
# Allows Next.js frontend to communicate with FastAPI
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Request Model
# --------------------------------------------------

class ResumeRequest(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    location: str = ""
    education: list = []
    skills: list = []
    experience: list = []
    projects: list = []
    certifications: list = []
    target_job: str = ""


# --------------------------------------------------
# Home Route
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "AI Resume Maker API is running",
        "status": "online"
    }


# --------------------------------------------------
# Generate Resume
# --------------------------------------------------

@app.post("/generate-resume")
def create_resume(data: ResumeRequest):

    resume = generate_resume(data.model_dump())

    return {
        "success": True,
        "resume": resume
    }