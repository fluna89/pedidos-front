import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { getMenuItemsByIds, getFlavors } from '@/services/handlers'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShoppingCart,
  Pencil,
} from 'lucide-react'
import ProductDetailView from './ProductDetailView'

/**
 * Step-by-step combo wizard.
 *
 * Props:
 * - combo: the combo product object (with steps, comboPrice)
 * - onAdd(comboCartItem): called with the final cart-ready combo object
 * - preview: if true, renders only the overview (no state, no async loads)
 */
export default function ComboWizard({ combo, onAdd, preview, previewMode }) {
  if (preview) return <ComboOverview combo={combo} onStart={onAdd} />
  return <ComboWizardFull combo={combo} onAdd={onAdd} previewMode={previewMode} />
}

function ComboWizardFull({ combo, onAdd, previewMode }) {
  // 'overview' | stepIndex (number) | 'summary'
  const [phase, setPhase] = useState('overview')
  // Products available at each step: { [stepIdx]: Product[] }
  const [stepProducts, setStepProducts] = useState({})
  // The chosen product for each step
  const [stepChoices, setStepChoices] = useState({})
  // Loading state
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [added, setAdded] = useState(false)

  // Preload all step products on mount
  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      setLoadingProducts(true)
      const entries = await Promise.all(
        combo.steps.map(async (step, idx) => {
          const products = await getMenuItemsByIds(step.productIds)
          return [idx, products]
        }),
      )
      if (!cancelled) {
        setStepProducts(Object.fromEntries(entries))
        setLoadingProducts(false)
      }
    }
    loadAll()
    return () => {
      cancelled = true
    }
  }, [combo.steps])

  const currentStep =
    typeof phase === 'number' ? combo.steps[phase] : null
  const currentProducts =
    typeof phase === 'number' ? stepProducts[phase] || [] : []

  // Derive sub-phase from state — no useEffect needed
  const stepSubPhase = (() => {
    if (typeof phase !== 'number') return 'pick'
    const products = stepProducts[phase] || []
    if (products.length === 1) return 'configure'
    return stepChoices[phase]?.productId ? 'configure' : 'pick'
  })()

  function handlePickProduct(product) {
    setStepChoices((prev) => ({
      ...prev,
      [phase]: { productId: product.id, productName: product.name },
    }))
  }

  // Called by ProductDetailView's onAdd — we capture the config instead of adding to cart
  const handleStepConfig = useCallback(
    (format, extras, comment, flavors) => {
      const products = stepProducts[phase] || []
      const chosenProduct =
        products.length === 1
          ? products[0]
          : products.find((p) => p.id === stepChoices[phase]?.productId)

      setStepChoices((prev) => ({
        ...prev,
        [phase]: {
          productId: chosenProduct.id,
          productName: chosenProduct.name,
          format: { id: format.id, name: format.name, price: format.price },
          extras: extras.map((e) => ({
            id: e.id,
            name: e.name,
            price: e.price,
          })),
          flavors: (flavors || []).map((f) => ({
            id: f.id,
            name: f.name,
            ...(f.quantity && { quantity: f.quantity }),
            ...(f.price != null && { price: f.price }),
          })),
          comment: comment || '',
        },
      }))

      // Advance to next step or summary
      const nextStep = phase + 1
      if (nextStep < combo.steps.length) {
        setPhase(nextStep)
      } else {
        setPhase('summary')
      }
    },
    [phase, stepProducts, stepChoices, combo.steps.length],
  )

  function goBack() {
    if (phase === 'summary') {
      setPhase(combo.steps.length - 1)
    } else if (typeof phase === 'number') {
      if (stepSubPhase === 'configure' && currentProducts.length > 1) {
        // Clear product pick so derived sub-phase returns to 'pick'
        setStepChoices((prev) => {
          const next = { ...prev }
          delete next[phase]
          return next
        })
      } else if (phase > 0) {
        setPhase(phase - 1)
      } else {
        setPhase('overview')
      }
    }
  }

  function editStep(idx) {
    setPhase(idx)
  }

  // Calculate prices
  const individualTotal = Object.values(stepChoices).reduce((sum, choice) => {
    if (!choice?.format) return sum
    const formatPrice = choice.format.price
    const extrasPrice = (choice.extras || []).reduce(
      (s, e) => s + e.price,
      0,
    )
    return sum + formatPrice + extrasPrice
  }, 0)

  const extrasTotal = Object.values(stepChoices).reduce((sum, choice) => {
    if (!choice?.extras) return sum
    return sum + choice.extras.reduce((s, e) => s + e.price, 0)
  }, 0)

  const comboTotal =
    combo.comboPrice.type === 'fixed'
      ? combo.comboPrice.value + extrasTotal
      : Math.round(individualTotal * (1 - combo.comboPrice.value / 100))

  const allStepsComplete = combo.steps.every(
    (_, idx) => stepChoices[idx]?.format,
  )

  function handleAddToCart() {
    if (!allStepsComplete || !onAdd) return

    const comboSteps = combo.steps.map((step, idx) => ({
      label: step.label,
      ...stepChoices[idx],
    }))

    onAdd({
      comboSteps,
      unitPrice: comboTotal,
    })
    setAdded(true)
  }

  if (loadingProducts) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        Cargando combo...
      </div>
    )
  }

  // ── Overview ──────────────────────────────────────────
  if (phase === 'overview') {
    return <ComboOverview combo={combo} onStart={() => setPhase(0)} />
  }

  // ── Summary ───────────────────────────────────────────
  if (phase === 'summary') {
    return (
      <div className="space-y-5">
        <h3 className="text-lg font-semibold">{combo.name}</h3>

        {/* Steps summary */}
        <div className="space-y-2">
          {combo.steps.map((step, idx) => {
            const choice = stepChoices[idx]
            return (
              <div
                key={idx}
                className="rounded-md border border-gray-200 px-4 py-3 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      Paso {idx + 1} · {step.label}
                    </p>
                    <p className="mt-0.5 font-medium">
                      {choice?.productName}
                      {choice?.format && (
                        <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                          ({choice.format.name})
                        </span>
                      )}
                    </p>
                    {choice?.flavors?.length > 0 && (
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        {choice.flavors
                          .map((f) =>
                            f.quantity > 1
                              ? `${f.quantity} ${f.name}`
                              : f.name,
                          )
                          .join(', ')}
                      </p>
                    )}
                    {choice?.extras?.length > 0 && (
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        + {choice.extras.map((e) => e.name).join(', ')}
                      </p>
                    )}
                    {choice?.comment && (
                      <p className="mt-0.5 text-xs text-gray-400 italic dark:text-gray-500">
                        &ldquo;{choice.comment}&rdquo;
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="ml-2 flex-shrink-0 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => editStep(idx)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pricing */}
        <div className="space-y-1 border-t border-gray-200 pt-3 dark:border-gray-700">
          {combo.comboPrice.type === 'discount' && individualTotal > 0 && (
            <p className="text-sm text-gray-500 line-through dark:text-gray-400">
              Individual: ${individualTotal.toLocaleString('es-AR')}
            </p>
          )}
          <p className="text-lg font-bold">
            Precio combo: ${comboTotal.toLocaleString('es-AR')}
            {combo.comboPrice.type === 'discount' && individualTotal > 0 && (
              <span className="ml-2 text-sm font-normal text-green-600 dark:text-green-400">
                -{combo.comboPrice.value}%
              </span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={goBack}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Atrás
          </Button>
          <Button
            className="flex-1"
            disabled={!allStepsComplete || added || previewMode}
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
                Agregar — ${comboTotal.toLocaleString('es-AR')}
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // ── Step: pick product or configure ───────────────────
  const stepIdx = phase
  const stepLabel = currentStep.label

  // Sub-phase: pick from multiple products
  if (stepSubPhase === 'pick' && currentProducts.length > 1) {
    return (
      <div className="space-y-5">
        <StepHeader
          idx={stepIdx}
          total={combo.steps.length}
          label={stepLabel}
        />

        <div className="grid gap-2">
          {currentProducts.map((p) => (
            <button
              key={p.id}
              type="button"
              className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3 text-left text-sm transition-colors hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500"
              onClick={() => handlePickProduct(p)}
            >
              <span className="text-2xl">{p.image ?? '🍽️'}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {p.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
            </button>
          ))}
        </div>

        <Button variant="outline" className="w-full" onClick={goBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Atrás
        </Button>
      </div>
    )
  }

  // Sub-phase: configure the chosen (or only) product
  const chosenProductId =
    currentProducts.length === 1
      ? currentProducts[0].id
      : stepChoices[stepIdx]?.productId
  const chosenProduct = currentProducts.find((p) => p.id === chosenProductId)

  if (!chosenProduct) {
    // Shouldn't happen, but safety fallback
    setPhase('overview')
    return null
  }

  return (
    <StepConfigView
      key={`step-${stepIdx}-${chosenProductId}`}
      stepIdx={stepIdx}
      totalSteps={combo.steps.length}
      label={stepLabel}
      product={chosenProduct}
      hasMultipleProducts={currentProducts.length > 1}
      onConfig={handleStepConfig}
      onBack={goBack}
      unitCount={currentStep.unitCount}
      existingChoice={stepChoices[stepIdx]}
    />
  )
}

// ── Overview (shared between preview mode and wizard) ──
function ComboOverview({ combo, onStart }) {
  return (
    <div className="space-y-5">
      {/* Image */}
      <div className="flex h-40 items-center justify-center rounded-md bg-gray-100 text-5xl dark:bg-gray-800">
        {combo.image ?? '🎁'}
      </div>

      {/* Info */}
      <div>
        <h3 className="text-lg font-semibold">{combo.name}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {combo.description}
        </p>
      </div>

      {/* Price info */}
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950">
        {combo.comboPrice.type === 'fixed' ? (
          <p className="font-semibold text-amber-900 dark:text-amber-100">
            Desde ${combo.comboPrice.value.toLocaleString('es-AR')}
          </p>
        ) : (
          <p className="font-semibold text-amber-900 dark:text-amber-100">
            {combo.comboPrice.value}% de descuento sobre el total
          </p>
        )}
      </div>

      {/* Steps preview */}
      <div className="space-y-2">
        <Label>Incluye</Label>
        <div className="space-y-1.5">
          {combo.steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm dark:border-gray-700"
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {idx + 1}
              </span>
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={onStart} disabled={!onStart}>
        Armar combo
      </Button>
    </div>
  )
}

function StepHeader({ idx, total, label }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
        Paso {idx + 1} de {total}
      </p>
      <h3 className="text-lg font-semibold">{label}</h3>
    </div>
  )
}

/**
 * Renders a product's detail view inside the wizard step,
 * with custom "Siguiente" button instead of "Agregar".
 */
function StepConfigView({
  stepIdx,
  totalSteps,
  label,
  product,
  hasMultipleProducts,
  onConfig,
  onBack,
  unitCount,
  existingChoice,
}) {
  const [allFlavors, setAllFlavors] = useState([])
  const [loadingFlavors, setLoadingFlavors] = useState(product.hasFlavors)

  useEffect(() => {
    if (!product.hasFlavors) return
    let cancelled = false
    async function load() {
      const flavors = await getFlavors(product.flavorsSource)
      if (!cancelled) {
        setAllFlavors(flavors)
        setLoadingFlavors(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [product])

  if (loadingFlavors) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        Cargando opciones...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <StepHeader idx={stepIdx} total={totalSteps} label={label} />
        {hasMultipleProducts && (
          <Button variant="outline" size="sm" onClick={onBack}>
            Cambiar
          </Button>
        )}
      </div>

      <ProductDetailView
        product={product}
        allFlavors={allFlavors}
        onAdd={onConfig}
        stepMode
        unitCountOverride={unitCount}
        initialState={
          existingChoice?.format
            ? {
                format:
                  product.formats.find((f) => f.id === existingChoice.format.id) ||
                  existingChoice.format,
                flavorQuantities: (existingChoice.flavors || []).reduce(
                  (acc, f) => ({ ...acc, [f.id]: f.quantity || 1 }),
                  {},
                ),
                extras: existingChoice.extras || [],
                comment: existingChoice.comment || '',
              }
            : undefined
        }
      />

      {!hasMultipleProducts && (
        <Button variant="outline" className="w-full" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Atrás
        </Button>
      )}
    </div>
  )
}
