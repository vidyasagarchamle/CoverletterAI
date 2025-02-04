# Cover Letter Personalizer

An AI-powered tool that generates highly personalized cover letters by analyzing your resume and job descriptions.

## Features

- Extract skills and experience from resumes (PDF/DOCX)
- Analyze job descriptions for key requirements
- Generate ATS-friendly cover letters
- Customize tone and personalization level
- Multiple output formats (PDF, DOCX, plain text)

## Setup

1. Clone the repository
2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the root directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. The API will be available at `http://localhost:8000`

## API Endpoints

- `POST /api/parse-resume`: Parse resume file (PDF/DOCX)
- `POST /api/analyze-job`: Analyze job description
- `POST /api/generate-cover-letter`: Generate personalized cover letter
- `GET /api/health`: Health check endpoint

## Usage Example

```python
import requests

# Generate a cover letter
response = requests.post(
    "http://localhost:8000/api/generate-cover-letter",
    json={
        "job_description": "Your job description here...",
        "resume_text": "Your resume text here...",
        "tone": "professional",
        "personalization_level": 0.7
    }
)

print(response.json()) 