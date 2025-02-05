from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from openai import OpenAI
from mangum import Mangum

# Load environment variables
load_dotenv(override=True)  # Force reload of environment variables

# Initialize FastAPI app
app = FastAPI(title="Cover Letter Personalizer API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure OpenAI
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("ERROR: OPENAI_API_KEY environment variable is not set")
    raise ValueError("OPENAI_API_KEY environment variable is not set")

print(f"API Key loaded successfully (first 10 chars): {api_key[:10]}...")

# Initialize OpenAI client
client = OpenAI(
    api_key=api_key
)

# Models
class CoverLetterRequest(BaseModel):
    job_description: str
    resume_text: str
    tone: Optional[str] = "professional"
    personalization_level: Optional[float] = 0.5
    additional_details: Optional[str] = None

class CoverLetterResponse(BaseModel):
    cover_letter: str

# Routes
@app.post("/api/parse-resume")
async def parse_resume(resume_text: str = Form(...)):
    """
    Parse resume text and extract relevant information
    """
    try:
        if not resume_text:
            raise HTTPException(status_code=400, detail="Resume text is required")
        
        # For now, just return the text as successfully parsed
        return {
            "message": "Resume parsed successfully",
            "resume_text": resume_text
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/analyze-job")
async def analyze_job_description(job_description: str = Form(...)):
    """
    Analyze job description to extract key requirements and skills
    """
    try:
        if not job_description:
            raise HTTPException(status_code=400, detail="Job description is required")
            
        return {
            "message": "Job description analyzed successfully",
            "job_description": job_description
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/generate-cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(request: CoverLetterRequest):
    """
    Generate a personalized cover letter based on resume and job description
    """
    try:
        if not request.resume_text or not request.job_description:
            raise HTTPException(status_code=400, detail="Both resume and job description are required")

        # Verify OpenAI API key is set
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key is not configured")

        # Construct the prompt
        additional_details_section = f"\nAdditional Details to Include:\n{request.additional_details}" if request.additional_details else ""
        
        prompt = f"""
        Generate a professional cover letter based on the following:
        
        Job Description:
        {request.job_description}
        
        Resume:
        {request.resume_text}
        
        Tone: {request.tone}
        Personalization Level: {request.personalization_level}
        {additional_details_section}
        
        The cover letter should:
        1. Match relevant skills and experiences from the resume with job requirements
        2. Use ATS-friendly keywords from the job description
        3. Be written in a {request.tone} tone
        4. Be properly structured with an introduction, body, and conclusion
        5. Incorporate any additional details provided in a natural way
        """
        
        try:
            # Generate cover letter using OpenAI
            print(f"Making API call to OpenAI...")
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are a professional cover letter writer."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Extract the generated cover letter
            cover_letter = response.choices[0].message.content
            
            return CoverLetterResponse(
                cover_letter=cover_letter
            )
        except Exception as openai_error:
            print(f"OpenAI API Error: {str(openai_error)}")
            raise HTTPException(status_code=500, detail=f"Error calling OpenAI API: {str(openai_error)}")
            
    except HTTPException as http_error:
        print(f"HTTP Exception: {str(http_error)}")
        raise http_error
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}

# Add Mangum handler
handler = Mangum(app) 