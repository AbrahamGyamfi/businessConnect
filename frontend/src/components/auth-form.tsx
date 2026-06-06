import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Church } from 'lucide-react'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })

    setLoading(false)
    if (error) { setError(error.message ?? 'Something went wrong'); return }
    navigate('/dashboard')
  }

  return (
    <main className="min-h-svh bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-xl shadow-primary/5 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-3 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <Church className="h-7 w-7 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">
                Church<span className="text-primary">Connect</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground mt-4">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {isSignUp
                ? 'Join our community and advertise your business'
                : 'Sign in to manage your business listings'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="font-medium">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="John Smith"
                  className="h-11 border-border/60 focus:border-primary/50"
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="h-11 border-border/60 focus:border-primary/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder="Min. 8 characters"
                className="h-11 border-border/60 focus:border-primary/50"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive font-medium" role="alert">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-1 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow text-base font-medium"
            >
              {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Link
              to={isSignUp ? '/sign-in' : '/sign-up'}
              className="text-primary font-semibold hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
