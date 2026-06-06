import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/utils'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, MapPin, User, Clock } from 'lucide-react'

interface EventDetail {
  event: { id: number; title: string; slug: string; description: string; eventDate: string; location: string | null; image: string | null }
  poster: { id: string; name: string; image: string | null } | null
}

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    api.get<EventDetail>(`/api/events/${slug}`).then(setData).catch(() => navigate('/events')).finally(() => setLoading(false))
  }, [slug, navigate])

  if (loading) return (
    <div className="min-h-svh flex flex-col"><Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </div>
  )
  if (!data) return null
  const { event, poster } = data
  const date = new Date(event.eventDate)
  const isUpcoming = date >= new Date()

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Link>
          {event.image && (
            <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-muted mb-8">
              <img src={mediaUrl(event.image)} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1 mb-4 ${isUpcoming ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Calendar className="h-3 w-3" />
            {isUpcoming ? 'Upcoming' : 'Past Event'}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{event.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary/60" />{date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary/60" />{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            {event.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary/60" />{event.location}</span>}
          </div>
          <Card className="border-border/60 mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-foreground mb-3">About This Event</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{event.description}</p>
            </CardContent>
          </Card>
          {poster && (
            <Card className="border-border/60">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {poster.image ? <img src={mediaUrl(poster.image)} alt={poster.name} className="w-full h-full object-cover rounded-xl" /> : <span className="text-primary font-bold text-lg">{poster.name.charAt(0).toUpperCase()}</span>}
                </div>
                <div>
                  <p className="font-medium text-foreground">{poster.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />Event Organiser</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto border-border/60 text-xs" asChild>
                  <Link to="/community">View Profile</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
