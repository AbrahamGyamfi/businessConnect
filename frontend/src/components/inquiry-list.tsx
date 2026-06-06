import { useState } from 'react'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Phone, Clock, Check } from 'lucide-react'

interface Inquiry {
  id: number
  name: string
  email: string
  phone: string | null
  message: string
  isRead: boolean
  createdAt: string
}

export function InquiryList({ inquiries: initialInquiries }: { inquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState(initialInquiries)

  const handleMarkAsRead = async (id: number) => {
    await api.patch(`/api/inquiries/${id}/read`, {})
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, isRead: true } : inq)))
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <div
          key={inquiry.id}
          className={`p-4 border rounded-lg ${!inquiry.isRead ? 'bg-primary/5 border-primary/20' : ''}`}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">{inquiry.name}</h3>
                {!inquiry.isRead && (
                  <Badge variant="secondary" className="text-xs">
                    New
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <a
                  href={`mailto:${inquiry.email}`}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Mail className="h-3 w-3" />
                  {inquiry.email}
                </a>
                {inquiry.phone && (
                  <a
                    href={`tel:${inquiry.phone}`}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Phone className="h-3 w-3" />
                    {inquiry.phone}
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(inquiry.createdAt).toLocaleDateString()}
            </div>
          </div>
          <p className="text-foreground whitespace-pre-wrap">{inquiry.message}</p>
          {!inquiry.isRead && (
            <div className="mt-3 pt-3 border-t">
              <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(inquiry.id)}>
                <Check className="h-4 w-4 mr-2" />
                Mark as Read
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
