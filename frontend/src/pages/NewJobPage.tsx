import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { ImageUpload } from '@/components/image-upload'
import { ArrowLeft } from 'lucide-react'

const JOB_TYPES = ['full-time', 'part-time', 'freelance', 'contract', 'internship', 'volunteer']

export function NewJobPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [jobType, setJobType] = useState('full-time')
  const [location, setLocation] = useState('')
  const [salary, setSalary] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/jobs', {
        title, description, jobType,
        location: location || undefined,
        salary: salary || undefined,
        contactEmail,
        image: image || undefined,
      })
      navigate('/jobs')
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
          <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Jobs
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Post a Job</h1>
            <p className="text-muted-foreground">Share an opportunity with the church community</p>
          </div>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="font-medium">Job Title *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Graphic Designer, Plumber" className="h-10 border-border/60" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="jobType" className="font-medium">Job Type *</Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger className="h-10 border-border/60"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {JOB_TYPES.map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">{t.replace('-', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="font-medium">Location</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or Remote" className="h-10 border-border/60" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="font-medium">Description *</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} placeholder="Describe the role, requirements, and what you're looking for..." className="border-border/60 resize-none" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="salary" className="font-medium">Compensation</Label>
                    <Input id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. $50k–$70k, Hourly" className="h-10 border-border/60" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contactEmail" className="font-medium">Contact Email *</Label>
                    <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required placeholder="how applicants reach you" className="h-10 border-border/60" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-medium">Job Image <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <ImageUpload value={image} onChange={setImage} onClear={() => setImage('')} />
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={loading} className="flex-1 h-11 shadow-sm shadow-primary/20 font-medium">
                    {loading ? 'Posting…' : 'Post Job'}
                  </Button>
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
