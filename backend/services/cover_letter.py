from typing import Dict, List
import openai
import os
from ..utils.parser import extract_skills, extract_job_requirements, match_skills_with_requirements

class CoverLetterService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    def generate_cover_letter(
        self,
        resume_text: str,
        job_description: str,
        tone: str = "professional",
        personalization_level: float = 0.5
    ) -> Dict[str, any]:
        """
        Generate a personalized cover letter based on resume and job description
        """
        # Extract skills and requirements
        resume_skills = extract_skills(resume_text)
        job_reqs = extract_job_requirements(job_description)
        
        # Match skills with requirements
        skill_matches = match_skills_with_requirements(resume_skills, job_reqs)
        
        # Adjust the temperature based on personalization level
        temperature = 0.3 + (personalization_level * 0.4)  # Range: 0.3 to 0.7
        
        # Construct the system message based on tone
        system_messages = {
            "professional": "You are a professional cover letter writer who creates formal and polished content.",
            "conversational": "You are a cover letter writer who creates engaging and personable content while maintaining professionalism.",
            "persuasive": "You are a persuasive cover letter writer who creates compelling content that emphasizes achievements and value proposition."
        }
        
        system_message = system_messages.get(tone, system_messages["professional"])
        
        # Construct the prompt
        prompt = f"""
        Create a compelling cover letter that demonstrates my fit for this role.
        
        Job Description:
        {job_description}
        
        My Background (from resume):
        {resume_text}
        
        Matched Skills:
        Strong Matches: {', '.join(skill_matches['strong_matches'])}
        Partial Matches: {', '.join(skill_matches['partial_matches'])}
        
        Guidelines:
        1. Focus on the strong and partial skill matches identified above
        2. Address how I can contribute to the company's needs
        3. Use specific examples from my resume to support claims
        4. Maintain a {tone} tone throughout
        5. Keep it concise and impactful
        6. Include a strong opening and closing
        7. Make it ATS-friendly by naturally incorporating key terms
        """
        
        # Generate the cover letter
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
        )
        
        cover_letter = response.choices[0].message.content
        
        # Extract used keywords for ATS optimization
        used_keywords = self._extract_used_keywords(cover_letter, job_reqs)
        
        return {
            "cover_letter": cover_letter,
            "matched_skills": resume_skills,
            "used_keywords": used_keywords
        }
    
    def _extract_used_keywords(
        self,
        cover_letter: str,
        job_requirements: Dict[str, List[str]]
    ) -> List[str]:
        """
        Extract keywords from the cover letter that match job requirements
        """
        used_keywords = set()
        cover_letter_lower = cover_letter.lower()
        
        # Check all requirements sections
        for section in job_requirements.values():
            for req in section:
                # Split requirement into words and check each
                words = req.lower().split()
                for word in words:
                    if len(word) > 3 and word in cover_letter_lower:  # Ignore small words
                        used_keywords.add(word)
        
        return list(used_keywords) 