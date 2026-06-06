import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { mediaUrl } from '@/lib/utils'
import { Calendar, MapPin, User } from 'lucide-react'

interface EventCardProps {
  event: { id: number; title: string; slug: string; description: string; eventDate: string; location: string | null; image: string | null }
  poster: { id: string; name: string; image: string | null } | null
}

export function EventCard({ event, poster }: EventCardProps) {
  const date = new Date(event.eventDate)
  const isUpcoming = date >= new Date()

  return (
    <Link to={`/events/${event.slug}`} className="block h-full">
      <Card className="group h-full hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300 border-border/60 hover:border-primary/30 overflow-hidden">
        {event.image ? (
          <div className="aspect-[16/7] overflow-hidden bg-muted">
            <img src={mediaUrl(event.image)} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        ) : (
          <div className="aspect-[16/7] bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center">
            <Calendar className="h-12 w-12 text-primary/30" />
          </div>
        )}
        <CardContent className="p-5">
          {/* Date badge */}
          <div className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 mb-3 ${isUpcoming ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Calendar className="h-3 w-3" />
            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">{event.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{event.description}</p>
          <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
            {event.location && (
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary/60" />{event.location}</span>
            )}
            {poster && (
              <span className="flex items-center gap-1 ml-auto"><User className="h-3 w-3" />{poster.name}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
