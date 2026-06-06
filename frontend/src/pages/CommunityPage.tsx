import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/utils'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Store, ExternalLink } from 'lucide-react'

interface Member {
  id: string; name: string; image: string | null; listingCount: number
}

export function CommunityPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Member[]>('/api/members')
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-background to-secondary/20 py-16 border-b border-border/50">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Users className="h-3 w-3" /> Our Community
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-3 tracking-tight">
              Meet the Members
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover church members who are sharing their businesses and services with our community.
            </p>
            {!loading && (
              <p className="mt-4 text-sm font-medium text-primary">
                {members.length} member{members.length !== 1 ? 's' : ''} with active listings
              </p>
            )}
          </div>
        </div>
      </section>

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Users className="h-10 w-10 text-primary/50" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No members yet</h2>
              <p className="text-muted-foreground mb-6">Be the first to list your business in our community!</p>
              <Button asChild>
                <Link to="/sign-up">Get Started</Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {members.map((member) => (
                <Card key={member.id} className="group hover:shadow-lg hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300 border-border/60 hover:border-primary/30 overflow-hidden">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 ring-2 ring-border/50 group-hover:ring-primary/30 transition-all">
                      {member.image
                        ? <img src={mediaUrl(member.image)} alt={member.name} className="w-full h-full object-cover" />
                        : <span className="text-2xl font-bold text-primary">{member.name.charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">Church Member</p>
                    <Badge variant="secondary" className="mb-4 gap-1 text-xs">
                      <Store className="h-3 w-3" />
                      {member.listingCount} listing{member.listingCount !== 1 ? 's' : ''}
                    </Badge>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 border-border/60 hover:border-primary/40 text-xs" asChild>
                      <Link to={`/community/${member.id}`}>
                        View Profile <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
