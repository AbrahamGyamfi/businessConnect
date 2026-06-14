import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Church, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token found. Please use the link from your email.')
      return
    }

    authClient.verifyEmail({ query: { token } })
      .then(({ error }) => {
        if (error) {
          setStatus('error')
          setMessage(error.message ?? 'Verification failed. The link may have expired.')
        } else {
          setStatus('success')
          // autoSignInAfterVerification creates the session — go straight to dashboard
          setTimeout(() => navigate('/dashboard', { replace: true }), 2000)
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
      })
  }, [token, navigate])

  return (
    <main className="min-h-svh bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border/60 shadow-xl shadow-primary/5 p-8 text-center">
          <Link to="/" className="inline-flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
              <Church className="h-7 w-7 text-white" />
            </div>
          </Link>

          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Verifying your email…</h1>
              <p className="text-muted-foreground">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Email verified!</h1>
              <p className="text-muted-foreground mb-6">Your email has been verified. Redirecting to your dashboard…</p>
              <Button className="w-full" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Verification failed</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <Button className="w-full" asChild>
                  <Link to="/dashboard">Continue to Dashboard</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/sign-in">Sign In</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
