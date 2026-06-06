import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useSession } from '@/lib/auth-client'
import { BusinessCard } from '@/components/business-card'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CategoryIcon } from '@/components/category-icon'
import { StarRating } from '@/components/star-rating'
import { ReviewSection } from '@/components/review-section'
import { ContactForm } from '@/components/contact-form'
import { BookingForm } from '@/components/booking-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mediaUrl } from '@/lib/utils'
import { MapPin, Phone, Mail, Globe, ArrowLeft, Clock, Eye, Share2, Check } from 'lucide-react'

interface BusinessData {
  business: {
    id: number
    name: string
    slug: string
    description: string
    categoryId: number
    phone: string | null
    email: string | null
    website: string | null
    address: string | null
    city: string | null
    state: string | null
    zipCode: string | null
    image: string | null
    isFeatured: boolean
    createdAt: string
  }
  category: { id: number; name: string; slug: string; icon: string } | null
  owner: { id: string; name: string; image: string | null } | null
}

export function BusinessDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: session } = useSession()

  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [stats, setStats] = useState({ avgRating: 0, reviewCount: 0 })
  const [userReview, setUserReview] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return

    api
      .get<BusinessData>(`/api/businesses/${slug}`)
      .then(async (data) => {
        setBusinessData(data)
        const [rev, st, rel] = await Promise.all([
          api.get<any[]>(`/api/businesses/${data.business.id}/reviews`),
          api.get<{ avgRating: number; reviewCount: number }>(`/api/businesses/${data.business.id}/stats`),
          data.category
            ? api.get<any[]>(`/api/businesses?categorySlug=${data.category.slug}&limit=4`)
            : Promise.resolve([]),
        ])
        setReviews(rev)
        setStats(st)
        setRelated((rel as any[]).filter((r) => r.business.id !== data.business.id).slice(0, 3))
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  useEffect(() => {
    if (businessData && session?.user) {
      api
        .get(`/api/reviews/me/${businessData.business.id}`)
        .then(setUserReview)
        .catch(() => setUserReview(null))
    }
  }, [businessData, session])

  if (loading) {
    return (
      <div className="min-h-svh flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!businessData) return null

  const { business, category, owner } = businessData

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <Link
            to="/directory"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden">
                <div className="aspect-[21/9] relative bg-muted">
                  {business.image ? (
                    <img
                      src={mediaUrl(business.image)}
                      alt={business.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      {category && (
                        <CategoryIcon
                          icon={category.icon}
                          className="h-20 w-20 text-muted-foreground/30"
                        />
                      )}
                    </div>
                  )}
                  {business.isFeatured && (
                    <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        {business.name}
                      </h1>
                      {category && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CategoryIcon icon={category.icon} className="h-4 w-4" />
                          <span>{category.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <StarRating rating={stats.avgRating} />
                        <span className="text-sm text-muted-foreground">
                          {stats.avgRating.toFixed(1)} ({stats.reviewCount} reviews)
                        </span>
                      </div>
                      {(business as any).views != null && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3.5 w-3.5" />{(business as any).views} views
                        </span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs h-7 ml-auto"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href)
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        }}
                      >
                        {copied ? <Check className="h-3 w-3 text-green-500" /> : <Share2 className="h-3 w-3" />}
                        {copied ? 'Copied!' : 'Share'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {business.description}
                  </p>
                </CardContent>
              </Card>

              <ReviewSection
                businessId={business.id}
                reviews={reviews}
                userReview={userReview}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(business.address || business.city || business.state) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        {business.address && (
                          <p className="text-foreground">{business.address}</p>
                        )}
                        <p className="text-muted-foreground">
                          {[business.city, business.state, business.zipCode]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <a href={`tel:${business.phone}`} className="text-foreground hover:text-primary">
                        {business.phone}
                      </a>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <a
                        href={`mailto:${business.email}`}
                        className="text-foreground hover:text-primary"
                      >
                        {business.email}
                      </a>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-primary"
                      >
                        {business.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground pt-2 border-t">
                    <Clock className="h-4 w-4" />
                    <span>Listed {new Date(business.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              {owner && (
                <Card>
                  <CardHeader>
                    <CardTitle>Business Owner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {owner.image
                          ? <img src={mediaUrl(owner.image)} alt={owner.name} className="w-full h-full object-cover" />
                          : <span className="text-primary font-medium">{owner.name?.charAt(0).toUpperCase()}</span>}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{owner.name}</p>
                        <p className="text-sm text-muted-foreground">Church Member</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue="contact">
                <TabsList className="w-full bg-muted/50 border border-border/50">
                  <TabsTrigger value="contact" className="flex-1 text-xs">Contact</TabsTrigger>
                  <TabsTrigger value="booking" className="flex-1 text-xs">Book</TabsTrigger>
                </TabsList>
                <TabsContent value="contact" className="mt-0">
                  <ContactForm businessId={business.id} businessName={business.name} />
                </TabsContent>
                <TabsContent value="booking" className="mt-0">
                  <BookingForm businessId={business.id} businessName={business.name} />
                </TabsContent>
              </Tabs>
            </div>
          </div>

        {/* Related businesses */}
        {related.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                More in {category?.name}
              </h2>
              <Button variant="ghost" size="sm" className="text-primary gap-1" asChild>
                <Link to={`/directory?category=${category?.slug}`}>
                  View all <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                </Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item) => (
                <BusinessCard
                  key={item.business.id}
                  business={item.business}
                  category={item.category}
                  avgRating={item.avgRating}
                  reviewCount={Number(item.reviewCount)}
                />
              ))}
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  )
}
