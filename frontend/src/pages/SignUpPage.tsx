import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '@/lib/auth-client'
import { AuthForm } from '@/components/auth-form'

export function SignUpPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if (!isPending && session?.user) {
      navigate('/dashboard', { replace: true })
    }
  }, [session, isPending, navigate])

  if (isPending) return null

  return <AuthForm mode="sign-up" />
}
