import { useState, useEffect } from 'react'
import { getMenu, getCategories } from '@/services/handlers'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/catalog/ProductCard'

export default function CatalogPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null) // null = all
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [menuData, catData] = await Promise.all([
        getMenu(),
        getCategories(),
      ])
      if (!cancelled) {
        setProducts(menuData)
        setCategories(catData)
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Combos always first, then the rest
  const sorted = [...products].sort((a, b) => {
    if (a.isCombo && !b.isCombo) return -1
    if (!a.isCombo && b.isCombo) return 1
    return 0
  })

  const filtered = activeCategory
    ? sorted.filter((p) => p.category === activeCategory)
    : sorted

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        Cargando menú...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Menú</h1>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory(null)}
        >
          Todos
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.icon} {cat.name}
          </Button>
        ))}
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-gray-500 dark:text-gray-400">
          No hay productos disponibles en esta categoría
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
