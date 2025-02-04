import { useState, useEffect } from 'react'
import { FileText, Sparkles, Zap, Shield, Bot, Copy, Loader2, Wand2, LogOut } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { api } from './api/client'
import { motion } from 'framer-motion'
import { auth } from './lib/supabase'
import { db } from './lib/supabase'
import { History } from './components/History'
import { Auth } from './components/Auth'
import { User } from '@supabase/supabase-js'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [tone, setTone] = useState('professional')
  const [coverLetter, setCoverLetter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [additionalDetails, setAdditionalDetails] = useState('')
  const [matchedSkills, setMatchedSkills] = useState<string[]>([])
  const [usedKeywords, setUsedKeywords] = useState<string[]>([])

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setShowAuth(false) // Hide auth dialog when user signs in
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleResumeChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setResumeText(text)
    try {
      await api.parseResume(text)
      toast.success('Resume parsed successfully!')
    } catch (error) {
      console.error('Error parsing resume:', error)
      toast.error('Error parsing resume. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setShowAuth(true)
      return
    }

    if (!resumeText.trim()) {
      toast.error('Please enter your resume text!')
      return
    }
    if (!jobDescription.trim()) {
      toast.error('Please enter the job description!')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.generateCoverLetter({
        job_description: jobDescription,
        resume_text: resumeText,
        tone,
        personalization_level: 0.8,
        additional_details: additionalDetails
      })

      setCoverLetter(response.cover_letter)
      setMatchedSkills(response.matched_skills)
      setUsedKeywords(response.used_keywords)

      // Save to database
      if (user) {
        try {
          const { error: dbError } = await db.coverLetters.create({
            user_id: user.id,
            job_description: jobDescription,
            resume_text: resumeText,
            cover_letter: response.cover_letter,
            tone,
            matched_skills: response.matched_skills || [],
            used_keywords: response.used_keywords || []
          })
          
          if (dbError) {
            console.error('Error saving to database:', dbError)
            toast.error('Cover letter generated but failed to save to history')
          }
        } catch (error) {
          console.error('Error saving to database:', error)
          toast.error('Cover letter generated but failed to save to history')
        }
      }

      toast.success('Cover letter generated successfully!')
    } catch (error) {
      console.error('Error generating cover letter:', error)
      toast.error('Error generating cover letter. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      {/* Header */}
      <motion.header 
        className="border-b bg-gradient-to-b from-primary-50/50 to-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="logo-container"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileText className="logo-icon-main" strokeWidth={1.5} />
              <span className="logo-text">coverletterAI</span>
            </motion.div>
            
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-6">
                <a href="#generate" className="text-sm font-medium text-muted-foreground hover:text-primary-600 transition-colors">
                  Generate
                </a>
              </nav>
              {user && (
                <button
                  onClick={() => auth.signOut()}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="hero-title">
            Craft the Perfect Cover Letter<br />in Seconds with AI
          </h2>
          <p className="hero-subtitle mx-auto">
            Transform your job application with personalized, ATS-friendly cover letters 
            powered by advanced AI technology. Stand out from the crowd and land your dream job.
          </p>
          <motion.div 
            className="mt-8 flex gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <a href="#generate" className="btn-primary">
              Get Started
              <Wand2 className="ml-2 h-4 w-4" />
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="p-6">
              <Sparkles className="feature-icon" />
              <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
              <p className="text-muted-foreground">Advanced AI technology to generate personalized cover letters</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-6">
              <FileText className="feature-icon" />
              <h3 className="font-semibold text-lg mb-2">ATS-Friendly</h3>
              <p className="text-muted-foreground">Optimized for Applicant Tracking Systems</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="p-6">
              <Zap className="feature-icon" />
              <h3 className="font-semibold text-lg mb-2">Instant Results</h3>
              <p className="text-muted-foreground">Generate your cover letter in seconds</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="p-6">
              <Shield className="feature-icon" />
              <h3 className="font-semibold text-lg mb-2">Privacy First</h3>
              <p className="text-muted-foreground">Your data is always secure and private</p>
            </div>
          </motion.div>
        </div>
      </section>

      <main id="generate" className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Create Your Cover Letter</h2>
                <p className="card-description">Fill in the details below to generate your personalized cover letter</p>
              </div>
              <div className="card-content space-y-6">
                <div>
                  <label htmlFor="resume-text" className="form-label flex items-center gap-2">
                    Resume Text
                    <span className="text-xs text-muted-foreground">(Required)</span>
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="resume-text"
                      rows={8}
                      className="input-field"
                      value={resumeText}
                      onChange={handleResumeChange}
                      placeholder="Paste your resume text here..."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="job-description" className="form-label flex items-center gap-2">
                    Job Description
                    <span className="text-xs text-muted-foreground">(Required)</span>
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="job-description"
                      rows={8}
                      className="input-field"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here..."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="additional-details" className="form-label flex items-center gap-2">
                    Additional Details
                    <span className="text-xs text-muted-foreground">(Optional)</span>
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="additional-details"
                      rows={4}
                      className="input-field"
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      placeholder="Add any additional details you'd like to include..."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tone" className="form-label">Writing Style</label>
                  <select
                    id="tone"
                    className="input-field mt-2"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <option value="professional">Professional & Formal</option>
                    <option value="conversational">Friendly & Conversational</option>
                    <option value="confident">Confident & Bold</option>
                    <option value="enthusiastic">Enthusiastic & Passionate</option>
                    <option value="analytical">Analytical & Detail-oriented</option>
                    <option value="creative">Creative & Innovative</option>
                    <option value="leadership">Leadership & Executive</option>
                    <option value="technical">Technical & Precise</option>
                  </select>
                </div>

                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="btn-primary w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      Generate Cover Letter
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Output Section */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="card-title">Generated Cover Letter</h2>
                {coverLetter && (
                  <motion.button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(coverLetter)
                      toast.success('Copied to clipboard!')
                    }}
                    className="text-primary-600 hover:text-primary-500 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Copy className="h-5 w-5" />
                  </motion.button>
                )}
              </div>
              <p className="card-description">Your personalized cover letter will appear here</p>
            </div>
            <div className="card-content">
              {coverLetter ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-foreground bg-muted rounded-lg p-4">
                      {coverLetter}
                    </pre>
                  </div>
                  {((matchedSkills && matchedSkills.length > 0) || (usedKeywords && usedKeywords.length > 0)) && (
                    <motion.div 
                      className="mt-6 border-t border-border pt-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {matchedSkills && matchedSkills.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-foreground">Matched Skills</h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {matchedSkills.map((skill, index) => (
                              <motion.span
                                key={skill}
                                className="inline-flex items-center rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-600/20"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                              >
                                {skill}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      )}
                      {usedKeywords && usedKeywords.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-foreground">ATS Keywords Used</h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {usedKeywords.map((keyword, index) => (
                              <motion.span
                                key={keyword}
                                className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-secondary/20"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                              >
                                {keyword}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your AI-generated cover letter will appear here
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* History Section */}
        <section className="mt-16">
          <History user={user} />
        </section>
      </main>

      {/* Auth Dialog */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg">
            <Auth onClose={() => setShowAuth(false)} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <span className="text-lg font-medium text-foreground">coverletterAI</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Empowering job seekers with professional cover letters that make a lasting impression.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
