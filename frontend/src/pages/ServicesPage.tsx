import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession } from '@/lib/auth-client'
import { mediaUrl } from '@/lib/utils'
import { Wrench, Search, X, Plus, MapPin, DollarSign, Clock, User } from 'lucide-react'

export const SERVICE_CATEGORIES = [
  'Cleaning', 'Plumbing', 'Electrical', 'Tutoring & Education',
  'IT & Tech', 'Catering & Food', 'Photography & Video', 'Transportation',
  'Construction & Repairs', 'Beauty & Hair', 'Tailoring & Fashion',
  'Childcare', 'Eldercare', 'Accounting & Finance', 'Legal & Notary',
  'Counseling', 'Music & Entertainment', 'Landscaping', 'Other',
]

interface ServiceItem {
  service: {
    id: number; name: string; category: string; description: string
    rate: string | null; location: string | null; phone: string | null
    email: string | null; availability: string | null; image: string | null
    createdAt: string
  }
  provider: { id: string; name: string; image: string | null } | null
}

export function ServicesPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: session } = useSession()

  const categoryFilter = searchParams.get('category') ?? ''
  const searchQuery = searchParams.get('search') ?? ''

  const [services, setServices] = useState<ServiceItem[]>([])
  const [search, setSearch] = useState(searchQuery)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (categoryFilter) params.set('category', categoryFilter)
    api.get<ServiceItem[]>(`/api/services?${params}`)
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [categoryFilter, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    navigate(`/services?${p}`)
  }

  const clearFilters = () => { setSearch(''); navigate('/services') }

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-background to-secondary/20 py-16 border-b border-border/50">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Wrench className="h-3 w-3" /> Service Providers
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-3 tracking-tight">Services</h1>
              <p className="text-muted-foreground text-lg">Find skilled individuals from our church community ready to help.</p>
            </div>
            {session?.user && (
              <Button className="shrink-0 shadow-md shadow-primary/20" asChild>
                <Link to="/services/new"><Plus className="mr-2 h-4 w-4" />Offer a Service</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search services..." value={search}
                  onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10 border-border/60" />
              </div>
              <Button type="submit" className="h-10">Search</Button>
            </form>
            {(categoryFilter || searchQuery) && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2 text-muted-foreground">
                <X className="h-4 w-4" />Clear
              </Button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
            <Button variant={!categoryFilter ? 'default' : 'outline'} size="sm" className="whitespace-nowrap h-8" asChild>
              <Link to="/services">All Services</Link>
            </Button>
            {SERVICE_CATEGORIES.map((cat) => (
              <Button key={cat} variant={categoryFilter === cat ? 'default' : 'outline'} size="sm"
                className="whitespace-nowrap h-8" asChild>
                <Link to={`/services?category=${encodeURIComponent(cat)}`}>{cat}</Link>
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((item) => (
                <Link key={item.service.id} to={`/services/${item.service.id}`}
                  className="group flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all">
                  {item.service.image ? (
                    <div className="aspect-video overflow-hidden">
                      <img src={mediaUrl(item.service.image)} alt={item.service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center">
                      <Wrench className="h-10 w-10 text-primary/30" />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">
                        {item.service.name}
                      </h3>
                      <span className="shrink-0 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {item.service.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {item.service.description}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {item.service.rate && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />{item.service.rate}
                        </span>
                      )}
                      {item.service.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{item.service.location}
                        </span>
                      )}
                      {item.service.availability && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{item.service.availability}
                        </span>
                      )}
                    </div>
                    {item.provider && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                        <div className="w-7 h-7 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                          {item.provider.image
                            ? <img src={mediaUrl(item.provider.image)} alt={item.provider.name} className="w-full h-full object-cover" />
                            : <User className="h-3.5 w-3.5 text-muted-foreground" />}
                        </div>
                        <span className="text-xs text-muted-foreground">{item.provider.name}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border rounded-2xl bg-card border-border/50">
              <Wrench className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No services found{searchQuery && ` for "${searchQuery}"`}{categoryFilter && ` in "${categoryFilter}"`}
              </p>
              {(categoryFilter || searchQuery) && (
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              )}
              {session?.user && (
                <Button className="mt-4 ml-2 shadow-sm shadow-primary/20" asChild>
                  <Link to="/services/new"><Plus className="mr-2 h-4 w-4" />Be the first to offer a service</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
