import { Star, StarHalf } from 'lucide-react'

export function StarRating({
  rating,
  size = 'default',
}: {
  rating: number
  size?: 'sm' | 'default'
}) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating - fullStars >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className={`${starSize} fill-accent text-accent`} />
      ))}
      {hasHalfStar && <StarHalf className={`${starSize} fill-accent text-accent`} />}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className={`${starSize} text-muted-foreground/30`} />
      ))}
    </div>
  )
}
