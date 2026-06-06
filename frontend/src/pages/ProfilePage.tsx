import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/utils'
import { Header } from '@/components/header'
import { BusinessCard } from '@/components/business-card'
import { JobCard } from '@/components/job-card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Briefcase, ShieldCheck } from 'lucide-react'

interface Member { id: string; name: string; image: string | null; listingCount: number }

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const [member, setMember] = useState<Member | null>(null)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    Promise.all([
      api.get<Member[]>('/api/members').then((list) => list.find((m) => m.id === userId) ?? null),
      api.get<any[]>(`/api/members/${userId}/businesses`),
      api.get<any[]>('/api/jobs').then((items) => items.filter((item: any) => item.poster?.id === userId)),
    ]).then(([m, bizes, js]) => {
      setMember(m)
      setBusinesses(bizes)
      setJobs(js)
    }).catch(console.error).finally(() => setLoading(false))
  }, [userId])

  if (loading) return (
    <div className="min-h-svh flex flex-col"><Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </div>
  )

  if (!member) return (
    <div className="min-h-svh flex flex-col"><Header />
      <div className="flex-1 flex items-center justify-center text-muted-foreground">Member not found.</div>
    </div>
  )

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />

      {/* Profile hero */}
      <section className="bg-gradient-to-br from-primary/8 via-background to-secondary/20 py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-4 ring-border/50 overflow-hidden shrink-0">
              {member.image ? <img src={mediaUrl(member.image)} alt={member.name} className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-primary">{member.name.charAt(0).toUpperCase()}</span>}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h1 className="text-3xl font-bold text-foreground">{member.name}</h1>
                <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 text-xs">
                  <ShieldCheck className="h-3 w-3" /> Church Member
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{member.listingCount} business listing{member.listingCount !== 1 ? 's' : ''}</p>
              <div className="flex gap-4 mt-4 justify-center sm:justify-start text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-primary/60" />{businesses.length} business{businesses.length !== 1 ? 'es' : ''}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-primary/60" />{jobs.length} job{jobs.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="businesses">
            <TabsList className="mb-8 bg-muted/50 border border-border/50">
              <TabsTrigger value="businesses" className="gap-2"><Building2 className="h-4 w-4" />Businesses ({businesses.length})</TabsTrigger>
              <TabsTrigger value="jobs" className="gap-2"><Briefcase className="h-4 w-4" />Jobs ({jobs.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="businesses">
              {businesses.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.map((biz: any) => (
                    <BusinessCard key={biz.id} business={biz} category={null} avgRating={null} reviewCount={0} />
                  ))}
                </div>
              ) : <p className="text-muted-foreground py-12 text-center">No businesses listed yet.</p>}
            </TabsContent>
            <TabsContent value="jobs">
              {jobs.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((item: any) => <JobCard key={item.job.id} job={item.job} poster={item.poster} />)}
                </div>
              ) : <p className="text-muted-foreground py-12 text-center">No jobs posted yet.</p>}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
