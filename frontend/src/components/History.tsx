import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Copy, Trash2 } from 'lucide-react'
import { db } from '../lib/supabase/index'
import { User } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

interface CoverLetter {
  id: number
  created_at: string
  job_description: string
  resume_text: string
  cover_letter: string
  tone: string
  matched_skills: string[]
  used_keywords: string[]
}

interface HistoryProps {
  user: User | null
}

export function History({ user }: HistoryProps) {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadCoverLetters()
    } else {
      setCoverLetters([])
      setLoading(false)
    }
  }, [user])

  const loadCoverLetters = async () => {
    try {
      const { data, error } = await db.coverLetters.getByUserId(user!.id)
      if (error) throw error
      setCoverLetters(data || [])
    } catch (error: any) {
      toast.error('Failed to load cover letters')
      console.error('Error loading cover letters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const { error } = await db.coverLetters.delete(id, user!.id)
      if (error) throw error
      setCoverLetters(coverLetters.filter(cl => cl.id !== id))
      toast.success('Cover letter deleted successfully')
    } catch (error: any) {
      toast.error('Failed to delete cover letter')
      console.error('Error deleting cover letter:', error)
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Clock className="h-8 w-8 animate-spin mx-auto text-primary-600" />
        <p className="mt-2 text-muted-foreground">Loading your cover letters...</p>
      </div>
    )
  }

  if (coverLetters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No cover letters found. Generate your first one!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Your Cover Letters</h2>
      <div className="grid gap-6">
        {coverLetters.map((cl) => (
          <motion.div
            key={cl.id}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Cover Letter</h3>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(cl.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => {
                      navigator.clipboard.writeText(cl.cover_letter)
                      toast.success('Copied to clipboard!')
                    }}
                    className="text-primary-600 hover:text-primary-500 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Copy className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(cl.id)}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </div>
            <div className="card-content">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-foreground bg-muted rounded-lg p-4">
                  {cl.cover_letter}
                </pre>
              </div>
              {(cl.matched_skills.length > 0 || cl.used_keywords.length > 0) && (
                <div className="mt-6 border-t border-border pt-4">
                  {cl.matched_skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-foreground">Matched Skills</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {cl.matched_skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-600/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {cl.used_keywords.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground">ATS Keywords Used</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {cl.used_keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-secondary/20"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 