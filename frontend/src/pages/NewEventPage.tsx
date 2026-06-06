import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ImageUpload } from '@/components/image-upload'
import { ArrowLeft } from 'lucide-react'

export function NewEventPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [location, setLocation] = useState('')
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const dateTime = eventTime ? `${eventDate}T${eventTime}:00` : `${eventDate}T09:00:00`
      await api.post('/api/events', {
        title, description, eventDate: dateTime,
        location: location || undefined, image: image || undefined,
      })
      navigate('/events')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link to="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Post an Event</h1>
            <p className="text-muted-foreground">Share a community event with church members</p>
          </div>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="ev-title" className="font-medium">Event Title *</Label>
                  <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Church Business Fair 2026" className="h-10 border-border/60" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ev-date" className="font-medium">Date *</Label>
                    <Input id="ev-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required className="h-10 border-border/60" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ev-time" className="font-medium">Time</Label>
                    <Input id="ev-time" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="h-10 border-border/60" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ev-loc" className="font-medium">Location</Label>
                  <Input id="ev-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Address or venue name" className="h-10 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ev-desc" className="font-medium">Description *</Label>
                  <Textarea id="ev-desc" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} placeholder="What will happen at this event?" className="border-border/60 resize-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-medium">Event Image <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <ImageUpload value={image} onChange={setImage} onClear={() => setImage('')} />
                </div>
                {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3"><p className="text-sm text-destructive font-medium">{error}</p></div>}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={loading} className="flex-1 h-11 shadow-sm shadow-primary/20 font-medium">{loading ? 'Posting…' : 'Post Event'}</Button>
                  <Button type="button" variant="outline" onClick={() => navigate(-1)} className="h-11 px-6 border-border/60">Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
