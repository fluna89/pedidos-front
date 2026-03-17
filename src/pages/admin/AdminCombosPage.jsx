import { useState, useEffect, useCallback } from 'react'
import {
  adminGetAllProducts,
  adminGetBaseProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminToggleProduct,
} from '@/mocks/handlers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Pause,
  Play,
  GripVertical,
  Eye,
} from 'lucide-react'
import ComboWizard from '@/components/catalog/ComboWizard'

// ── Helpers ───────────────────────────────────────────

function formatPrice(n) {
  return `$${Number(n).toLocaleString('es-AR')}`
}

function makeEmptyStep() {
  return { id: `s-${Date.now()}`, label: '', productIds: [], unitCount: '' }
}

function initForm(combo) {
  if (!combo) {
    return {
      name: '',
      description: '',
      priceType: 'fixed',
      priceValue: 0,
      paused: false,
      steps: [makeEmptyStep()],
    }
  }
  return {
    name: combo.name,
    description: combo.description || '',
    priceType: combo.comboPrice.type,
    priceValue: combo.comboPrice.value,
    paused: combo.paused || false,
    steps: combo.steps.map((s, i) => ({
      id: `s-${i}`,
      label: s.label,
      productIds: [...s.productIds],
      unitCount: s.unitCount ?? '',
    })),
  }
}

function buildComboFromForm(form) {
  const steps = form.steps
    .filter((s) => s.productIds.length > 0)
    .map((s) => {
      const step = { label: s.label, productIds: [...s.productIds] }
      if (s.unitCount !== '' && Number(s.unitCount) > 0) {
        step.unitCount = Number(s.unitCount)
      }
      return step
    })

  const comboPrice = {
    type: form.priceType,
    value: Number(form.priceValue) || 0,
  }

  // For fixed combos the format stores the fixed price; for discount the price is 0 (calculated at checkout)
  const formatPrice = form.priceType === 'fixed' ? comboPrice.value : 0

  return {
    name: form.name,
    description: form.description,
    category: 'combos',
    image: '🎁',
    isCombo: true,
    hasFlavors: false,
    paused: form.paused,
    comboPrice,
    formats: [
      {
        id: `f-combo-${Date.now()}`,
        name: form.name,
        price: formatPrice,
      },
    ],
    steps,
    extras: [],
  }
}

// ── Main component ────────────────────────────────────

export default function AdminCombosPage() {
  const [combos, setCombos] = useState([])
  const [baseProducts, setBaseProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // null = list view, 'new' = create, number = edit id
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initForm(null))
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [allProducts, bases] = await Promise.all([
        adminGetAllProducts(),
        adminGetBaseProducts(),
      ])
      setCombos(allProducts.filter((p) => p.isCombo))
      setBaseProducts(bases)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // ── Actions ───────────────────────────────────────

  function startCreate() {
    setForm(initForm(null))
    setEditing('new')
  }

  function startEdit(combo) {
    setForm(initForm(combo))
    setEditing(combo.id)
  }

  function cancelEdit() {
    setEditing(null)
  }

  async function handleSave() {
    if (!form.name.trim() || form.steps.every((s) => s.productIds.length === 0)) return
    setSaving(true)
    const data = buildComboFromForm(form)
    if (editing === 'new') {
      await adminCreateProduct(data)
    } else {
      await adminUpdateProduct(editing, data)
    }
    setSaving(false)
    setEditing(null)
    await load()
  }

  async function handleToggle(id) {
    await adminToggleProduct(id)
    await load()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await adminDeleteProduct(deleteTarget.id)
    setDeleteTarget(null)
    await load()
  }

  // ── Form updaters ─────────────────────────────────

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function updateStep(idx, field, value) {
    setForm((prev) => {
      const steps = prev.steps.map((s, i) =>
        i === idx ? { ...s, [field]: value } : s,
      )
      return { ...prev, steps }
    })
  }

  function toggleStepProduct(stepIdx, productId) {
    setForm((prev) => {
      const steps = prev.steps.map((s, i) => {
        if (i !== stepIdx) return s
        const has = s.productIds.includes(productId)
        return {
          ...s,
          productIds: has
            ? s.productIds.filter((pid) => pid !== productId)
            : [...s.productIds, productId],
        }
      })
      return { ...prev, steps }
    })
  }

  function addStep() {
    setForm((prev) => ({ ...prev, steps: [...prev.steps, makeEmptyStep()] }))
  }

  function removeStep(idx) {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== idx),
    }))
  }

  function moveStep(idx, direction) {
    setForm((prev) => {
      const steps = [...prev.steps]
      const target = idx + direction
      if (target < 0 || target >= steps.length) return prev
      ;[steps[idx], steps[target]] = [steps[target], steps[idx]]
      return { ...prev, steps }
    })
  }

  // ── Render ────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        Cargando combos...
      </div>
    )
  }

  // ── Form view ─────────────────────────────────────
  if (editing !== null) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={cancelEdit}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">
            {editing === 'new' ? 'Nuevo combo' : 'Editar combo'}
          </h1>
        </div>

        {/* Name & description */}
        <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Ej: Combo 2× 1/4 kg"
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Ej: 2 helados de 1/4 kg al mejor precio"
              rows={2}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Precio del combo
          </h2>
          <div className="flex gap-3">
            {[
              { id: 'fixed', label: 'Precio fijo' },
              { id: 'discount', label: 'Descuento %' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateField('priceType', opt.id)}
                className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  form.priceType === opt.id
                    ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label>
              {form.priceType === 'fixed' ? 'Precio ($)' : 'Descuento (%)'}
            </Label>
            <Input
              type="number"
              min="0"
              step={form.priceType === 'fixed' ? '100' : '1'}
              value={form.priceValue}
              onChange={(e) => updateField('priceValue', e.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {form.priceType === 'fixed'
                ? 'El cliente paga este monto fijo (los extras de cada paso suman aparte).'
                : 'Se descuenta este porcentaje sobre la suma individual de los pasos.'}
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Pasos del combo
            </h2>
            <Button variant="outline" size="sm" onClick={addStep}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Agregar paso
            </Button>
          </div>

          {form.steps.map((step, idx) => (
            <StepEditor
              key={step.id}
              step={step}
              idx={idx}
              total={form.steps.length}
              baseProducts={baseProducts}
              onUpdateStep={updateStep}
              onToggleProduct={toggleStepProduct}
              onRemove={() => removeStep(idx)}
              onMove={(dir) => moveStep(idx, dir)}
            />
          ))}

          {form.steps.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-400">
              Agregá al menos un paso para el combo.
            </p>
          )}
        </div>

        {/* Paused toggle */}
        <label className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
          <input
            type="checkbox"
            checked={form.paused}
            onChange={(e) => updateField('paused', e.target.checked)}
            className="h-4 w-4 rounded"
          />
          <span className="text-sm">
            Pausado (no visible en el catálogo)
          </span>
        </label>

        {/* Preview button */}
        {form.name.trim() && form.steps.some((s) => s.productIds.length > 0) && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="mr-1 h-4 w-4" />
            Vista previa del cliente
          </Button>
        )}

        {/* Preview dialog */}
        <Dialog open={showPreview} onOpenChange={(v) => !v && setShowPreview(false)}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Vista previa — Combo</DialogTitle>
              <DialogDescription>
                Así verá el cliente al tocar &ldquo;Armar combo&rdquo;.
              </DialogDescription>
            </DialogHeader>
            {showPreview && (
              <ComboWizard
                key={JSON.stringify(form)}
                combo={buildComboFromForm(form)}
                onAdd={() => setShowPreview(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Save / Cancel */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={cancelEdit}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={
              saving ||
              !form.name.trim() ||
              form.steps.every((s) => s.productIds.length === 0)
            }
            onClick={handleSave}
          >
            {saving
              ? 'Guardando...'
              : editing === 'new'
                ? 'Crear combo'
                : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    )
  }

  // ── List view ─────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Combos</h1>
        <Button onClick={startCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Nuevo combo
        </Button>
      </div>

      {combos.length === 0 ? (
        <p className="py-12 text-center text-gray-400">
          No hay combos creados todavía.
        </p>
      ) : (
        <div className="space-y-2">
          {combos.map((combo) => (
            <div
              key={combo.id}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                combo.paused
                  ? 'border-gray-200 bg-gray-50 opacity-60 dark:border-gray-700 dark:bg-gray-800/50'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
              }`}
            >
              {/* Icon */}
              <span className="text-2xl">{combo.image}</span>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{combo.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {combo.comboPrice.type === 'fixed'
                    ? `Fijo ${formatPrice(combo.comboPrice.value)}`
                    : `${combo.comboPrice.value}% dto.`}
                  {' · '}
                  {combo.steps.length} paso{combo.steps.length !== 1 && 's'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleToggle(combo.id)}
                  title={combo.paused ? 'Activar' : 'Pausar'}
                >
                  {combo.paused ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => startEdit(combo)}
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  onClick={() => setDeleteTarget(combo)}
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar combo</DialogTitle>
            <DialogDescription>
              ¿Eliminar &ldquo;{deleteTarget?.name}&rdquo;? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Step editor sub-component ─────────────────────────

function StepEditor({
  step,
  idx,
  total,
  baseProducts,
  onUpdateStep,
  onToggleProduct,
  onRemove,
  onMove,
}) {
  const [expanded, setExpanded] = useState(true)

  const selectedNames = step.productIds
    .map((pid) => baseProducts.find((p) => p.id === pid)?.name)
    .filter(Boolean)

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Step header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 dark:border-gray-800">
        <GripVertical className="h-4 w-4 flex-shrink-0 text-gray-300 dark:text-gray-600" />
        <button
          type="button"
          className="min-w-0 flex-1 text-left text-sm font-medium"
          onClick={() => setExpanded((v) => !v)}
        >
          Paso {idx + 1}
          {step.label && (
            <span className="ml-1 font-normal text-gray-500">
              — {step.label}
            </span>
          )}
          {!expanded && selectedNames.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({selectedNames.join(', ')})
            </span>
          )}
        </button>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={idx === 0}
            onClick={() => onMove(-1)}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={idx === total - 1}
            onClick={() => onMove(1)}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          {total > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-500 hover:text-red-600"
              onClick={onRemove}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Step body */}
      {expanded && (
        <div className="space-y-3 p-3">
          {/* Label */}
          <div className="space-y-1">
            <Label className="text-xs">Etiqueta del paso</Label>
            <Input
              value={step.label}
              onChange={(e) => onUpdateStep(idx, 'label', e.target.value)}
              placeholder="Ej: Elegí tu helado"
              className="h-8 text-sm"
            />
          </div>

          {/* Unit count */}
          <div className="space-y-1">
            <Label className="text-xs">
              Cantidad fija (opcional)
            </Label>
            <Input
              type="number"
              min="0"
              value={step.unitCount}
              onChange={(e) => onUpdateStep(idx, 'unitCount', e.target.value)}
              placeholder="Ej: 12 (deja vacío para respetar el formato del producto)"
              className="h-8 text-sm"
            />
            <p className="text-xs text-gray-400">
              Sobreescribe la cantidad de ítems que puede elegir el cliente en este paso.
            </p>
          </div>

          {/* Product picker */}
          <div className="space-y-1">
            <Label className="text-xs">
              Productos elegibles ({step.productIds.length} seleccionados)
            </Label>
            <div className="max-h-48 space-y-0.5 overflow-y-auto rounded border border-gray-100 p-1.5 dark:border-gray-800">
              {baseProducts.filter((p) => !p.paused).length === 0 ? (
                <p className="py-2 text-center text-xs text-gray-400">
                  No hay productos disponibles
                </p>
              ) : (
                baseProducts
                  .filter((p) => !p.paused)
                  .map((product) => {
                    const selected = step.productIds.includes(product.id)
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => onToggleProduct(idx, product.id)}
                        className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors ${
                          selected
                            ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="flex-1 truncate">{product.name}</span>
                        <span className="text-xs opacity-60">
                          {product.category}
                        </span>
                      </button>
                    )
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
