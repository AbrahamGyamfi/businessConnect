import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Church, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setError(null)
    setLoading(true)
    const { error } = await authClient.resetPassword({ newPassword: password, token })
    setLoading(false)
    if (error) { setError(error.message ?? 'Something went wrong'); return }
    setDone(true)
    setTimeout(() => navigate('/sign-in'), 2500)
  }

  if (!token) {
    return (
      <main className="min-h-svh flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Invalid or missing reset token.</p>
          <Button variant="outline" asChild><Link to="/forgot-password">Request a new link</Link></Button>
        </div>
      </main>
    )
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
            {done ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mt-4" />
                <h1 className="text-2xl font-bold text-foreground mt-3">Password updated!</h1>
                <p className="text-sm text-muted-foreground mt-2">Redirecting you to sign in…</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground mt-4">Set new password</h1>
                <p className="text-sm text-muted-foreground mt-1.5">Choose a strong password for your account.</p>
              </>
            )}
          </div>

          {!done && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="font-medium">New password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} required minLength={8}
                    placeholder="Min. 8 characters"
                    className="h-11 border-border/60 focus:border-primary/50 pr-11" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm" className="font-medium">Confirm password</Label>
                <Input id="confirm" type={showPassword ? 'text' : 'password'} value={confirm}
                  onChange={(e) => setConfirm(e.target.value)} required minLength={8}
                  placeholder="Repeat your password"
                  className="h-11 border-border/60 focus:border-primary/50" />
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                  <p className="text-sm text-destructive font-medium" role="alert">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={loading}
                className="w-full h-11 mt-1 shadow-md shadow-primary/20 font-medium">
                {loading ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
