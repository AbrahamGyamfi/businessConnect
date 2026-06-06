import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { CategoryIcon } from '@/components/category-icon'

interface Category {
  id: number
  name: string
  slug: string
  icon: string
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    api.get<Category[]>('/api/categories').then(setCategories).catch(console.error)
  }, [])

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Categories</h1>
            <p className="text-muted-foreground">
              Browse businesses by category to find exactly what you need
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} to={`/directory?category=${category.slug}`}>
                <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <CategoryIcon icon={category.icon} className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      View all {category.name.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
