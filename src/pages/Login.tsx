import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const result =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, name)

    setSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="pb-8">
      <header className="flex items-center px-6 pt-5 pb-2">
        <Link
          to="/"
          className="w-10 h-10 flex items-center justify-center -ml-2"
          aria-label="Back"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="flex-1 text-center text-lg font-extrabold -ml-10">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="bg-dark rounded-2xl p-6 mx-6 mt-4">
        {mode === 'signup' && (
          <div className="mb-4">
            <label className="block text-xs text-gray uppercase tracking-widest font-semibold mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full bg-charcoal rounded-xl px-4 py-4 text-white placeholder:text-gray/60 outline-none focus:ring-2 focus:ring-electric/40"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs text-gray uppercase tracking-widest font-semibold mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            className="w-full bg-charcoal rounded-xl px-4 py-4 text-white placeholder:text-gray/60 outline-none focus:ring-2 focus:ring-electric/40"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray uppercase tracking-widest font-semibold mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full bg-charcoal rounded-xl px-4 py-4 text-white placeholder:text-gray/60 outline-none focus:ring-2 focus:ring-electric/40"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full bg-electric text-black rounded-[14px] py-4 font-extrabold text-base transition-opacity ${
            submitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {submitting
            ? 'Loading...'
            : mode === 'signin'
              ? 'Sign In'
              : 'Create Account'}
        </button>

        <p className="text-center text-sm text-gray mt-4">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null) }}
                className="text-electric font-bold"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null) }}
                className="text-electric font-bold"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  )
}
