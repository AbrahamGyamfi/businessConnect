import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { mediaUrl } from '@/lib/utils'
import { MapPin, Clock, DollarSign, Building2 } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  'full-time':  'bg-primary/10 text-primary border-primary/20',
  'part-time':  'bg-accent/20 text-accent-foreground border-accent/30',
  'freelance':  'bg-secondary text-secondary-foreground border-border/50',
  'contract':   'bg-secondary text-secondary-foreground border-border/50',
  'internship': 'bg-secondary text-secondary-foreground border-border/50',
  'volunteer':  'bg-secondary text-secondary-foreground border-border/50',
}

interface JobCardProps {
  job: {
    id: number; title: string; slug: string; description: string; jobType: string
    location: string | null; salary: string | null; image: string | null; createdAt: string
  }
  poster: { id: string; name: string; image: string | null } | null
}

export function JobCard({ job, poster }: JobCardProps) {
  return (
    <Link to={`/jobs/${job.slug}`} className="block h-full">
      <Card className="group h-full hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300 border-border/60 hover:border-primary/30 overflow-hidden">
        {job.image && (
          <div className="aspect-[16/7] overflow-hidden bg-muted">
            <img src={mediaUrl(job.image)} alt={job.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-base leading-snug">
              {job.title}
            </h3>
            <Badge variant="outline" className={`shrink-0 text-xs font-medium capitalize ${TYPE_COLORS[job.jobType] ?? TYPE_COLORS['contract']}`}>
              {job.jobType.replace('-', ' ')}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{job.description}</p>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
            {job.location && (
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary/60" />{job.location}</span>
            )}
            {job.salary && (
              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-primary/60" />{job.salary}</span>
            )}
            <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-primary/60" />
              {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>

          {poster && (
            <div className="flex items-center gap-2 pt-3 border-t border-border/40">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                {poster.image
                  ? <img src={mediaUrl(poster.image)} alt={poster.name} className="w-full h-full object-cover" />
                  : <span className="text-primary font-medium text-xs">{poster.name.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">{poster.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="h-2.5 w-2.5" />Church Member</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
