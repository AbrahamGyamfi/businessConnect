import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mediaUrl } from '@/lib/utils'
import { Users, Store, Briefcase, Calendar, BookOpen, CheckCircle, XCircle, Star, ShieldCheck, Shield } from 'lucide-react'

interface Stats { totalUsers: number; totalBusinesses: number; pendingBusinesses: number; totalJobs: number; totalEvents: number; totalBookings: number }
interface BusinessRow { business: any; owner: { id: string; name: string } | null }
interface MemberRow { id: string; name: string; email?: string; image: string | null; role: string; isVerified: boolean }

export function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [businesses, setBusinesses] = useState<BusinessRow[]>([])
  const [members, setMembers] = useState<MemberRow[]>([])
  const [setupEmail, setSetupEmail] = useState('')
  const [setupSecret, setSetupSecret] = useState('')
  const [setupMsg, setSetupMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Stats>('/api/admin/stats'),
      api.get<BusinessRow[]>('/api/admin/businesses'),
      api.get<MemberRow[]>('/api/admin/members'),
    ]).then(([s, b, m]) => { setStats(s); setBusinesses(b); setMembers(m) })
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  const updateBusiness = async (id: number, patch: object) => {
    await api.patch(`/api/admin/businesses/${id}`, patch)
    setBusinesses((prev) => prev.map((r) => r.business.id === id ? { ...r, business: { ...r.business, ...patch } } : r))
  }

  const updateMember = async (id: string, patch: object) => {
    await api.patch(`/api/admin/members/${id}`, patch)
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, ...patch } : m))
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const r = await api.post<{ message: string }>('/api/admin/setup', { email: setupEmail, secret: setupSecret })
      setSetupMsg(r.message)
    } catch (err) { setSetupMsg(err instanceof Error ? err.message : 'Failed') }
  }

  const StatCard = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) => (
    <Card className="border-border/60">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent ? 'bg-destructive/10' : 'bg-primary/10'}`}>{icon}</div>
        <div><p className="text-2xl font-bold text-foreground">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />
      <section className="bg-gradient-to-br from-primary/8 via-background to-secondary/20 py-12 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">Manage the platform, approve listings, and verify members.</p>
        </div>
      </section>

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <Tabs defaultValue="overview">
              <TabsList className="mb-8 bg-muted/50 border border-border/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="businesses">Businesses {stats?.pendingBusinesses ? <Badge className="ml-1 h-4 px-1 text-xs bg-destructive text-white">{stats.pendingBusinesses}</Badge> : null}</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="setup">Setup</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                {stats && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard icon={<Users className="h-6 w-6 text-primary" />} label="Total Members" value={stats.totalUsers} />
                    <StatCard icon={<Store className="h-6 w-6 text-primary" />} label="Businesses" value={stats.totalBusinesses} />
                    <StatCard icon={<Store className="h-6 w-6 text-destructive" />} label="Pending Approval" value={stats.pendingBusinesses} accent />
                    <StatCard icon={<Briefcase className="h-6 w-6 text-primary" />} label="Jobs Posted" value={stats.totalJobs} />
                    <StatCard icon={<Calendar className="h-6 w-6 text-primary" />} label="Events" value={stats.totalEvents} />
                    <StatCard icon={<BookOpen className="h-6 w-6 text-primary" />} label="Booking Requests" value={stats.totalBookings} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="businesses">
                <div className="space-y-3">
                  {businesses.map(({ business: biz, owner }) => (
                    <Card key={biz.id} className={`border-border/60 ${!biz.isApproved ? 'border-l-4 border-l-destructive/50' : ''}`}>
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {biz.image && <img src={mediaUrl(biz.image)} alt={biz.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{biz.name}</p>
                            <p className="text-xs text-muted-foreground">{owner?.name ?? 'Unknown'} · {new Date(biz.createdAt).toLocaleDateString()}</p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {!biz.isApproved && <Badge variant="destructive" className="text-xs">Pending</Badge>}
                              {biz.isFeatured && <Badge className="text-xs bg-accent text-accent-foreground">Featured</Badge>}
                              <span className="text-xs text-muted-foreground">{biz.views} views</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap">
                          {!biz.isApproved ? (
                            <Button size="sm" onClick={() => updateBusiness(biz.id, { isApproved: true })} className="gap-1 h-8 text-xs">
                              <CheckCircle className="h-3 w-3" /> Approve
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => updateBusiness(biz.id, { isApproved: false })} className="gap-1 h-8 text-xs border-border/60">
                              <XCircle className="h-3 w-3" /> Revoke
                            </Button>
                          )}
                          <Button size="sm" variant={biz.isFeatured ? 'secondary' : 'outline'} onClick={() => updateBusiness(biz.id, { isFeatured: !biz.isFeatured })} className="gap-1 h-8 text-xs border-border/60">
                            <Star className="h-3 w-3" /> {biz.isFeatured ? 'Unfeature' : 'Feature'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {!businesses.length && <p className="text-center text-muted-foreground py-12">No businesses yet.</p>}
                </div>
              </TabsContent>

              <TabsContent value="members">
                <div className="space-y-3">
                  {members.map((m) => (
                    <Card key={m.id} className="border-border/60">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                            {m.image ? <img src={mediaUrl(m.image)} alt={m.name} className="w-full h-full object-cover" /> : <span className="text-primary font-bold">{m.name.charAt(0).toUpperCase()}</span>}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{m.name}</p>
                            <div className="flex gap-2 mt-0.5 flex-wrap">
                              <Badge variant={m.role === 'admin' ? 'default' : 'secondary'} className="text-xs">{m.role}</Badge>
                              {m.isVerified && <Badge className="text-xs bg-primary/10 text-primary border-primary/20 gap-1"><ShieldCheck className="h-2.5 w-2.5" />Verified</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap">
                          <Button size="sm" variant={m.isVerified ? 'secondary' : 'outline'} onClick={() => updateMember(m.id, { isVerified: !m.isVerified })} className="gap-1 h-8 text-xs border-border/60">
                            <ShieldCheck className="h-3 w-3" /> {m.isVerified ? 'Unverify' : 'Verify'}
                          </Button>
                          {m.role !== 'admin' && (
                            <Button size="sm" variant="outline" onClick={() => updateMember(m.id, { role: 'admin' })} className="gap-1 h-8 text-xs border-border/60">
                              <Shield className="h-3 w-3" /> Make Admin
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="setup">
                <Card className="max-w-md border-border/60">
                  <CardHeader><CardTitle className="text-base">Promote User to Admin</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Use the ADMIN_SETUP_SECRET env var to promote a user. Or run SQL: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">UPDATE "user" SET role='admin' WHERE email='you@example.com';</code></p>
                    <form onSubmit={handleSetup} className="space-y-3">
                      <Input placeholder="User email" value={setupEmail} onChange={(e) => setSetupEmail(e.target.value)} className="h-9 border-border/60" />
                      <Input placeholder="Admin setup secret" type="password" value={setupSecret} onChange={(e) => setSetupSecret(e.target.value)} className="h-9 border-border/60" />
                      <Button type="submit" size="sm" className="w-full h-9">Promote to Admin</Button>
                      {setupMsg && <p className="text-sm font-medium text-primary">{setupMsg}</p>}
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}
