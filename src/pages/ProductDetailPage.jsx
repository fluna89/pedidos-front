import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMenuItem, getFlavors } from '@/services/handlers'
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
import ComboWizard from '@/components/catalog/ComboWizard'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [allFlavors, setAllFlavors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getMenuItem(Number(id))

        if (data.isCombo) {
          // Combos handle their own flavor loading via ComboWizard
          if (!cancelled) {
            setProduct(data)
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

  function handleAdd(format, extras, comment, flavors) {
    addItem(product, format, extras, comment, flavors || [])
    setTimeout(() => navigate('/menu'), 800)
  }

  function handleComboAdd({ comboSteps, unitPrice }) {
    addItem(
      product,
      { id: product.formats[0]?.id, name: product.name, price: unitPrice },
      [],
      '',
      [],
      comboSteps,
    )
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
          {!product.isCombo && (
            <>
              <CardTitle className="mt-3">{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {product.isCombo ? (
            <ComboWizard combo={product} onAdd={handleComboAdd} />
          ) : (
            <ProductDetailView
              product={product}
              allFlavors={allFlavors}
              onAdd={handleAdd}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
