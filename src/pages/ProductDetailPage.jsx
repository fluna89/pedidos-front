import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getMenuItem, getFlavors } from '@/services/handlers'
import { useCart } from '@/hooks/useCart'
import useStoreStatus from '@/hooks/useStoreStatus'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import ProductDetailView from '@/components/catalog/ProductDetailView'
import ComboWizard from '@/components/catalog/ComboWizard'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { addItem, replaceItem } = useCart()
  const { isOpen: storeIsOpen, message: storeClosedMessage } = useStoreStatus()

  // Edit mode: passed via navigation state from CartPage
  const editCartId = location.state?.editCartId ?? null
  const editItem = location.state?.editItem ?? null
  const isEditing = !!editCartId

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

  const goBack = isEditing ? '/cart' : '/menu'

  function handleAdd(format, extras, comment, flavors) {
    if (isEditing) {
      replaceItem(editCartId, product, format, extras, comment, flavors || [])
    } else {
      addItem(product, format, extras, comment, flavors || [])
    }
    setTimeout(() => navigate(goBack), 800)
  }

  function handleComboAdd({ comboSteps, unitPrice }) {
    const format = { id: product.formats[0]?.id, name: product.name, price: unitPrice }
    if (isEditing) {
      replaceItem(editCartId, product, format, [], '', [], comboSteps)
    } else {
      addItem(product, format, [], '', [], comboSteps)
    }
    setTimeout(() => navigate(goBack), 800)
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
            onClick={() => navigate(goBack)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {isEditing ? 'Volver al carrito' : 'Volver al menú'}
          </Button>
          {!product.isCombo && (
            <>
              <CardTitle className="mt-3">{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {!storeIsOpen && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {storeClosedMessage || 'El local está cerrado. No se pueden agregar productos.'}
            </div>
          )}
          {product.isCombo ? (
            <ComboWizard
              combo={product}
              onAdd={storeIsOpen ? handleComboAdd : null}
              initialSteps={isEditing ? editItem?.comboSteps : undefined}
              editMode={isEditing}
            />
          ) : (
            <ProductDetailView
              product={product}
              allFlavors={allFlavors}
              onAdd={storeIsOpen ? handleAdd : null}
              editMode={isEditing}
              initialState={isEditing ? {
                format: product.formats.find((f) => f.id === editItem?.format?.id) || editItem?.format,
                flavorQuantities: editItem?.flavors?.reduce((acc, f) => ({ ...acc, [f.id]: f.quantity || 1 }), {}) || {},
                extras: editItem?.extras || [],
                comment: editItem?.comment || '',
              } : undefined}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
