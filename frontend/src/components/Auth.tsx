import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, X, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { auth } from '../lib/supabase'

interface AuthProps {
  onClose: () => void
}

export function Auth({ onClose }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = isSignUp 
        ? await auth.signUp(email, password)
        : await auth.signIn(email, password)

      if (error) throw error

      toast.success(isSignUp ? 'Account created successfully!' : 'Signed in successfully!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const { error } = await auth.signInWithGoogle()
      if (error) {
        if (error.message.includes('provider is not enabled')) {
          toast.error('Google sign-in is not enabled. Please try email/password sign-in.')
        } else {
          toast.error(error.message)
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      toast.error('Failed to sign in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full space-y-8 p-6 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignUp 
            ? 'Already have an account?' 
            : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">Or continue with email</span>
          </div>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4 rounded-md">
          <div>
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input-field mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              className="input-field mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <motion.button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {isSignUp ? 'Creating account...' : 'Signing in...'}
            </>
          ) : (
            <>
              <Mail className="h-5 w-5" />
              {isSignUp ? 'Create Account' : 'Sign In'}
            </>
          )}
        </motion.button>
      </form>
    </div>
  )
} 