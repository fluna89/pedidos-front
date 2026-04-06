import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowRight, Check, Minus, Plus, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

function isImageKey(image) {
  return image && image.startsWith('products/')
}

function isImageUrl(image) {
  return image && (image.startsWith('/') || image.startsWith('blob:') || image.startsWith('http'))
}

function DetailImage({ image }) {
  const [broken, setBroken] = useState(false)
  if ((isImageKey(image) || isImageUrl(image)) && !broken) {
    const src = isImageKey(image) ? `/${image}` : image
    return (
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setBroken(true)}
      />
    )
  }
  return <span className="text-5xl">{broken ? '🍽️' : (image || '🍽️')}</span>
}

/**
 * Shared product detail view used by both the customer page and the admin preview dialog.
 *
 * Props:
 * - product: product object (real or virtual from admin form)
 * - allFlavors: flavor list
 * - onAdd(format, extras, comment, flavors): called when user clicks the action button
 * - preview: if true, disables the add button functionality
 * - stepMode: if true, shows "Siguiente" instead of "Agregar" (used inside ComboWizard)
 */
export default function ProductDetailView({
  product,
  allFlavors = [],
  onAdd,
  preview = false,
  stepMode = false,
  unitCountOverride,
  initialState,
}) {
  const [selectedFormat, setSelectedFormat] = useState(
    initialState?.format ?? (product.formats.length === 1 ? product.formats[0] : null),
  )
  const [flavorQuantities, setFlavorQuantities] = useState(
    initialState?.flavorQuantities ?? {},
  )
  const [selectedExtras, setSelectedExtras] = useState(
    initialState?.extras ?? [],
  )
  const [comment, setComment] = useState(initialState?.comment ?? '')
  const [added, setAdded] = useState(false)

  const isUnitPricing = product.unitPricing === true
  const hasFlavorPrices = allFlavors.length > 0 && allFlavors[0].price != null
  const showFormats = !isUnitPricing && product.formats.length > 1

  const unitCount = unitCountOverride ?? selectedFormat?.unitCount ?? 0
  const totalQuantity = Object.values(flavorQuantities).reduce(
    (sum, q) => sum + q,
    0,
  )

  const flavorTotal = hasFlavorPrices
    ? Object.entries(flavorQuantities).reduce((sum, [flavorId, qty]) => {
        const flavor = allFlavors.find((f) => f.id === flavorId)
        return sum + (flavor?.price ?? 0) * qty
      }, 0)
    : 0

  function handleFormatSelect(fmt) {
    setSelectedFormat(fmt)
    setFlavorQuantities({})
  }

  function incrementFlavor(flavorId) {
    if (unitCount > 0 && totalQuantity >= unitCount) return
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

  function toggleExtra(extra) {
    setSelectedExtras((prev) =>
      prev.some((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra],
    )
  }

  const flavorsComplete = product.hasFlavors
    ? unitCount > 0
      ? totalQuantity === unitCount
      : hasFlavorPrices
        ? totalQuantity >= 1
        : true
    : true

  const canAdd = selectedFormat && flavorsComplete

  function handleAdd() {
    if (preview || !canAdd || !onAdd) return

    let formatForCart = selectedFormat
    const flavorsForCart = allFlavors
      .filter((f) => flavorQuantities[f.id] > 0)
      .map((f) => ({
        id: f.id,
        name: f.name,
        quantity: flavorQuantities[f.id],
        ...(f.price != null && { price: f.price }),
      }))

    if (isUnitPricing && hasFlavorPrices) {
      formatForCart = {
        ...selectedFormat,
        name: `${totalQuantity} ${totalQuantity === 1 ? 'unidad' : 'unidades'}`,
        price: flavorTotal,
      }
    }

    onAdd(formatForCart, selectedExtras, comment, flavorsForCart)
    setAdded(true)
  }

  const totalPrice = selectedFormat
    ? (hasFlavorPrices ? flavorTotal : selectedFormat.price) +
      selectedExtras.reduce((sum, e) => sum + e.price, 0)
    : 0

  return (
    <div className="space-y-5">
      {/* Image */}
      <div className="mx-auto flex h-48 w-48 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <DetailImage image={product.image} />
      </div>

      {/* Name + description */}
      <div>
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {product.description}
        </p>
      </div>

      {/* Format selection */}
      {showFormats && (
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
                      ({fmt.maxFlavors}{' '}
                      {fmt.maxFlavors === 1 ? 'sabor' : 'sabores'})
                    </span>
                  )}
                  {fmt.unitCount > 0 && (
                    <span className="ml-2 text-xs opacity-70">
                      ({fmt.unitCount}{' '}
                      {fmt.unitCount === 1 ? 'unidad' : 'unidades'})
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

      {/* Flavor selection — quantity mode without per-flavor pricing */}
      {product.hasFlavors &&
        !hasFlavorPrices &&
        selectedFormat && (
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

                if (flavor.paused) {
                  return (
                    <div
                      key={flavor.id}
                      className="flex items-center justify-between rounded-md border border-gray-100 px-4 py-3 text-sm text-gray-300 dark:border-gray-800 dark:text-gray-600"
                    >
                      <span className="font-medium line-through">{flavor.name}</span>
                      <span className="text-xs">No disponible</span>
                    </div>
                  )
                }

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

      {/* Flavor selection — quantity mode with per-flavor pricing */}
      {product.hasFlavors &&
        hasFlavorPrices &&
        selectedFormat && (
          <div className="space-y-2">
            <Label>
              Gustos{' '}
              <span className="text-sm text-gray-400 dark:text-gray-500">
                ({totalQuantity}{' '}
                {totalQuantity === 1 ? 'seleccionada' : 'seleccionadas'})
              </span>
            </Label>
            <div className="grid gap-2">
              {allFlavors.map((flavor) => {
                const qty = flavorQuantities[flavor.id] || 0

                if (flavor.paused) {
                  return (
                    <div
                      key={flavor.id}
                      className="flex items-center gap-3 rounded-md border border-gray-100 px-4 py-3 text-sm text-gray-300 dark:border-gray-800 dark:text-gray-600"
                    >
                      {flavor.image && (
                        <span className="text-2xl leading-none opacity-30">
                          {flavor.image}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="font-medium line-through">{flavor.name}</span>
                      </div>
                      <span className="text-xs">No disponible</span>
                    </div>
                  )
                }

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
                    {flavor.image && (
                      <span className="text-2xl leading-none">
                        {flavor.image}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="font-medium">{flavor.name}</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        ${flavor.price.toLocaleString('es-AR')} c/u
                      </span>
                    </div>
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
              const selected = selectedExtras.some((e) => e.id === extra.id)
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
        <Label htmlFor="pdv-comment">
          Comentario{' '}
          <span className="text-gray-400 dark:text-gray-500">(opcional)</span>
        </Label>
        <Textarea
          id="pdv-comment"
          placeholder="Ej: sin topping, envuelto para regalo..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
        />
      </div>

      {/* Action button */}
      <Button
        className="w-full"
        disabled={preview ? false : !canAdd || added || !onAdd}
        onClick={preview ? undefined : handleAdd}
      >
        {added ? (
          <>
            <Check className="mr-1 h-4 w-4" />
            {stepMode ? '¡Listo!' : '¡Agregado!'}
          </>
        ) : stepMode ? (
          <>
            <ArrowRight className="mr-1 h-4 w-4" />
            Siguiente
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
    </div>
  )
}
