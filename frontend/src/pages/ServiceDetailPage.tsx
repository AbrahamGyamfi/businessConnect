import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { mediaUrl } from '@/lib/utils'
import { ArrowLeft, Wrench, MapPin, DollarSign, Clock, Phone, Mail, User, Share2, Check } from 'lucide-react'

interface ServiceDetail {
  service: {
    id: number; name: string; category: string; description: string
    rate: string | null; location: string | null; phone: string | null
    email: string | null; availability: string | null; image: string | null
    createdAt: string
  }
  provider: { id: string; name: string; image: string | null } | null
}

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<ServiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    api.get<ServiceDetail>(`/api/services/${id}`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

  if (!data) {
    return (
      <div className="min-h-svh flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Wrench className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">Service not found</p>
          <Button variant="outline" asChild><Link to="/services">Back to Services</Link></Button>
        </div>
      </div>
    )
  }

  const { service, provider } = data

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {service.image ? (
          <div className="h-64 md:h-80 overflow-hidden">
            <img src={mediaUrl(service.image)} alt={service.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-primary/15 via-background to-secondary/20" />
        )}
      </section>

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <Link to="/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Services
            </Link>
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 border-border/60">
              {copied ? <><Check className="h-4 w-4 text-green-500" />Copied!</> : <><Share2 className="h-4 w-4" />Share</>}
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <span className="inline-block text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium mb-3">
                  {service.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-4">{service.name}</h1>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                  {service.rate && (
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-primary" />{service.rate}
                    </span>
                  )}
                  {service.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" />{service.location}
                    </span>
                  )}
                  {service.availability && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />{service.availability}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-3">About this Service</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{service.description}</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Provider */}
              {provider && (
                <div className="bg-card border border-border/50 rounded-2xl p-5">
                  <h3 className="font-semibold text-foreground mb-4 text-sm">Service Provider</h3>
                  <Link to={`/community/${provider.id}`} className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                      {provider.image
                        ? <img src={mediaUrl(provider.image)} alt={provider.name} className="w-full h-full object-cover" />
                        : <User className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">{provider.name}</p>
                      <p className="text-xs text-muted-foreground">Church Member</p>
                    </div>
                  </Link>
                </div>
              )}

              {/* Contact */}
              {(service.phone || service.email) && (
                <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
                  <h3 className="font-semibold text-foreground text-sm">Get in Touch</h3>
                  {service.phone && (
                    <a href={`tel:${service.phone}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium text-foreground">{service.phone}</p>
                      </div>
                    </a>
                  )}
                  {service.email && (
                    <a href={`mailto:${service.email}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-foreground">{service.email}</p>
                      </div>
                    </a>
                  )}
                </div>
              )}

              <Button className="w-full shadow-md shadow-primary/20" asChild>
                <Link to="/services">Browse More Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
