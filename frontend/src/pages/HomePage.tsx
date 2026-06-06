import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BusinessCard } from '@/components/business-card'
import { CategoryIcon } from '@/components/category-icon'
import { ArrowRight, Users, Store, Shield, Search, Sparkles, Star, MessageCircle, CheckCircle, Briefcase } from 'lucide-react'

function HeroVisual() {
  return (
    <div className="relative w-full flex items-center justify-center py-8 lg:py-0">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      </div>

      {/* Central card — business listing mockup */}
      <div className="relative z-10 w-64 bg-card border border-border/60 rounded-2xl shadow-2xl shadow-primary/15 overflow-hidden">
        <div className="w-full h-32 bg-gradient-to-br from-primary/30 via-primary/10 to-secondary flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div className="px-2.5 py-0.5 text-xs font-medium bg-accent/90 text-accent-foreground rounded-full">✦ Featured</div>
        </div>
        <div className="p-4">
          <div className="h-3 w-36 bg-foreground/15 rounded-full mb-2" />
          <div className="flex items-center gap-1 mb-2.5">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-accent text-accent" />)}
            <span className="text-xs text-muted-foreground ml-0.5">4.9 (24 reviews)</span>
          </div>
          <div className="space-y-1.5 mb-3">
            <div className="h-2 w-full bg-foreground/10 rounded-full" />
            <div className="h-2 w-4/5 bg-foreground/10 rounded-full" />
            <div className="h-2 w-3/5 bg-foreground/10 rounded-full" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
            <CheckCircle className="h-3 w-3 text-primary" />
            <span>Verified Church Member</span>
          </div>
        </div>
      </div>

      {/* Floating — new inquiry ping */}
      <div className="absolute top-6 right-4 lg:-right-6 z-20 bg-card border border-border/60 rounded-xl shadow-lg p-2.5 flex items-center gap-2.5 w-44 animate-bounce" style={{ animationDuration: '3s' }}>
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
          <MessageCircle className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground leading-none mb-0.5">New Inquiry</p>
          <p className="text-xs text-muted-foreground">Just now · 1 message</p>
        </div>
      </div>

      {/* Floating — 5-star review */}
      <div className="absolute top-24 -right-2 lg:-right-8 z-20 bg-card border border-border/60 rounded-xl shadow-lg p-3 w-48">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">A</div>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-2.5 w-2.5 fill-accent text-accent" />)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="h-2 w-full bg-foreground/10 rounded-full" />
          <div className="h-2 w-3/4 bg-foreground/10 rounded-full" />
        </div>
      </div>

      {/* Floating — jobs badge */}
      <div className="absolute bottom-10 right-2 lg:-right-4 z-20 bg-card border border-border/60 rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
          <Briefcase className="h-3.5 w-3.5 text-accent-foreground" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground leading-none">New Job Posted</p>
          <p className="text-xs text-muted-foreground">Full-time · Remote</p>
        </div>
      </div>

      {/* Floating — member avatars */}
      <div className="absolute bottom-4 left-2 lg:-left-6 z-20 bg-card border border-border/60 rounded-xl shadow-lg px-3 py-2.5 flex items-center gap-2.5">
        <div className="flex -space-x-2">
          {['K','A','M','J'].map((l, i) => (
            <div key={l} className="w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0"
              style={{ background: `oklch(${0.45 + i * 0.05} 0.22 ${285 + i * 15})` }}>
              {l}
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground leading-none">150+ members</p>
          <p className="text-xs text-muted-foreground">actively listing</p>
        </div>
      </div>
    </div>
  )
}

interface Category { id: number; name: string; slug: string; icon: string }
interface BusinessItem {
  business: { id: number; name: string; slug: string; description: string; city: string | null; state: string | null; image: string | null; isFeatured: boolean }
  category: { name: string; slug: string; icon: string } | null
  avgRating: string | null; reviewCount: string
}
interface PlatformStats { members: number; businesses: number; jobs: number; events: number }

export function HomePage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredBusinesses, setFeaturedBusinesses] = useState<BusinessItem[]>([])
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [heroSearch, setHeroSearch] = useState('')

  useEffect(() => {
    Promise.all([
      api.get<Category[]>('/api/categories'),
      api.get<BusinessItem[]>('/api/businesses/featured?limit=6'),
      api.get<PlatformStats>('/api/stats'),
    ]).then(([cats, businesses, s]) => {
      setCategories(cats)
      setFeaturedBusinesses(businesses)
      setStats(s)
    }).catch(console.error)
  }, [])

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (heroSearch.trim()) navigate(`/directory?search=${encodeURIComponent(heroSearch.trim())}`)
    else navigate('/directory')
  }

  return (
    <div className="min-h-svh flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/30 py-16 md:py-20">
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />

        <div className="container relative mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Trusted by church communities everywhere
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight tracking-tight">
                Support Fellow{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Church Members'
                </span>{' '}
                Businesses
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover and connect with trusted businesses owned by members of your church community.
                Find jobs, browse events, and strengthen our fellowship.
              </p>

              {/* Hero search */}
              <form onSubmit={handleHeroSearch} className="flex gap-2 max-w-md mx-auto lg:mx-0 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Search businesses, services..."
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    className="pl-10 h-11 border-border/60 bg-background/80"
                  />
                </div>
                <Button type="submit" size="lg" className="h-11 px-5 shadow-md shadow-primary/20">Search</Button>
              </form>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                <Button variant="outline" className="h-10 px-6 border-border/60 hover:bg-secondary/50" asChild>
                  <Link to="/directory">Browse All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button variant="ghost" className="h-10 px-6 text-muted-foreground hover:text-foreground" asChild>
                  <Link to="/sign-up">List Your Business</Link>
                </Button>
              </div>

              {/* Live stats */}
              <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto lg:mx-0 pt-6 border-t border-border/40">
                {[
                  { label: 'Members', value: stats?.members ?? '—' },
                  { label: 'Businesses', value: stats?.businesses ?? '—' },
                  { label: 'Jobs', value: stats?.jobs ?? '—' },
                  { label: 'Events', value: stats?.events ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-foreground">{value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — visual */}
            <div className="hidden lg:block">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-card border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Why Church Connect?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Built for faith communities to grow and support each other</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-7 w-7 text-primary" />,
                color: 'from-primary/20 to-primary/5',
                title: 'Community First',
                desc: 'Support businesses owned by people you know and trust from your church family.',
              },
              {
                icon: <Store className="h-7 w-7 text-accent-foreground" />,
                color: 'from-accent/30 to-accent/5',
                title: 'Free Listings',
                desc: 'Church members can list their businesses completely free of charge — always.',
              },
              {
                icon: <Shield className="h-7 w-7 text-primary" />,
                color: 'from-primary/20 to-primary/5',
                title: 'Trusted Reviews',
                desc: 'Read honest reviews from fellow church members who have used these services.',
              },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} className="group relative rounded-2xl border border-border/50 bg-background p-8 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className={`mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      {featuredBusinesses.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-sm font-medium text-primary mb-1">Spotlighted</p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Featured Businesses</h2>
                <p className="text-muted-foreground mt-2">Highlighted members of our community</p>
              </div>
              <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/80 hover:bg-primary/5" asChild>
                <Link to="/directory">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBusinesses.map((item) => (
                <BusinessCard
                  key={item.business.id}
                  business={item.business}
                  category={item.category}
                  avgRating={item.avgRating}
                  reviewCount={Number(item.reviewCount)}
                />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild>
                <Link to="/directory">View All Businesses <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-20 bg-gradient-to-b from-secondary/20 to-background border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-primary mb-1">Explore</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Browse by Category</h2>
            <p className="text-muted-foreground">Find exactly what you need from our community</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/directory?category=${cat.slug}`}>
                <Card className="h-full group hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-border/60">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-3 group-hover:from-primary/25 group-hover:to-primary/10 transition-colors">
                      <CategoryIcon icon={cat.icon} className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{cat.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Join the community
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5">
              Ready to Share Your Business?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
              Join our community and let fellow church members know about your services.
              It's completely free to list your business.
            </p>
            <Button size="lg" className="h-12 px-10 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" asChild>
              <Link to="/sign-up">
                Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-white text-xs font-bold">CC</span>
              </div>
              <p className="text-sm font-medium text-foreground">Church Connect</p>
              <span className="text-muted-foreground/40">·</span>
              <p className="text-sm text-muted-foreground">Connecting our community through commerce</p>
            </div>
            <nav className="flex gap-6">
              {[['Directory', '/directory'], ['Categories', '/categories'], ['Sign In', '/sign-in']].map(([label, href]) => (
                <Link key={href} to={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
