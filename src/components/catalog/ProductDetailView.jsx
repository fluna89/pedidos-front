import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Check, Minus, Plus, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Shared product detail view used by both the customer page and the admin preview dialog.
 *
 * Props:
 * - product: product object (real or virtual from admin form)
 * - allFlavors: flavor list for non-combo products
 * - comboFlavorsMap: { source: flavors[] } for combo products
 * - onAdd(format, extras, comment, flavors, comboSelections): called when user clicks "Agregar"
 * - preview: if true, disables the add button functionality
 */
export default function ProductDetailView({
  product,
  allFlavors = [],
  comboFlavorsMap = {},
  onAdd,
  preview = false,
}) {
  const [selectedFormat, setSelectedFormat] = useState(
    product.formats.length === 1 ? product.formats[0] : null,
  )
  const [selectedFlavors, setSelectedFlavors] = useState([])
  const [flavorQuantities, setFlavorQuantities] = useState({})
  const [comboSelections, setComboSelections] = useState(
    product.comboItems ? product.comboItems.map(() => ({})) : [],
  )
  const [selectedExtras, setSelectedExtras] = useState([])
  const [comment, setComment] = useState('')
  const [added, setAdded] = useState(false)

  const isQuantityMode = product.flavorMode === 'quantity'
  const isUnitPricing = product.unitPricing === true
  const isCombo = product.isCombo === true
  const hasFlavorPrices = allFlavors.length > 0 && allFlavors[0].price != null
  const showFormats = !isUnitPricing && product.formats.length > 1

  const maxFlavors = selectedFormat?.maxFlavors ?? 0
  const unitCount = selectedFormat?.unitCount ?? 0
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
    setSelectedFlavors((prev) =>
      prev.length > fmt.maxFlavors ? prev.slice(0, fmt.maxFlavors) : prev,
    )
    if (product.flavorMode === 'quantity') {
      setFlavorQuantities({})
    }
  }

  function toggleFlavor(flavor) {
    setSelectedFlavors((prev) => {
      const exists = prev.some((f) => f.id === flavor.id)
      if (exists) return prev.filter((f) => f.id !== flavor.id)
      if (prev.length >= maxFlavors) return prev
      return [...prev, flavor]
    })
  }

  function incrementFlavor(flavorId) {
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
    : !product.hasFlavors || (maxFlavors > 0 && selectedFlavors.length >= 1)

  const comboComplete = isCombo
    ? product.comboItems.every((ci, idx) => {
        const sel = comboSelections[idx] || {}
        return Object.values(sel).reduce((s, q) => s + q, 0) === ci.unitCount
      })
    : true

  const canAdd = isCombo
    ? selectedFormat && comboComplete
    : selectedFormat && flavorsComplete

  function handleAdd() {
    if (preview || !canAdd || !onAdd) return

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
      onAdd(selectedFormat, selectedExtras, comment, [], comboForCart)
      setAdded(true)
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
      <div className="flex h-40 items-center justify-center rounded-md bg-gray-100 text-5xl dark:bg-gray-800">
        {product.image ?? '🍽️'}
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

      {/* Combo items selection */}
      {isCombo &&
        selectedFormat &&
        product.comboItems.map((ci, idx) => {
          const sel = comboSelections[idx] || {}
          const currentTotal = Object.values(sel).reduce((s, q) => s + q, 0)
          const flavors =
            comboFlavorsMap[ci.flavorsSource ?? 'default'] || []
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
                          onClick={() =>
                            incrementComboFlavor(idx, flavor.id)
                          }
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

      {/* Flavor selection — toggle mode */}
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
      {product.hasFlavors &&
        isQuantityMode &&
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
        isQuantityMode &&
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

      {/* Add to cart button */}
      <Button
        className="w-full"
        disabled={preview ? false : !canAdd || added}
        onClick={preview ? undefined : handleAdd}
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
    </div>
  )
}
