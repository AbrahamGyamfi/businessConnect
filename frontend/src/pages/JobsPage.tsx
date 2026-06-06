import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { Header } from '@/components/header'
import { JobCard } from '@/components/job-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession } from '@/lib/auth-client'
import { Briefcase, Search, X, Plus } from 'lucide-react'

interface JobItem {
  job: { id: number; title: string; slug: string; description: string; jobType: string; location: string | null; salary: string | null; image: string | null; createdAt: string }
  poster: { id: string; name: string; image: string | null } | null
}

const JOB_TYPES = ['full-time', 'part-time', 'freelance', 'contract', 'internship', 'volunteer']

export function JobsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: session } = useSession()

  const typeFilter = searchParams.get('type') ?? ''
  const searchQuery = searchParams.get('search') ?? ''

  const [jobs, setJobs] = useState<JobItem[]>([])
  const [search, setSearch] = useState(searchQuery)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (typeFilter) params.set('type', typeFilter)
    api.get<JobItem[]>(`/api/jobs?${params}`)
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [typeFilter, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (typeFilter) p.set('type', typeFilter)
    navigate(`/jobs?${p}`)
  }

  const clearFilters = () => { setSearch(''); navigate('/jobs') }

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-background to-secondary/20 py-16 border-b border-border/50">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Briefcase className="h-3 w-3" /> Jobs & Opportunities
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-3 tracking-tight">Jobs Board</h1>
              <p className="text-muted-foreground text-lg">Find work or post opportunities within our church community.</p>
            </div>
            {session?.user && (
              <Button className="shrink-0 shadow-md shadow-primary/20" asChild>
                <Link to="/jobs/new"><Plus className="mr-2 h-4 w-4" />Post a Job</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10 border-border/60" />
              </div>
              <Button type="submit" className="h-10">Search</Button>
            </form>
            {(typeFilter || searchQuery) && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2 text-muted-foreground">
                <X className="h-4 w-4" />Clear
              </Button>
            )}
          </div>

          {/* Type filters */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
            <Button variant={!typeFilter ? 'default' : 'outline'} size="sm" className="whitespace-nowrap h-8" asChild>
              <Link to="/jobs">All Types</Link>
            </Button>
            {JOB_TYPES.map((type) => (
              <Button key={type} variant={typeFilter === type ? 'default' : 'outline'} size="sm"
                className="whitespace-nowrap h-8 capitalize" asChild>
                <Link to={`/jobs?type=${type}`}>{type.replace('-', ' ')}</Link>
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((item) => (
                <JobCard key={item.job.id} job={item.job} poster={item.poster} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border rounded-2xl bg-card border-border/50">
              <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No jobs found{searchQuery && ` for "${searchQuery}"`}</p>
              {(typeFilter || searchQuery) && (
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
