import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMenuItem, getFlavors } from '@/mocks/handlers'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import ProductDetailView from '@/components/catalog/ProductDetailView'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [allFlavors, setAllFlavors] = useState([])
  const [comboFlavorsMap, setComboFlavorsMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getMenuItem(Number(id))

        if (data.isCombo && data.comboItems) {
          const sources = [
            ...new Set(data.comboItems.map((ci) => ci.flavorsSource ?? 'default')),
          ]
          const entries = await Promise.all(
            sources.map(async (src) => [
              src,
              await getFlavors(src === 'default' ? undefined : src),
            ]),
          )
          if (!cancelled) {
            setProduct(data)
            setComboFlavorsMap(Object.fromEntries(entries))
          }
        } else {
          const flavors = await getFlavors(data.flavorsSource)
          if (!cancelled) {
            setProduct(data)
            setAllFlavors(flavors)
          }
        }
      } catch {
        if (!cancelled) navigate('/menu', { replace: true })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id, navigate])

  function handleAdd(format, extras, comment, flavors, comboSelections) {
    addItem(product, format, extras, comment, flavors || [], comboSelections || null)
    setTimeout(() => navigate('/menu'), 800)
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        Cargando...
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="flex justify-center pt-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Button
            variant="outline"
            size="sm"
            className="mb-2 w-fit"
            onClick={() => navigate('/menu')}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver al menú
          </Button>
          <CardTitle className="mt-3">{product.name}</CardTitle>
          <CardDescription>{product.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductDetailView
            product={product}
            allFlavors={allFlavors}
            comboFlavorsMap={comboFlavorsMap}
            onAdd={handleAdd}
          />
        </CardContent>
      </Card>
    </div>
  )
}
