import PyPDF2
from docx import Document
import io
from typing import List, Dict
import re

def extract_text_from_pdf(pdf_content: bytes) -> str:
    """
    Extract text content from a PDF file
    """
    pdf_file = io.BytesIO(pdf_content)
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def extract_text_from_docx(docx_content: bytes) -> str:
    """
    Extract text content from a DOCX file
    """
    doc = Document(io.BytesIO(docx_content))
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def extract_skills(text: str) -> List[str]:
    """
    Extract skills from text using common patterns and keywords
    """
    # Common skill-related keywords
    skill_indicators = [
        "skills", "technologies", "proficient in", "experience with",
        "knowledge of", "expertise in", "familiar with", "competencies"
    ]
    
    # Common technical and soft skills (extend this list based on your needs)
    common_skills = [
        "python", "javascript", "java", "c\\+\\+", "react", "node.js",
        "sql", "aws", "docker", "kubernetes", "agile", "scrum",
        "leadership", "communication", "problem solving", "teamwork"
    ]
    
    # Create a pattern to match skills
    skill_pattern = "|".join(common_skills)
    found_skills = set()
    
    # Find skills using regex
    matches = re.finditer(skill_pattern, text.lower())
    for match in matches:
        found_skills.add(match.group(0))
    
    return list(found_skills)

def extract_job_requirements(job_description: str) -> Dict[str, List[str]]:
    """
    Extract key requirements and preferred qualifications from job description
    """
    requirements = {
        "required": [],
        "preferred": [],
        "responsibilities": []
    }
    
    # Split text into sections
    sections = job_description.lower().split("\n")
    
    current_section = None
    for line in sections:
        if "required" in line or "requirements" in line:
            current_section = "required"
        elif "preferred" in line or "nice to have" in line:
            current_section = "preferred"
        elif "responsibilities" in line or "duties" in line:
            current_section = "responsibilities"
        elif current_section and line.strip():
            # Add non-empty lines to current section
            if line.strip().startswith("•") or line.strip().startswith("-"):
                requirements[current_section].append(line.strip()[1:].strip())
            else:
                requirements[current_section].append(line.strip())
    
    return requirements

def match_skills_with_requirements(
    resume_skills: List[str],
    job_requirements: Dict[str, List[str]]
) -> Dict[str, List[str]]:
    """
    Match extracted skills from resume with job requirements
    """
    matches = {
        "strong_matches": [],
        "partial_matches": [],
        "missing_skills": []
    }
    
    # Convert skills to lowercase for comparison
    resume_skills_lower = [skill.lower() for skill in resume_skills]
    
    # Check required skills
    for req in job_requirements["required"]:
        req_lower = req.lower()
        if any(skill in req_lower for skill in resume_skills_lower):
            matches["strong_matches"].append(req)
        else:
            matches["missing_skills"].append(req)
    
    # Check preferred skills
    for pref in job_requirements["preferred"]:
        pref_lower = pref.lower()
        if any(skill in pref_lower for skill in resume_skills_lower):
            matches["partial_matches"].append(pref)
    
    return matches 