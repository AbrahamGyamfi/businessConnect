import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { Header } from '@/components/header'
import { EventCard } from '@/components/event-card'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'
import { Calendar, Plus } from 'lucide-react'

interface EventItem {
  event: { id: number; title: string; slug: string; description: string; eventDate: string; location: string | null; image: string | null }
  poster: { id: string; name: string; image: string | null } | null
}

export function EventsPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<EventItem[]>('/api/events').then(setEvents).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-background to-secondary/20 py-16 border-b border-border/50">
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Calendar className="h-3 w-3" /> Events & Gatherings
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-3 tracking-tight">Upcoming Events</h1>
              <p className="text-muted-foreground text-lg">Church community events, gatherings, and activities.</p>
            </div>
            {session?.user && (
              <Button className="shrink-0 shadow-md shadow-primary/20" asChild>
                <Link to="/events/new"><Plus className="mr-2 h-4 w-4" />Post an Event</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-56 bg-muted animate-pulse rounded-2xl" />)}
            </div>
          ) : events.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((item) => <EventCard key={item.event.id} event={item.event} poster={item.poster} />)}
            </div>
          ) : (
            <div className="text-center py-24 border rounded-2xl bg-card border-border/50">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No upcoming events yet.</p>
              {session?.user && <Button asChild><Link to="/events/new">Post the First Event</Link></Button>}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
