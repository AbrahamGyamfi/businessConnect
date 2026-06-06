import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { ImageUpload } from '@/components/image-upload'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface Category { id: number; name: string; slug: string; icon: string }
interface BusinessFormProps {
  categories: Category[]
  business?: {
    id: number; name: string; description: string; categoryId: number
    phone: string | null; email: string | null; website: string | null
    address: string | null; city: string | null; state: string | null
    zipCode: string | null; image: string | null
  }
}

export function BusinessForm({ categories, business }: BusinessFormProps) {
  const navigate = useNavigate()
  const isEditing = !!business
  const [name, setName] = useState(business?.name ?? '')
  const [description, setDescription] = useState(business?.description ?? '')
  const [categoryId, setCategoryId] = useState(business?.categoryId?.toString() ?? '')
  const [phone, setPhone] = useState(business?.phone ?? '')
  const [email, setEmail] = useState(business?.email ?? '')
  const [website, setWebsite] = useState(business?.website ?? '')
  const [address, setAddress] = useState(business?.address ?? '')
  const [city, setCity] = useState(business?.city ?? '')
  const [state, setState] = useState(business?.state ?? '')
  const [zipCode, setZipCode] = useState(business?.zipCode ?? '')
  const [image, setImage] = useState(business?.image ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = {
        name, description, categoryId: parseInt(categoryId),
        phone: phone || undefined, email: email || undefined, website: website || undefined,
        address: address || undefined, city: city || undefined, state: state || undefined,
        zipCode: zipCode || undefined, image: image || undefined,
      }
      if (isEditing) {
        await api.patch(`/api/businesses/${business.id}`, data)
      } else {
        await api.post('/api/businesses', data)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const field = (id: string, label: string, el: React.ReactNode) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="font-medium text-sm">{label}</Label>
      {el}
    </div>
  )

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Basic Info */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <div className="w-1 h-5 rounded-full bg-primary" />
              <h3 className="font-semibold text-foreground">Basic Information</h3>
            </div>
            {field('name', 'Business Name *', (
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required
                placeholder="Your Business Name" className="h-10 border-border/60" />
            ))}
            {field('category', 'Category *', (
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger className="h-10 border-border/60">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            {field('description', 'Description *', (
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                required placeholder="Describe your business and services..." rows={4}
                className="border-border/60 resize-none" />
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-sm">Business Photo</label>
              <ImageUpload value={image} onChange={setImage} onClear={() => setImage('')} />
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <div className="w-1 h-5 rounded-full bg-primary" />
              <h3 className="font-semibold text-foreground">Contact Information</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {field('phone', 'Phone', (
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567" className="h-10 border-border/60" />
              ))}
              {field('email', 'Business Email', (
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@yourbusiness.com" className="h-10 border-border/60" />
              ))}
            </div>
            {field('website', 'Website', (
              <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourbusiness.com" className="h-10 border-border/60" />
            ))}
          </div>

          {/* Location */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
              <div className="w-1 h-5 rounded-full bg-primary" />
              <h3 className="font-semibold text-foreground">Location</h3>
            </div>
            {field('address', 'Street Address', (
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St" className="h-10 border-border/60" />
            ))}
            <div className="grid sm:grid-cols-3 gap-4">
              {field('city', 'City', (
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)}
                  placeholder="City" className="h-10 border-border/60" />
              ))}
              {field('state', 'State', (
                <Input id="state" value={state} onChange={(e) => setState(e.target.value)}
                  placeholder="State" className="h-10 border-border/60" />
              ))}
              {field('zipCode', 'ZIP', (
                <Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)}
                  placeholder="12345" className="h-10 border-border/60" />
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1 h-11 shadow-sm shadow-primary/20 font-medium">
              {loading ? 'Saving…' : isEditing ? 'Update Business' : 'Create Business'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="h-11 px-6 border-border/60">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
