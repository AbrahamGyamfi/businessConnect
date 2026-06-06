import { useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CalendarDays, CheckCircle, Clock } from 'lucide-react'

interface BookingFormProps {
  businessId: number
  businessName: string
}

export function BookingForm({ businessId, businessName }: BookingFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/bookings', {
        businessId, name, email,
        phone: phone || undefined,
        message,
        preferredDate: preferredDate || undefined,
        preferredTime: preferredTime || undefined,
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-8 text-center">
          <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Request Sent!</h3>
          <p className="text-sm text-muted-foreground">
            Your booking request has been sent to {businessName}. They'll be in touch soon.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-5 w-5 text-primary" />
          Request a Booking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bk-name" className="text-sm font-medium">Your Name</Label>
            <Input id="bk-name" value={name} onChange={(e) => setName(e.target.value)} required className="h-9 border-border/60" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bk-email" className="text-sm font-medium">Email</Label>
            <Input id="bk-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-9 border-border/60" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bk-phone" className="text-sm font-medium">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="bk-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 border-border/60" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bk-date" className="text-sm font-medium">Preferred Date</Label>
              <Input id="bk-date" type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} className="h-9 border-border/60" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bk-time" className="text-sm font-medium flex items-center gap-1"><Clock className="h-3 w-3" />Time</Label>
              <Input id="bk-time" type="time" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="h-9 border-border/60" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bk-msg" className="text-sm font-medium">Message</Label>
            <Textarea id="bk-msg" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe what you need..." rows={3} required className="border-border/60 resize-none" />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full h-10 text-sm shadow-sm shadow-primary/20">
            {loading ? 'Sending…' : 'Send Booking Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
