import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InquiryList } from '@/components/inquiry-list'
import { ArrowLeft, Mail } from 'lucide-react'

interface Inquiry {
  id: number
  name: string
  email: string
  phone: string | null
  message: string
  isRead: boolean
  createdAt: string
}

export function InquiriesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get<Inquiry[]>(`/api/inquiries/${id}`),
      api.get<{ name: string }>(`/api/businesses/${id}/mine`),
    ])
      .then(([inqs, biz]) => {
        setInquiries(inqs)
        setBusinessName(biz.name)
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [id, navigate])

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

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Inquiries</h1>
            <p className="text-muted-foreground">
              Messages from people interested in {businessName}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Messages ({inquiries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inquiries.length > 0 ? (
                <InquiryList inquiries={inquiries} />
              ) : (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No inquiries yet</h3>
                  <p className="text-muted-foreground">
                    When someone contacts you about your business, their message will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
