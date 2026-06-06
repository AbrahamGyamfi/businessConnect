import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '@/lib/auth-client'
import { api } from '@/lib/api'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    if (session?.user) {
      api.get<{ isAdmin: boolean }>('/api/admin/check')
        .then(({ isAdmin }) => setIsAdmin(isAdmin))
        .catch(() => setIsAdmin(false))
    } else if (!isPending) {
      setIsAdmin(false)
    }
  }, [session, isPending])

  if (isPending || isAdmin === null) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}
