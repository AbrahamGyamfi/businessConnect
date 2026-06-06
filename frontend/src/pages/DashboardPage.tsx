import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { updateUser, useSession } from '@/lib/auth-client'
import { mediaUrl } from '@/lib/utils'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CategoryIcon } from '@/components/category-icon'
import { StarRating } from '@/components/star-rating'
import { Plus, Settings, MessageSquare, Store, Camera, Save, Loader2, Eye, Wrench, Pencil, Trash2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

interface BusinessItem {
  business: {
    id: number
    name: string
    slug: string
    image: string | null
    isFeatured: boolean
    isApproved: boolean
    views: number
  }
  category: { name: string; icon: string } | null
  avgRating: string | null
  reviewCount: string
}

export function DashboardPage() {
  const { data: session } = useSession()
  const [businesses, setBusinesses] = useState<BusinessItem[]>([])
  const [myServices, setMyServices] = useState<{ id: number; name: string; category: string; isActive: boolean }[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [profileName, setProfileName] = useState('')
  const [profileImage, setProfileImage] = useState<string | undefined>()
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      api.get<BusinessItem[]>('/api/businesses/mine'),
      api.get<{ count: number }>('/api/inquiries/unread-count'),
      api.get<{ service: { id: number; name: string; category: string; isActive: boolean } }[]>('/api/services/mine'),
    ])
      .then(([biz, { count }, svcs]) => {
        setBusinesses(biz)
        setUnreadCount(count)
        setMyServices(svcs.map(s => s.service))
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (session?.user) {
      setProfileName(session.user.name ?? '')
      setProfileImage(session.user.image ?? undefined)
    }
  }, [session])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', credentials: 'include', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      setProfileImage(url)
    } catch {
      alert('Image upload failed. Please try again.')
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await updateUser({ name: profileName, image: profileImage ?? null })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } catch {
      alert('Failed to save profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {session?.user?.name?.split(' ')[0]}
              </p>
            </div>
            <Button asChild>
              <Link to="/dashboard/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Business
              </Link>
            </Button>
          </div>

          {/* Profile Settings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-base">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Avatar upload */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div
                    className="relative group cursor-pointer w-24 h-24"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center ring-4 ring-border/50">
                      {uploadingAvatar ? (
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      ) : profileImage ? (
                        <img src={mediaUrl(profileImage)} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-primary">
                          {profileName.charAt(0).toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    {!uploadingAvatar && (
                      <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Click to change</p>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>

                {/* Name + save */}
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-name">Display Name</Label>
                    <Input
                      id="profile-name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input value={session?.user?.email ?? ''} disabled className="opacity-60" />
                  </div>
                  <Button onClick={handleSaveProfile} disabled={savingProfile} size="sm">
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {profileSaved ? 'Saved!' : 'Save Profile'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{businesses.length}</p>
                    <p className="text-sm text-muted-foreground">Your Businesses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
                    <p className="text-sm text-muted-foreground">Unread Inquiries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Businesses</CardTitle>
            </CardHeader>
            <CardContent>
              {businesses.length > 0 ? (
                <div className="space-y-4">
                  {businesses.map(({ business, category, avgRating, reviewCount }) => (
                    <div
                      key={business.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {business.image ? (
                            <img
                              src={mediaUrl(business.image)}
                              alt={business.name}
                              className="w-full h-full object-cover"
                            />
                          ) : category ? (
                            <div className="w-full h-full flex items-center justify-center bg-secondary">
                              <CategoryIcon
                                icon={category.icon}
                                className="h-6 w-6 text-muted-foreground"
                              />
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{business.name}</h3>
                            {business.isFeatured && (
                              <Badge variant="secondary" className="text-xs">
                                Featured
                              </Badge>
                            )}
                            {!business.isApproved && (
                              <Badge variant="outline" className="text-xs">
                                Pending
                              </Badge>
                            )}
                          </div>
                          {category && (
                            <p className="text-sm text-muted-foreground">{category.name}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <div className="flex items-center gap-1">
                              <StarRating rating={avgRating ? Number(avgRating) : 0} size="sm" />
                              <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
                            </div>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="h-3 w-3" />{business.views ?? 0} views
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/business/${business.slug}`}>View</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/dashboard/${business.id}`}>
                            <Settings className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/dashboard/${business.id}/inquiries`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Store className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No businesses yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by adding your first business listing
                  </p>
                  <Button asChild>
                    <Link to="/dashboard/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Business
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Services */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />My Services
                </CardTitle>
                <Button asChild size="sm" className="shadow-sm shadow-primary/20">
                  <Link to="/services/new"><Plus className="mr-2 h-4 w-4" />Offer a Service</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {myServices.length > 0 ? (
                <div className="space-y-3">
                  {myServices.map((svc) => (
                    <div key={svc.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Wrench className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{svc.name}</p>
                          <p className="text-xs text-muted-foreground">{svc.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant={svc.isActive ? 'default' : 'secondary'} className="text-xs">
                          {svc.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
                          <Link to={`/services/${svc.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={async () => {
                            if (!confirm('Delete this service listing?')) return
                            await api.del(`/api/services/${svc.id}`)
                            setMyServices(prev => prev.filter(s => s.id !== svc.id))
                          }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wrench className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No services listed yet</h3>
                  <p className="text-muted-foreground mb-4">Let the community know what services you offer</p>
                  <Button asChild>
                    <Link to="/services/new"><Plus className="mr-2 h-4 w-4" />Offer a Service</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
