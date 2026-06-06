import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { Header } from '@/components/header'
import { BusinessForm } from '@/components/business-form'
import { ArrowLeft } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  icon: string
}

export function NewBusinessPage() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    api.get<Category[]>('/api/categories').then(setCategories).catch(console.error)
  }, [])

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Add New Business</h1>
            <p className="text-muted-foreground">
              Fill out the form below to list your business in our directory
            </p>
          </div>

          <BusinessForm categories={categories} />
        </div>
      </main>
    </div>
  )
}
