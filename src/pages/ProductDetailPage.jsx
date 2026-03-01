import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMenuItem, getFlavors } from '@/mocks/handlers'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { ArrowLeft, Check, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [allFlavors, setAllFlavors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFormat, setSelectedFormat] = useState(null)
  const [selectedFlavors, setSelectedFlavors] = useState([])
  const [selectedExtras, setSelectedExtras] = useState([])
  const [comment, setComment] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [data, flavors] = await Promise.all([
          getMenuItem(Number(id)),
          getFlavors(),
        ])
        if (!cancelled) {
          setProduct(data)
          setAllFlavors(flavors)
          if (data.formats.length === 1) {
            setSelectedFormat(data.formats[0])
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

  const maxFlavors = selectedFormat?.maxFlavors ?? 0

  // Reset flavors when format changes and new limit is smaller
  function handleFormatSelect(fmt) {
    setSelectedFormat(fmt)
    setSelectedFlavors((prev) =>
      prev.length > fmt.maxFlavors ? prev.slice(0, fmt.maxFlavors) : prev,
    )
  }

  function toggleFlavor(flavor) {
    setSelectedFlavors((prev) => {
      const exists = prev.some((f) => f.id === flavor.id)
      if (exists) return prev.filter((f) => f.id !== flavor.id)
      if (prev.length >= maxFlavors) return prev // at limit
      return [...prev, flavor]
    })
  }

  function toggleExtra(extra) {
    setSelectedExtras((prev) =>
      prev.some((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra],
    )
  }

  const flavorsComplete =
    !product?.hasFlavors || (maxFlavors > 0 && selectedFlavors.length >= 1)

  function handleAddToCart() {
    if (!selectedFormat || !flavorsComplete) return
    addItem(product, selectedFormat, selectedExtras, comment, selectedFlavors)
    setAdded(true)
    setTimeout(() => navigate('/menu'), 800)
  }

  const totalPrice = selectedFormat
    ? selectedFormat.price +
      selectedExtras.reduce((sum, e) => sum + e.price, 0)
    : 0

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
            variant="ghost"
            size="sm"
            className="mb-2 w-fit"
            onClick={() => navigate('/menu')}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver al menú
          </Button>
          <div className="flex h-40 items-center justify-center rounded-md bg-gray-100 text-5xl dark:bg-gray-800">
            {product.image ?? '🍽️'}
          </div>
          <CardTitle className="mt-3">{product.name}</CardTitle>
          <CardDescription>{product.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Format selection */}
          <div className="space-y-2">
            <Label>Formato</Label>
            <div className="grid gap-2">
              {product.formats.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  className={cn(
                    'flex items-center justify-between rounded-md border px-4 py-3 text-sm transition-colors',
                    selectedFormat?.id === fmt.id
                      ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                      : 'border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500',
                  )}
                  onClick={() => handleFormatSelect(fmt)}
                >
                  <span>
                    {fmt.name}
                    {fmt.maxFlavors && (
                      <span className="ml-2 text-xs opacity-70">
                        ({fmt.maxFlavors} {fmt.maxFlavors === 1 ? 'sabor' : 'sabores'})
                      </span>
                    )}
                  </span>
                  <span className="font-medium">
                    ${fmt.price.toLocaleString('es-AR')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Flavor selection */}
          {product.hasFlavors && selectedFormat && (
            <div className="space-y-2">
              <Label>
                Sabores{' '}
                <span className="text-gray-400 dark:text-gray-500">
                  ({selectedFlavors.length} de {maxFlavors} máx.)
                </span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {allFlavors.map((flavor) => {
                  const selected = selectedFlavors.some(
                    (f) => f.id === flavor.id,
                  )
                  const atLimit =
                    selectedFlavors.length >= maxFlavors && !selected

                  return (
                    <button
                      key={flavor.id}
                      type="button"
                      disabled={atLimit}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-sm transition-colors',
                        selected
                          ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                          : atLimit
                            ? 'cursor-not-allowed border-gray-100 text-gray-300 dark:border-gray-800 dark:text-gray-600'
                            : 'border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500',
                      )}
                      onClick={() => toggleFlavor(flavor)}
                    >
                      {selected && (
                        <Check className="mr-1 inline h-3.5 w-3.5 align-text-bottom" />
                      )}
                      {flavor.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Extras */}
          {product.extras.length > 0 && (
            <div className="space-y-2">
              <Label>
                Adicionales{' '}
                <span className="text-gray-400 dark:text-gray-500">
                  (opcional)
                </span>
              </Label>
              <div className="grid gap-2">
                {product.extras.map((extra) => {
                  const selected = selectedExtras.some(
                    (e) => e.id === extra.id,
                  )
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      className={cn(
                        'flex items-center justify-between rounded-md border px-4 py-3 text-sm transition-colors',
                        selected
                          ? 'border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-800'
                          : 'border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500',
                      )}
                      onClick={() => toggleExtra(extra)}
                    >
                      <span className="flex items-center gap-2">
                        {selected && (
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                        {extra.name}
                      </span>
                      <span className="font-medium">
                        +${extra.price.toLocaleString('es-AR')}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="item-comment">
              Comentario{' '}
              <span className="text-gray-400 dark:text-gray-500">
                (opcional)
              </span>
            </Label>
            <Textarea
              id="item-comment"
              placeholder="Ej: sin topping, envuelto para regalo..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            disabled={!selectedFormat || !flavorsComplete || added}
            onClick={handleAddToCart}
          >
            {added ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                ¡Agregado!
              </>
            ) : (
              <>
                <ShoppingCart className="mr-1 h-4 w-4" />
                Agregar{' '}
                {selectedFormat
                  ? `— $${totalPrice.toLocaleString('es-AR')}`
                  : ''}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
