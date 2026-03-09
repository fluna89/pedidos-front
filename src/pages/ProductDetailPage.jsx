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
import { ArrowLeft, Check, Minus, Plus, ShoppingCart } from 'lucide-react'
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
  const [flavorQuantities, setFlavorQuantities] = useState({})
  const [comboSelections, setComboSelections] = useState([])
  const [comboFlavorsMap, setComboFlavorsMap] = useState({})
  const [selectedExtras, setSelectedExtras] = useState([])
  const [comment, setComment] = useState('')
  const [added, setAdded] = useState(false)

  const isQuantityMode = product?.flavorMode === 'quantity'
  const isUnitPricing = product?.unitPricing === true
  const isCombo = product?.isCombo === true
  const hasFlavorPrices = allFlavors.length > 0 && allFlavors[0].price != null

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getMenuItem(Number(id))

        if (data.isCombo && data.comboItems) {
          // Load flavors for each unique source in combo items
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
            setComboSelections(data.comboItems.map(() => ({})))
            if (data.formats.length === 1) setSelectedFormat(data.formats[0])
          }
        } else {
          const flavors = await getFlavors(data.flavorsSource)
          if (!cancelled) {
            setProduct(data)
            setAllFlavors(flavors)
            if (data.formats.length === 1) setSelectedFormat(data.formats[0])
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
  const unitCount = selectedFormat?.unitCount ?? 0
  const totalQuantity = Object.values(flavorQuantities).reduce(
    (sum, q) => sum + q,
    0,
  )

  // Compute total from per-flavor prices when applicable
  const flavorTotal = hasFlavorPrices
    ? Object.entries(flavorQuantities).reduce((sum, [flavorId, qty]) => {
        const flavor = allFlavors.find((f) => f.id === flavorId)
        return sum + (flavor?.price ?? 0) * qty
      }, 0)
    : 0

  // Reset flavors when format changes and new limit is smaller
  function handleFormatSelect(fmt) {
    setSelectedFormat(fmt)
    setSelectedFlavors((prev) =>
      prev.length > fmt.maxFlavors ? prev.slice(0, fmt.maxFlavors) : prev,
    )
    // Reset quantity selections when switching format
    if (product?.flavorMode === 'quantity') {
      setFlavorQuantities({})
    }
  }

  function toggleFlavor(flavor) {
    setSelectedFlavors((prev) => {
      const exists = prev.some((f) => f.id === flavor.id)
      if (exists) return prev.filter((f) => f.id !== flavor.id)
      if (prev.length >= maxFlavors) return prev // at limit
      return [...prev, flavor]
    })
  }

  function incrementFlavor(flavorId) {
    // For priced flavors there is no upper limit; for fixed-count products respect unitCount
    if (!hasFlavorPrices && unitCount > 0 && totalQuantity >= unitCount) return
    setFlavorQuantities((prev) => ({
      ...prev,
      [flavorId]: (prev[flavorId] || 0) + 1,
    }))
  }

  function decrementFlavor(flavorId) {
    setFlavorQuantities((prev) => {
      const current = prev[flavorId] || 0
      if (current <= 0) return prev
      const next = { ...prev, [flavorId]: current - 1 }
      if (next[flavorId] === 0) delete next[flavorId]
      return next
    })
  }

  // ── Combo flavor helpers ────────────────────────────
  function incrementComboFlavor(itemIndex, flavorId) {
    setComboSelections((prev) => {
      const item = { ...prev[itemIndex] }
      const total = Object.values(item).reduce((s, q) => s + q, 0)
      if (total >= product.comboItems[itemIndex].unitCount) return prev
      item[flavorId] = (item[flavorId] || 0) + 1
      const updated = [...prev]
      updated[itemIndex] = item
      return updated
    })
  }

  function decrementComboFlavor(itemIndex, flavorId) {
    setComboSelections((prev) => {
      const item = { ...prev[itemIndex] }
      if ((item[flavorId] || 0) <= 0) return prev
      item[flavorId] = item[flavorId] - 1
      if (item[flavorId] === 0) delete item[flavorId]
      const updated = [...prev]
      updated[itemIndex] = item
      return updated
    })
  }

  function toggleExtra(extra) {
    setSelectedExtras((prev) =>
      prev.some((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra],
    )
  }

  const flavorsComplete = isQuantityMode
    ? hasFlavorPrices
      ? totalQuantity >= 1
      : unitCount > 0 && totalQuantity === unitCount
    : !product?.hasFlavors || (maxFlavors > 0 && selectedFlavors.length >= 1)

  const comboComplete = isCombo
    ? product.comboItems.every((ci, idx) => {
        const sel = comboSelections[idx] || {}
        return Object.values(sel).reduce((s, q) => s + q, 0) === ci.unitCount
      })
    : true

  const canAdd = isCombo
    ? selectedFormat && comboComplete
    : selectedFormat && flavorsComplete

  function handleAddToCart() {
    if (!canAdd) return

    if (isCombo) {
      const comboForCart = product.comboItems.map((ci, idx) => {
        const sel = comboSelections[idx] || {}
        const flavors = comboFlavorsMap[ci.flavorsSource ?? 'default'] || []
        return {
          label: ci.label,
          flavors: flavors
            .filter((f) => sel[f.id] > 0)
            .map((f) => ({ id: f.id, name: f.name, quantity: sel[f.id] })),
        }
      })
      addItem(product, selectedFormat, selectedExtras, comment, [], comboForCart)
      setAdded(true)
      setTimeout(() => navigate('/menu'), 800)
      return
    }

    let flavorsForCart = selectedFlavors
    let formatForCart = selectedFormat

    if (isQuantityMode) {
      flavorsForCart = allFlavors
        .filter((f) => flavorQuantities[f.id] > 0)
        .map((f) => ({
          id: f.id,
          name: f.name,
          quantity: flavorQuantities[f.id],
          ...(f.price != null && { price: f.price }),
        }))
    }

    // For priced-flavor products, build a virtual format with computed total
    if (isUnitPricing && hasFlavorPrices) {
      formatForCart = {
        ...selectedFormat,
        name: `${totalQuantity} ${totalQuantity === 1 ? 'unidad' : 'unidades'}`,
        price: flavorTotal,
      }
    }

    addItem(product, formatForCart, selectedExtras, comment, flavorsForCart)
    setAdded(true)
    setTimeout(() => navigate('/menu'), 800)
  }

  const totalPrice = selectedFormat
    ? (hasFlavorPrices ? flavorTotal : selectedFormat.price) +
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
            variant="outline"
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
          {/* Format selection (hidden for unitPricing products) */}
          {!isUnitPricing && (
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
                    {fmt.maxFlavors > 0 && (
                      <span className="ml-2 text-xs opacity-70">
                        ({fmt.maxFlavors} {fmt.maxFlavors === 1 ? 'sabor' : 'sabores'})
                      </span>
                    )}
                    {fmt.unitCount > 0 && (
                      <span className="ml-2 text-xs opacity-70">
                        ({fmt.unitCount} {fmt.unitCount === 1 ? 'unidad' : 'unidades'})
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
          )}

          {/* Combo items selection */}
          {isCombo && selectedFormat && product.comboItems.map((ci, idx) => {
            const sel = comboSelections[idx] || {}
            const currentTotal = Object.values(sel).reduce((s, q) => s + q, 0)
            const flavors = comboFlavorsMap[ci.flavorsSource ?? 'default'] || []
            const hasFlavImgs = flavors.length > 0 && flavors[0].image

            return (
              <div key={idx} className="space-y-2">
                <Label>
                  {ci.label}{' '}
                  <span
                    className={cn(
                      'text-sm',
                      currentTotal === ci.unitCount
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400 dark:text-gray-500',
                    )}
                  >
                    ({currentTotal} de {ci.unitCount})
                  </span>
                </Label>
                <div className="grid gap-2">
                  {flavors.map((flavor) => {
                    const qty = sel[flavor.id] || 0
                    const atLimit = currentTotal >= ci.unitCount

                    return (
                      <div
                        key={flavor.id}
                        className={cn(
                          'flex items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors',
                          qty > 0
                            ? 'border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-800'
                            : 'border-gray-200 dark:border-gray-700',
                        )}
                      >
                        {hasFlavImgs && (
                          <span className="text-2xl leading-none">
                            {flavor.image}
                          </span>
                        )}
                        <span className="min-w-0 flex-1 font-medium">
                          {flavor.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={qty <= 0}
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-full border transition-colors',
                              qty > 0
                                ? 'border-gray-300 hover:border-gray-500 dark:border-gray-600 dark:hover:border-gray-400'
                                : 'cursor-not-allowed border-gray-100 text-gray-300 dark:border-gray-800 dark:text-gray-600',
                            )}
                            onClick={() => decrementComboFlavor(idx, flavor.id)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center font-medium">
                            {qty}
                          </span>
                          <button
                            type="button"
                            disabled={atLimit}
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-full border transition-colors',
                              atLimit
                                ? 'cursor-not-allowed border-gray-100 text-gray-300 dark:border-gray-800 dark:text-gray-600'
                                : 'border-gray-300 hover:border-gray-500 dark:border-gray-600 dark:hover:border-gray-400',
                            )}
                            onClick={() => incrementComboFlavor(idx, flavor.id)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Flavor selection — toggle mode (ice cream, etc.) */}
          {product.hasFlavors && !isQuantityMode && selectedFormat && (
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

          {/* Flavor selection — quantity mode without per-flavor pricing */}
          {product.hasFlavors && isQuantityMode && !hasFlavorPrices && selectedFormat && (
            <div className="space-y-2">
              <Label>
                Sabores{' '}
                <span
                  className={cn(
                    'text-sm',
                    totalQuantity === unitCount
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500',
                  )}
                >
                  ({totalQuantity} de {unitCount})
                </span>
              </Label>
              <div className="grid gap-2">
                {allFlavors.map((flavor) => {
                  const qty = flavorQuantities[flavor.id] || 0
                  const atLimit = totalQuantity >= unitCount

                  return (
                    <div
                      key={flavor.id}
                      className={cn(
                        'flex items-center justify-between rounded-md border px-4 py-3 text-sm transition-colors',
                        qty > 0
                          ? 'border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-800'
                          : 'border-gray-200 dark:border-gray-700',
                      )}
                    >
                      <span className="font-medium">{flavor.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={qty <= 0}
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full border transition-colors',
                            qty > 0
                              ? 'border-gray-300 hover:border-gray-500 dark:border-gray-600 dark:hover:border-gray-400'
                              : 'cursor-not-allowed border-gray-100 text-gray-300 dark:border-gray-800 dark:text-gray-600',
                          )}
                          onClick={() => decrementFlavor(flavor.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center font-medium">
                          {qty}
                        </span>
                        <button
                          type="button"
                          disabled={atLimit}
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full border transition-colors',
                            atLimit
                              ? 'cursor-not-allowed border-gray-100 text-gray-300 dark:border-gray-800 dark:text-gray-600'
                              : 'border-gray-300 hover:border-gray-500 dark:border-gray-600 dark:hover:border-gray-400',
                          )}
                          onClick={() => incrementFlavor(flavor.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Flavor selection — quantity mode with per-flavor pricing (empanadas, etc.) */}
          {product.hasFlavors && isQuantityMode && hasFlavorPrices && selectedFormat && (
            <div className="space-y-2">
              <Label>
                Gustos{' '}
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  ({totalQuantity} {totalQuantity === 1 ? 'seleccionada' : 'seleccionadas'})
                </span>
              </Label>
              <div className="grid gap-2">
                {allFlavors.map((flavor) => {
                  const qty = flavorQuantities[flavor.id] || 0

                  return (
                    <div
                      key={flavor.id}
                      className={cn(
                        'flex items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors',
                        qty > 0
                          ? 'border-gray-900 bg-gray-50 dark:border-gray-100 dark:bg-gray-800'
                          : 'border-gray-200 dark:border-gray-700',
                      )}
                    >
                      {/* Flavor image */}
                      {flavor.image && (
                        <span className="text-2xl leading-none">
                          {flavor.image}
                        </span>
                      )}

                      {/* Name + unit price */}
                      <div className="min-w-0 flex-1">
                        <span className="font-medium">{flavor.name}</span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ${flavor.price.toLocaleString('es-AR')} c/u
                        </span>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={qty <= 0}
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full border transition-colors',
                            qty > 0
                              ? 'border-gray-300 hover:border-gray-500 dark:border-gray-600 dark:hover:border-gray-400'
                              : 'cursor-not-allowed border-gray-100 text-gray-300 dark:border-gray-800 dark:text-gray-600',
                          )}
                          onClick={() => decrementFlavor(flavor.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center font-medium">
                          {qty}
                        </span>
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 transition-colors hover:border-gray-500 dark:border-gray-600 dark:hover:border-gray-400"
                          onClick={() => incrementFlavor(flavor.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
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
            disabled={!canAdd || added}
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
