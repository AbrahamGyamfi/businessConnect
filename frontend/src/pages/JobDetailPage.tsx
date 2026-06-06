import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/utils'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, MapPin, DollarSign, Clock, Mail, User, Building2 } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  'full-time': 'bg-primary/10 text-primary border-primary/20',
  'part-time': 'bg-accent/20 text-accent-foreground border-accent/30',
}

interface JobDetail {
  job: { id: number; title: string; slug: string; description: string; jobType: string; location: string | null; salary: string | null; contactEmail: string; image: string | null; isActive: boolean; createdAt: string }
  poster: { id: string; name: string; image: string | null } | null
}

export function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    api.get<JobDetail>(`/api/jobs/${slug}`)
      .then(setData)
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  if (loading) return (
    <div className="min-h-svh flex flex-col"><Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </div>
  )

  if (!data) return null
  const { job, poster } = data

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Jobs
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {job.image && (
                <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-muted">
                  <img src={mediaUrl(job.image)} alt={job.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-start gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-foreground flex-1">{job.title}</h1>
                  <Badge variant="outline" className={`text-sm font-medium capitalize ${TYPE_COLORS[job.jobType] ?? 'bg-secondary text-secondary-foreground'}`}>
                    {job.jobType.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                  {job.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary/60" />{job.location}</span>}
                  {job.salary && <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-primary/60" />{job.salary}</span>}
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary/60" />Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <Card className="border-border/60">
                <CardContent className="p-6">
                  <h2 className="font-semibold text-foreground mb-4 text-lg">About This Role</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{job.description}</p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Apply */}
              <Card className="border-border/60 bg-gradient-to-br from-primary/5 to-background">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Apply for this role</h3>
                  <p className="text-sm text-muted-foreground mb-4">Reach out directly to the poster via email.</p>
                  <Button className="w-full shadow-sm shadow-primary/20" asChild>
                    <a href={`mailto:${job.contactEmail}?subject=Application: ${job.title}`}>
                      <Mail className="h-4 w-4 mr-2" /> Apply via Email
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3 text-center break-all">{job.contactEmail}</p>
                </CardContent>
              </Card>

              {/* Poster */}
              {poster && (
                <Card className="border-border/60">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Posted By</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                        {poster.image
                          ? <img src={mediaUrl(poster.image)} alt={poster.name} className="w-full h-full object-cover" />
                          : <span className="text-primary font-bold text-lg">{poster.name.charAt(0).toUpperCase()}</span>
                        }
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{poster.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" />Church Member</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4 border-border/60 text-xs" asChild>
                      <Link to="/directory">View Their Businesses</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
