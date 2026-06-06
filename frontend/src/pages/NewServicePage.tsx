import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useSession } from '@/lib/auth-client'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { ImageUpload } from '@/components/image-upload'
import { ArrowLeft } from 'lucide-react'
import { SERVICE_CATEGORIES } from './ServicesPage'

const AVAILABILITY_OPTIONS = [
  'Weekdays', 'Weekends', 'Weekdays & Weekends', 'Mornings Only',
  'Evenings Only', 'Flexible', 'By Appointment', 'On-Call',
]

export function NewServicePage() {
  const navigate = useNavigate()
  const { data: session } = useSession()

  const [name, setName] = useState(session?.user?.name ?? '')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [rate, setRate] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(session?.user?.email ?? '')
  const [availability, setAvailability] = useState('')
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/services', {
        name, category, description,
        rate: rate || undefined,
        location: location || undefined,
        phone: phone || undefined,
        email: email || undefined,
        availability: availability || undefined,
        image: image || undefined,
      })
      navigate('/services')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link to="/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Services
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Offer a Service</h1>
            <p className="text-muted-foreground">Let the community know what you can help with</p>
          </div>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="font-medium">Your Name / Service Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required
                    placeholder="e.g. John Smith or John's Plumbing" className="h-10 border-border/60" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-medium">Service Category *</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger className="h-10 border-border/60">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-medium">Availability</Label>
                    <Select value={availability} onValueChange={setAvailability}>
                      <SelectTrigger className="h-10 border-border/60">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABILITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="font-medium">Description *</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                    required rows={5} placeholder="Describe what you offer, your experience, and what makes you the right person for the job..."
                    className="border-border/60 resize-none" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="rate" className="font-medium">Rate / Pricing</Label>
                    <Input id="rate" value={rate} onChange={(e) => setRate(e.target.value)}
                      placeholder="e.g. GH₵50/hr, Negotiable" className="h-10 border-border/60" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="font-medium">Location</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)}
                      placeholder="City or Area" className="h-10 border-border/60" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="font-medium">Phone</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233 XX XXX XXXX" className="h-10 border-border/60" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="font-medium">Contact Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com" className="h-10 border-border/60" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-medium">Profile / Work Photo <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <ImageUpload value={image} onChange={setImage} onClear={() => setImage('')} />
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={loading || !category}
                    className="flex-1 h-11 shadow-sm shadow-primary/20 font-medium">
                    {loading ? 'Posting…' : 'Post Service'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate(-1)} className="h-11 px-6 border-border/60">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
