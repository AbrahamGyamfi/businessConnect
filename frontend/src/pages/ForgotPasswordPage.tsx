import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Church, Mail, ArrowLeft } from 'lucide-react'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await authClient.forgetPassword({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) { setError(error.message ?? 'Something went wrong'); return }
    setSent(true)
  }

  return (
    <main className="min-h-svh bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border/60 shadow-xl shadow-primary/5 p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-3 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <Church className="h-7 w-7 text-white" />
              </div>
            </Link>
            {sent ? (
              <>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mt-4">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mt-4">Check your email</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  We sent a password reset link to <strong className="text-foreground">{email}</strong>.
                  Check your inbox and follow the link.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground mt-4">Forgot password?</h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Enter your email and we'll send you a reset link.
                </p>
              </>
            )}
          </div>

          {!sent && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="font-medium">Email address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoComplete="email" placeholder="you@example.com"
                  className="h-11 border-border/60 focus:border-primary/50" />
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                  <p className="text-sm text-destructive font-medium" role="alert">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={loading}
                className="w-full h-11 mt-1 shadow-md shadow-primary/20 font-medium">
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          )}

          {sent && (
            <Button variant="outline" className="w-full h-11" asChild>
              <Link to="/sign-in">Back to Sign In</Link>
            </Button>
          )}
        </div>

        <p className="text-center mt-6">
          <Link to="/sign-in" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
