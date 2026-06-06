import { Link } from 'react-router-dom'
import { mediaUrl } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CategoryIcon } from '@/components/category-icon'
import { StarRating } from '@/components/star-rating'
import { MapPin } from 'lucide-react'

interface BusinessCardProps {
  business: {
    id: number; name: string; slug: string; description: string
    city: string | null; state: string | null; image: string | null; isFeatured: boolean
  }
  category: { name: string; slug: string; icon: string } | null
  avgRating: string | null
  reviewCount: number
}

export function BusinessCard({ business, category, avgRating, reviewCount }: BusinessCardProps) {
  const rating = avgRating ? Number(avgRating) : 0

  return (
    <Link to={`/business/${business.slug}`} className="block h-full">
      <Card className="group h-full overflow-hidden hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300 border-border/60 hover:border-primary/30">
        <div className="aspect-[16/10] relative bg-secondary overflow-hidden">
          {business.image ? (
            <img
              src={mediaUrl(business.image)}
              alt={business.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary">
              {category && (
                <div className="w-16 h-16 rounded-2xl bg-white/60 flex items-center justify-center shadow-sm">
                  <CategoryIcon icon={category.icon} className="h-8 w-8 text-primary/70" />
                </div>
              )}
            </div>
          )}
          {business.isFeatured && (
            <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground shadow-sm font-medium text-xs px-2.5">
              ✦ Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-5">
          <div className="mb-1.5">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 text-base">
              {business.name}
            </h3>
          </div>
          {category && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <CategoryIcon icon={category.icon} className="h-3 w-3" />
              <span className="font-medium">{category.name}</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {business.description}
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <div className="flex items-center gap-1.5">
              <StarRating rating={rating} size="sm" />
              <span className="text-xs text-muted-foreground font-medium">({reviewCount})</span>
            </div>
            {(business.city || business.state) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 text-primary/60" />
                <span>{[business.city, business.state].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
