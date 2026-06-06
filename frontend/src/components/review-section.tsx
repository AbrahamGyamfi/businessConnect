import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '@/lib/auth-client'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from '@/components/star-rating'
import { Star, User } from 'lucide-react'

interface Review {
  review: {
    id: number
    rating: number
    comment: string | null
    createdAt: string
  }
  user: {
    id: string
    name: string
    image: string | null
  } | null
}

interface ReviewSectionProps {
  businessId: number
  reviews: Review[]
  userReview: { id: number; rating: number; comment: string | null } | null
}

export function ReviewSection({ businessId, reviews, userReview }: ReviewSectionProps) {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/reviews', { businessId, rating, comment: comment || undefined })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  const canReview = session?.user && !userReview && !submitted

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {canReview ? (
          <form onSubmit={handleSubmit} className="space-y-4 pb-6 border-b">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        value <= (hoverRating || rating)
                          ? 'fill-accent text-accent'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-2">
                Your Review (Optional)
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        ) : !session?.user ? (
          <div className="text-center py-4 border-b">
            <p className="text-muted-foreground mb-2">Sign in to leave a review</p>
            <Button variant="outline" asChild>
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </div>
        ) : userReview || submitted ? (
          <div className="text-center py-4 border-b text-muted-foreground">
            You have already reviewed this business
          </div>
        ) : null}

        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map(({ review, user }) => (
              <div key={review.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {user?.image ? (
                    <img
                      src={mediaUrl(user.image)}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{user?.name ?? 'Anonymous'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  {review.comment && (
                    <p className="text-muted-foreground mt-2">{review.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            No reviews yet. Be the first to review!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
