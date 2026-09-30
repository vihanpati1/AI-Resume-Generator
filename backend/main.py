from fastapi import FastAPI
from pydantic import BaseModel

from resume_generator import generate_resume


# Create FastAPI application
app = FastAPI(
    title="AI Resume Maker API",
    description="AI-powered ATS-friendly resume generator",
    version="1.0.0"
)


# --------------------------------
# Request Model
# --------------------------------

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


# --------------------------------
# Home Route
# --------------------------------

@app.get("/")
def home():

    return {
        "message": "AI Resume Maker API is running",
        "status": "online"
    }


# --------------------------------
# Generate Resume
# --------------------------------

@app.post("/generate-resume")
def create_resume(data: ResumeRequest):

    resume = generate_resume(
        data.model_dump()
    )

    return {
        "success": True,
        "resume": resume
    }