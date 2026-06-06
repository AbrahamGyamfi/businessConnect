import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { Header } from '@/components/header'
import { BusinessForm } from '@/components/business-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2 } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  icon: string
}

interface Business {
  id: number
  name: string
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
}

export function EditBusinessPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [business, setBusiness] = useState<Business | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get<Business>(`/api/businesses/${id}/mine`),
      api.get<Category[]>('/api/categories'),
    ])
      .then(([biz, cats]) => {
        setBusiness(biz)
        setCategories(cats)
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleDelete = async () => {
    if (!id || !confirm('Delete this business? This cannot be undone.')) return
    await api.del(`/api/businesses/${id}`)
    navigate('/dashboard')
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

  if (!business) return null

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Edit Business</h1>
              <p className="text-muted-foreground">Update your business information</p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>

          <BusinessForm categories={categories} business={business} />
        </div>
      </main>
    </div>
  )
}
