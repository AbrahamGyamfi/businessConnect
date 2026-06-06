import { Link, useNavigate } from 'react-router-dom'
import { useSession, signOut } from '@/lib/auth-client'
import { useTheme } from '@/components/theme-provider'
import { mediaUrl } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Church, User, LogOut, LayoutDashboard, Menu, X, Sun, Moon, Shield } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isDark = theme === 'dark'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
            <Church className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            Church<span className="text-primary">Connect</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/directory" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all">
            Directory
          </Link>
          <Link to="/services" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all">
            Services
          </Link>
          <Link to="/jobs" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all">
            Jobs
          </Link>
          <Link to="/community" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all">
            Community
          </Link>

          <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? 'light' : 'dark')} className="text-muted-foreground hover:text-foreground" aria-label="Toggle theme">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <div className="ml-1">
            {isPending ? (
              <div className="h-9 w-24 bg-muted animate-pulse rounded-lg" />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-border/60 hover:border-primary/40 hover:bg-secondary/60">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {session.user.image
                        ? <img src={mediaUrl(session.user.image)} alt={session.user.name ?? ''} className="w-full h-full object-cover" />
                        : <User className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <span className="font-medium">{session.user.name?.split(' ')[0] ?? 'Account'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 shadow-lg shadow-primary/5 border-border/60">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                  <DropdownMenuItem asChild className="mt-1">
                    <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Admin Panel</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="font-medium" asChild>
                  <Link to="/sign-in">Sign in</Link>
                </Button>
                <Button size="sm" className="shadow-sm shadow-primary/20 hover:shadow-primary/30 transition-shadow" asChild>
                  <Link to="/sign-up">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl px-4 py-4">
          <nav className="flex flex-col gap-1">
            {[['Directory', '/directory'], ['Services', '/services'], ['Jobs', '/jobs'], ['Events', '/events'], ['Community', '/community']].map(([label, href]) => (
              <Link
                key={href}
                to={href}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            {session?.user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all text-left"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-border/50 mt-1">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/sign-in">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/sign-up">Get Started</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
