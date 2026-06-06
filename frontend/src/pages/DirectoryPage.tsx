import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { Header } from '@/components/header'
import { BusinessCard } from '@/components/business-card'
import { CategoryIcon } from '@/components/category-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, X, LocateFixed, SlidersHorizontal, ArrowUpDown } from 'lucide-react'

interface BusinessItem {
  business: { id: number; name: string; slug: string; description: string; city: string | null; state: string | null; image: string | null; isFeatured: boolean; latitude?: number | null; longitude?: number | null }
  category: { name: string; slug: string; icon: string } | null
  avgRating: string | null; reviewCount: string
}
interface Category { id: number; name: string; slug: string; icon: string }

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3959
  const toRad = (d: number) => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function DirectoryPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const categorySlug = searchParams.get('category') ?? undefined
  const searchQuery = searchParams.get('search') ?? ''

  const [businesses, setBusinesses] = useState<BusinessItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState(searchQuery)
  const [loading, setLoading] = useState(true)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [radiusMiles, setRadiusMiles] = useState<string>('any')
  const [ratingFilter, setRatingFilter] = useState<string>('any')
  const [sortBy, setSortBy] = useState<string>('featured')
  const [showFilters, setShowFilters] = useState(false)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (categorySlug) params.set('categorySlug', categorySlug)
    if (searchQuery) params.set('search', searchQuery)
    Promise.all([
      api.get<BusinessItem[]>(`/api/businesses?${params}`),
      api.get<Category[]>('/api/categories'),
    ]).then(([biz, cats]) => { setBusinesses(biz); setCategories(cats) })
      .catch(console.error).finally(() => setLoading(false))
  }, [categorySlug, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (categorySlug) p.set('category', categorySlug)
    navigate(`/directory?${p}`)
  }

  const detectLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false) },
      () => setLocating(false)
    )
  }

  const clearFilters = () => { setSearch(''); setUserCoords(null); setRadiusMiles('any'); setRatingFilter('any'); setSortBy('featured'); navigate('/directory') }

  const filtered = businesses.filter((item) => {
    if (radiusMiles !== 'any' && userCoords) {
      const { latitude: lat, longitude: lng } = item.business
      if (!lat || !lng) return false
      if (haversine(userCoords.lat, userCoords.lng, lat, lng) > Number(radiusMiles)) return false
    }
    if (ratingFilter !== 'any') {
      const rating = item.avgRating ? Number(item.avgRating) : 0
      if (rating < Number(ratingFilter)) return false
    }
    return true
  }).sort((a, b) => {
    if (sortBy === 'top-rated') return (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0)
    if (sortBy === 'most-reviewed') return Number(b.reviewCount) - Number(a.reviewCount)
    if (sortBy === 'newest') return 0 // API already returns newest first
    // featured: isFeatured first, then by api order
    return Number(b.business.isFeatured) - Number(a.business.isFeatured)
  })

  const activeCategory = categories.find((c) => c.slug === categorySlug)
  const hasActiveFilters = categorySlug || searchQuery || userCoords || radiusMiles !== 'any' || ratingFilter !== 'any'

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{activeCategory ? activeCategory.name : 'Business Directory'}</h1>
            <p className="text-muted-foreground">{activeCategory ? `Browse ${activeCategory.name.toLowerCase()} businesses` : 'Discover trusted businesses from fellow church members'}</p>
          </div>

          {/* Search row */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search businesses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10 border-border/60" />
              </div>
              <Button type="submit" className="h-10">Search</Button>
            </form>
            <div className="flex gap-2 flex-wrap">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10 w-40 border-border/60 gap-1.5 text-sm">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured First</SelectItem>
                  <SelectItem value="top-rated">Top Rated</SelectItem>
                  <SelectItem value="most-reviewed">Most Reviewed</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
              <Button variant={userCoords ? 'default' : 'outline'} size="sm" onClick={detectLocation} disabled={locating} className="h-10 gap-1.5 border-border/60">
                <LocateFixed className="h-4 w-4" />{locating ? 'Locating…' : userCoords ? 'Located' : 'Near Me'}
              </Button>
              <Button variant={showFilters ? 'secondary' : 'outline'} size="sm" onClick={() => setShowFilters(!showFilters)} className="h-10 gap-1.5 border-border/60">
                <SlidersHorizontal className="h-4 w-4" />Filters
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 gap-1.5 text-muted-foreground">
                  <X className="h-4 w-4" />Clear
                </Button>
              )}
            </div>
          </div>

          {/* Extra filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 mb-6 p-4 bg-card rounded-xl border border-border/60">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Distance:</span>
                <Select value={radiusMiles} onValueChange={setRadiusMiles} disabled={!userCoords}>
                  <SelectTrigger className="h-8 w-32 text-xs border-border/60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any distance</SelectItem>
                    {['5', '10', '25', '50'].map((m) => <SelectItem key={m} value={m}>{m} miles</SelectItem>)}
                  </SelectContent>
                </Select>
                {!userCoords && <span className="text-xs text-muted-foreground">(click Near Me first)</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Min rating:</span>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="h-8 w-28 text-xs border-border/60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any rating</SelectItem>
                    {['4', '3', '2'].map((r) => <SelectItem key={r} value={r}>{r}★ & above</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
            <Link to="/directory">
              <Button variant={!categorySlug ? 'default' : 'outline'} size="sm" className="whitespace-nowrap h-8 border-border/60">All</Button>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/directory?category=${cat.slug}`}>
                <Button variant={categorySlug === cat.slug ? 'default' : 'outline'} size="sm" className="whitespace-nowrap h-8 gap-1.5 border-border/60">
                  <CategoryIcon icon={cat.icon} className="h-3.5 w-3.5" />{cat.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">{filtered.length} business{filtered.length !== 1 ? 'es' : ''} found</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((item) => (
                  <BusinessCard key={item.business.id} business={item.business} category={item.category} avgRating={item.avgRating} reviewCount={Number(item.reviewCount)} />
                ))}
              </div>
            </>
          ) : (
            <Card><CardContent className="py-16 text-center">
              <p className="text-muted-foreground mb-4">No businesses found{searchQuery && ` for "${searchQuery}"`}</p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </CardContent></Card>
          )}
        </div>
      </main>
    </div>
  )
}
