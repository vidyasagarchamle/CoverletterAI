import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface GenerateCoverLetterRequest {
  job_description: string
  resume_text: string
  tone?: string
  personalization_level?: number
  additional_details?: string
}

export interface GenerateCoverLetterResponse {
  cover_letter: string
  matched_skills: string[]
  used_keywords: string[]
}

export const api = {
  async parseResume(resumeText: string): Promise<string> {
    const formData = new FormData()
    formData.append('resume_text', resumeText)
    
    const response = await apiClient.post('/parse-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.resume_text
  },

  async analyzeJob(jobDescription: string): Promise<any> {
    const formData = new FormData()
    formData.append('job_description', jobDescription)
    
    const response = await apiClient.post('/analyze-job', formData)
    return response.data
  },

  async generateCoverLetter(
    request: GenerateCoverLetterRequest
  ): Promise<GenerateCoverLetterResponse> {
    const response = await apiClient.post('/generate-cover-letter', request)
    return response.data
  },
} 