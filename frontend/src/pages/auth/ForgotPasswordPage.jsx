import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Shield, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import api from '../../lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err?.response?.data?.msg || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gem-gradient flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute inset-0 bg-gem-hero-gradient" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gem-blue flex items-center justify-center shadow-gem-glow">
            <Shield size={24} className="text-white" />
          </div>
        </div>

        <div className="glass-card p-8">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <h1 className="font-display font-bold text-2xl text-gem-white mb-2">Forgot Password?</h1>
                <p className="text-gem-muted font-body text-sm">
                  Enter your government email address. We'll send a reset link if the account exists.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-lg bg-gem-red/10 border border-gem-red/25 mb-5">
                  <p className="text-sm text-gem-red font-body">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Government Email Address"
                  type="email"
                  placeholder="you@ministry.gov.in"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  hint="Use the email registered with GeM BidVerify"
                />

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} iconRight={ChevronRight}>
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-gem-muted hover:text-gem-white font-body transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-gem-green/15 border border-gem-green/25 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={28} className="text-gem-green-light" />
              </div>
              <h2 className="font-display font-bold text-xl text-gem-white mb-2">Check your inbox</h2>
              <p className="text-gem-muted font-body text-sm mb-6 leading-relaxed">
                If an account exists for <span className="text-gem-white font-medium">{email}</span>,
                a password reset link has been sent. It expires in 15 minutes.
              </p>
              <p className="text-xs text-gem-muted font-body mb-6">
                Didn't receive it? Check your spam folder or contact your system administrator.
              </p>
              <Link to="/login">
                <Button variant="secondary" size="md" fullWidth icon={ArrowLeft}>
                  Back to Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gem-muted font-body mt-6">
          GeM BidVerify · Government of India
        </p>
      </div>
    </div>
  )
}
