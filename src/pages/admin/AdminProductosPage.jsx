import { useState, useEffect, useCallback } from 'react'
import {
  adminGetAllProducts,
  adminGetCategories,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminToggleProduct,
  getFlavors,
  adminAddFlavor,
  adminDeleteFlavor,
  adminGetFlavorSources,
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
  Minus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  ShoppingCart,
  MessageSquare,
  Pause,
  Play,
} from 'lucide-react'
import ProductDetailView from '@/components/catalog/ProductDetailView'

// ── Archetype labels ──────────────────────────────────
const ARCHETYPES = [
  {
    id: 'simple',
    label: 'Simple',
    desc: 'El cliente solo elige la cantidad. No selecciona sabores ni gustos.',
    example: 'Ej: pizza muzzarella, gaseosa 1.5 L, agua mineral',
    formatHint: 'Cada formato es una variante del producto (tamaño, presentación).',
    namePlaceholder: 'Ej: Pizza muzzarella',
    descPlaceholder: 'Ej: Pizza con muzzarella y salsa de tomate',
    formatNamePlaceholder: 'Ej: Grande',
  },
  {
    id: 'flavors',
    label: 'Con opciones a elegir',
    desc: 'El cliente elige opciones de una lista (sabores, gustos, rellenos, etc). Puede repetir.',
    example: 'Ej: helado 1 kg → 5 sabores, docena de empanadas → 12 gustos',
    formatHint: 'Cada variante define cuántas opciones puede elegir el cliente y a qué precio.',
    namePlaceholder: 'Ej: Helado 1 kg, Empanadas x12',
    descPlaceholder: 'Ej: Elegí tus opciones favoritas',
    formatNamePlaceholder: 'Ej: 1 kg, Docena',
  },
]

// ── Helpers ───────────────────────────────────────────
function detectArchetype(product) {
  if (!product) return 'simple'
  if (product.hasFlavors) return 'flavors'
  return 'simple'
}

function getCategoryIcon(categories, categoryId) {
  return categories.find((c) => c.id === categoryId)?.icon || '🍽️'
}

function buildProductFromForm(form, categories, flavorSources) {
  const itemPricing = form.archetype === 'flavors' && flavorSources.find((fs) => fs.id === form.flavorsSource)?.hasItemPrices
  const base = {
    name: form.name,
    description: form.description,
    category: form.category,
    image: getCategoryIcon(categories, form.category),
    paused: form.paused,
    counterOnly: form.counterOnly,
    formats: !form.hasVariants
      ? [{
          id: 'f-default',
          name: 'Estándar',
          price: itemPricing ? 0 : (form.price || 0),
          ...(form.archetype !== 'simple' && { unitCount: form.unitCount || 1 }),
        }]
      : itemPricing
        ? form.formats.map((f) => ({ ...f, price: 0 }))
        : form.formats,
    extras: form.extras.filter((e) => e.name.trim()),
  }

  if (form.archetype === 'simple') {
    return { ...base, hasFlavors: false }
  }

  // flavors
  return {
    ...base,
    hasFlavors: true,
    flavorMode: 'quantity',
    flavorsSource: form.flavorsSource === 'default' ? undefined : form.flavorsSource,
    unitPricing: itemPricing || false,
  }
}

function makeEmptyFormat() {
  return { id: `f-${Date.now()}`, name: '', price: 0, unitCount: 1 }
}

function makeEmptyExtra() {
  return { id: `x-${Date.now()}`, name: '', price: 0 }
}

function initForm(product) {
  if (!product) {
    return {
      name: '',
      description: '',
      category: '',
      paused: false,
      counterOnly: false,
      archetype: 'simple',
      hasVariants: false,
      price: 0,
      unitCount: 1,
      flavorsSource: 'default',
      formats: [makeEmptyFormat()],
      extras: [],
    }
  }
  const arch = detectArchetype(product)
  const isSingleFormat = product.formats.length === 1
  return {
    name: product.name,
    description: product.description || '',
    category: product.category,
    paused: product.paused || false,
    counterOnly: product.counterOnly || false,
    archetype: arch,
    hasVariants: product.formats.length > 1,
    price: isSingleFormat ? product.formats[0].price : 0,
    unitCount: isSingleFormat ? product.formats[0].unitCount || 1 : 1,
    flavorsSource: product.flavorsSource || 'default',
    formats: product.formats.length
      ? product.formats.map((f) => ({ ...f }))
      : [makeEmptyFormat()],
    extras: product.extras ? product.extras.map((e) => ({ ...e })) : [],
  }
}

// ── Price formatting ──────────────────────────────────
function formatPrice(n) {
  return `$${n.toLocaleString('es-AR')}`
}

// ═══════════════════════════════════════════════════════
// ProductDetailPreview — customer detail view in a dialog
// ═══════════════════════════════════════════════════════
function ProductDetailPreview({ form, categories, flavorSources, open, onClose }) {
  const [flavors, setFlavors] = useState([])

  useEffect(() => {
    if (!open || form.archetype === 'simple') return
    let cancelled = false
    const src = form.flavorsSource === 'default' ? undefined : form.flavorsSource
    getFlavors(src).then((data) => {
      if (!cancelled) setFlavors(data)
    })
    return () => { cancelled = true }
  }, [open, form.archetype, form.flavorsSource])

  const virtualProduct = open ? buildProductFromForm(form, categories, flavorSources) : null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vista previa — Detalle del producto</DialogTitle>
          <DialogDescription>
            Así verá el cliente al tocar &ldquo;Elegir&rdquo;.
          </DialogDescription>
        </DialogHeader>

        {virtualProduct && (
          <ProductDetailView
            product={virtualProduct}
            allFlavors={flavors}
            preview
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════
// ProductForm — create / edit
// ═══════════════════════════════════════════════════════
function ProductForm({ product, categories, onSave, onCancel }) {
  const [form, setForm] = useState(() => initForm(product))
  const [saving, setSaving] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [flavorList, setFlavorList] = useState([])
  const [loadingFlavors, setLoadingFlavors] = useState(false)
  const [newFlavorName, setNewFlavorName] = useState('')
  const [newFlavorPrice, setNewFlavorPrice] = useState('')
  const [flavorSources, setFlavorSources] = useState([])

  const isNew = !product

  // Load flavor sources metadata
  const loadFlavorSources = useCallback(async () => {
    const sources = await adminGetFlavorSources()
    setFlavorSources(sources)
  }, [])

  useEffect(() => {
    loadFlavorSources()
  }, [loadFlavorSources])

  // Load flavors for the selected source
  const loadFlavors = useCallback(async () => {
    if (form.archetype === 'simple') return
    setLoadingFlavors(true)
    try {
      const src = form.flavorsSource === 'default' ? undefined : form.flavorsSource
      const data = await getFlavors(src)
      setFlavorList(data)
    } finally {
      setLoadingFlavors(false)
    }
  }, [form.flavorsSource, form.archetype])

  useEffect(() => {
    loadFlavors()
  }, [loadFlavors])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  // ── Flavor inline management ──
  async function handleAddFlavor() {
    const name = newFlavorName.trim()
    if (!name) return
    const data = { name }
    const currentSrc = flavorSources.find((fs) => fs.id === form.flavorsSource)
    if (currentSrc?.hasItemPrices && newFlavorPrice) {
      data.price = Number(newFlavorPrice)
    }
    await adminAddFlavor(
      form.flavorsSource === 'default' ? undefined : form.flavorsSource,
      data,
    )
    setNewFlavorName('')
    setNewFlavorPrice('')
    loadFlavors()
    loadFlavorSources()
  }

  async function handleDeleteFlavor(flavorId) {
    await adminDeleteFlavor(
      form.flavorsSource === 'default' ? undefined : form.flavorsSource,
      flavorId,
    )
    loadFlavors()
    loadFlavorSources()
  }

  // ── Format helpers ──
  function addFormat() {
    setForm((f) => ({ ...f, formats: [...f.formats, makeEmptyFormat()] }))
  }
  function removeFormat(idx) {
    setForm((f) => ({
      ...f,
      formats: f.formats.filter((_, i) => i !== idx),
    }))
  }
  function updateFormat(idx, field, value) {
    setForm((f) => ({
      ...f,
      formats: f.formats.map((fmt, i) =>
        i === idx ? { ...fmt, [field]: value } : fmt,
      ),
    }))
  }

  // ── Extra helpers ──
  function addExtra() {
    setForm((f) => ({ ...f, extras: [...f.extras, makeEmptyExtra()] }))
  }
  function removeExtra(idx) {
    setForm((f) => ({
      ...f,
      extras: f.extras.filter((_, i) => i !== idx),
    }))
  }
  function updateExtra(idx, field, value) {
    setForm((f) => ({
      ...f,
      extras: f.extras.map((ext, i) =>
        i === idx ? { ...ext, [field]: value } : ext,
      ),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.category) return
    if (form.hasVariants && form.formats.length === 0) return
    setSaving(true)
    try {
      const data = buildProductFromForm(form, categories, flavorSources)
      await onSave(data)
    } finally {
      setSaving(false)
    }
  }

  const showFlavors = form.archetype !== 'simple'
  const showUnitCount = form.archetype !== 'simple'
  const itemPricing = form.archetype === 'flavors' && flavorSources.find((fs) => fs.id === form.flavorsSource)?.hasItemPrices
  const currentArchetype = ARCHETYPES.find((a) => a.id === form.archetype) || ARCHETYPES[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Volver
        </Button>
        <h2 className="text-lg font-semibold">
          {isNew ? 'Nuevo producto' : `Editar: ${product.name}`}
        </h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* ── Left column: Form ── */}
        <div className="space-y-6">
          {/* ── Basic info section ── */}
          <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Información básica
          </h3>

          <div className="space-y-2">
            <Label htmlFor="pf-name">Nombre</Label>
            <Input
              id="pf-name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder={currentArchetype.namePlaceholder}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf-desc">Descripción</Label>
            <Textarea
              id="pf-desc"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder={currentArchetype.descPlaceholder}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pf-cat">Categoría</Label>
              <select
                id="pf-cat"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">Seleccionar...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Disponibilidad</Label>
            <div className="space-y-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  form.paused
                    ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-950/30'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.paused}
                  onChange={(e) => set('paused', e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <div>
                  <span className="text-sm font-medium">Pausado</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">No aparece en el menú — sin stock, deshabilitado o en preparación.</p>
                </div>
              </label>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  form.counterOnly
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.counterOnly}
                  onChange={(e) => set('counterOnly', e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <div>
                  <span className="text-sm font-medium">Solo venta en mostrador</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">No aparece en el menú online, solo se vende presencialmente.</p>
                </div>
              </label>
            </div>
          </div>

          {/* ── Archetype ── */}
          <div className="space-y-2">
            <Label>Tipo de producto</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Define cómo el cliente interactúa con el producto al pedirlo.
            </p>
            <div className="space-y-2">
              {ARCHETYPES.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    form.archetype === a.id
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30'
                      : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="archetype"
                    value={a.id}
                    checked={form.archetype === a.id}
                    onChange={() => set('archetype', a.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-sm font-medium">{a.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {a.desc}
                    </div>
                    <div className="text-xs text-gray-400 italic dark:text-gray-500">
                      {a.example}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {showFlavors && (
            <div className="space-y-3">
              <Label htmlFor="pf-flsrc">Lista de opciones</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                La lista de opciones que verá el cliente al armar su pedido.
              </p>

              {/* Source selector */}
              <div className="space-y-2">
                <select
                  id="pf-flsrc"
                  value={form.flavorsSource}
                  onChange={(e) => set('flavorsSource', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  {flavorSources.map((fs) => (
                    <option key={fs.id} value={fs.id}>
                      {fs.label} ({fs.count})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Administrá las listas desde{' '}
                  <a href="/admin/listas" className="text-blue-500 underline hover:text-blue-700 dark:text-blue-400">
                    Listas de opciones
                  </a>
                </p>
              </div>

              {/* Inline flavor list */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {flavorSources.find((fs) => fs.id === form.flavorsSource)?.label || 'Opciones'} ({flavorList.length})
                  </span>
                </div>

                {loadingFlavors ? (
                  <p className="text-xs text-gray-400">Cargando...</p>
                ) : (
                  <>
                    <div className="mb-2 max-h-40 space-y-1 overflow-y-auto">
                      {flavorList.map((fl) => (
                        <div
                          key={fl.id}
                          className="flex items-center justify-between rounded-md bg-white px-2 py-1.5 text-sm dark:bg-gray-900"
                        >
                          <span className="flex items-center gap-1.5">
                            {fl.image && <span className="text-sm">{fl.image}</span>}
                            <span>{fl.name}</span>
                            {fl.price != null && (
                              <span className="text-xs text-gray-400">
                                ({formatPrice(fl.price)})
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteFlavor(fl.id)}
                            className="text-gray-400 hover:text-red-500"
                            title="Eliminar"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      {flavorList.length === 0 && (
                        <p className="text-xs italic text-gray-400">Sin opciones</p>
                      )}
                    </div>

                    {/* Add new flavor */}
                    <div className="flex items-end gap-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                      <div className="flex-1">
                        <Input
                          value={newFlavorName}
                          onChange={(e) => setNewFlavorName(e.target.value)}
                          placeholder="Nuevo sabor..."
                          className="h-8 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddFlavor()
                            }
                          }}
                        />
                      </div>
                      {flavorSources.find((fs) => fs.id === form.flavorsSource)?.hasItemPrices && (
                        <div className="w-20">
                          <Input
                            type="number"
                            min="0"
                            value={newFlavorPrice}
                            onChange={(e) => setNewFlavorPrice(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="Precio"
                            className="h-8 text-xs"
                          />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={handleAddFlavor}
                        disabled={!newFlavorName.trim()}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          </div>

          {/* ── Pricing / Formats section ── */}
          {!form.hasVariants ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {itemPricing ? 'Cantidad de opciones' : 'Precio'}
              </h3>
              <div className="flex items-end gap-3">
                {!itemPricing && (
                  <div className="relative w-40">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <Input
                      type="number"
                      min="0"
                      value={form.price || ''}
                      onChange={(e) => set('price', Number(e.target.value))}
                      onFocus={(e) => e.target.select()}
                      className="pl-6"
                      placeholder="0"
                      required
                    />
                  </div>
                )}
                {showUnitCount && (
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500 dark:text-gray-400">
                      {itemPricing ? 'Opciones' : 'Sabores'}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      className="w-24"
                      value={form.unitCount || ''}
                      onChange={(e) => set('unitCount', Number(e.target.value))}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                onClick={() => set('hasVariants', true)}
              >
                + Agregar variantes (ej: distintos tamaños o presentaciones)
              </button>
            </div>
          ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Variantes / Tamaños
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFormat}
              >
                <Plus className="mr-1 h-3 w-3" /> Agregar variante
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {form.archetype === 'simple'
                ? 'Cada variante es una opción que el cliente puede elegir (ej: tamaños, presentaciones).'
                : itemPricing
                    ? 'Cada variante define cuántas opciones puede elegir el cliente. El precio se calcula por las opciones individuales.'
                    : 'Cada variante define cuántas opciones puede elegir el cliente y a qué precio.'}
            </p>
            {form.formats.length <= 1 && (
              <button
                type="button"
                className="text-xs text-gray-500 hover:underline dark:text-gray-400"
                onClick={() => {
                  set('hasVariants', false)
                  set('price', form.formats[0]?.price || 0)
                  set('unitCount', form.formats[0]?.unitCount || 1)
                }}
              >
                ← Volver a precio único
              </button>
            )}

            {form.formats.map((fmt, idx) => (
                <div
                  key={fmt.id}
                  className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                >
                  {/* Format card header */}
                  <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 dark:border-gray-800">
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      Variante {idx + 1}
                    </span>
                    {form.formats.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFormat(idx)}
                        className="text-gray-400 hover:text-red-500"
                        title="Eliminar variante"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Format card body */}
                  <div className="p-3">
                    <div className={`grid grid-cols-[1fr,auto] gap-3 ${
                      showUnitCount && !itemPricing
                        ? 'sm:grid-cols-[1fr,100px,100px]'
                        : 'sm:grid-cols-[1fr,100px]'
                    }`}>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                          {form.archetype === 'simple' ? 'Nombre de la variante' : 'Tamaño / Presentación'}
                        </Label>
                        <Input
                          value={fmt.name}
                          onChange={(e) => updateFormat(idx, 'name', e.target.value)}
                          placeholder={currentArchetype.formatNamePlaceholder}
                          required
                        />
                      </div>
                      {!itemPricing && (
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500 dark:text-gray-400">Precio</Label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                            <Input
                              type="number"
                              min="0"
                              value={fmt.price || ''}
                              onChange={(e) =>
                                updateFormat(idx, 'price', Number(e.target.value))
                              }
                              onFocus={(e) => e.target.select()}
                              className="pl-6"
                              required
                            />
                          </div>
                        </div>
                      )}
                      {showUnitCount && (
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500 dark:text-gray-400">
                            {itemPricing ? 'Opciones' : 'Sabores'}
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={fmt.unitCount || ''}
                            onChange={(e) =>
                              updateFormat(idx, 'unitCount', Number(e.target.value))
                            }
                            onFocus={(e) => e.target.select()}
                          />
                        </div>
                      )}
                    </div>

                    {/* How it looks to customer */}
                    {fmt.name.trim() && (
                      <div className="mt-3 flex items-center justify-between rounded-md border border-dashed border-gray-200 bg-gray-50/50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/30">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          El cliente verá:
                        </span>
                        <span className="text-sm font-medium">
                          {fmt.name}
                          {showUnitCount && (fmt.unitCount || 1) > 0 && (
                            <span className="ml-1.5 text-xs font-normal text-gray-400">
                              ({fmt.unitCount || 1} {itemPricing
                                ? (fmt.unitCount || 1) === 1 ? 'opción' : 'opciones'
                                : (fmt.unitCount || 1) === 1 ? 'sabor' : 'sabores'})
                            </span>
                          )}
                          {!itemPricing && (
                            <>
                              <span className="ml-2 text-gray-400">—</span>
                              <span className="ml-2">{formatPrice(fmt.price)}</span>
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Extras */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Extras / Adicionales
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExtra}
              >
                <Plus className="mr-1 h-3 w-3" /> Agregar extra
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Opciones con costo adicional que el cliente puede agregar al producto (ej: salsas, toppings).
            </p>

            {form.extras.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                Sin extras configurados
              </p>
            )}

            {form.extras.map((ext, idx) => (
              <div
                key={ext.id}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex-1">
                  <Input
                    value={ext.name}
                    onChange={(e) => updateExtra(idx, 'name', e.target.value)}
                    placeholder="Ej: Salsa de chocolate"
                    className="border-0 p-0 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="relative w-24">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                  <Input
                    type="number"
                    min="0"
                    value={ext.price || ''}
                    onChange={(e) =>
                      updateExtra(idx, 'price', Number(e.target.value))
                    }
                    onFocus={(e) => e.target.select()}
                    className="pl-6 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeExtra(idx)}
                  className="text-gray-400 hover:text-red-500"
                  title="Eliminar extra"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column: Sticky Preview (desktop) ── */}
        <div className="hidden xl:block">
          <div className="sticky top-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <Eye className="h-4 w-4" />
              Vista previa
            </div>
            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="flex h-32 items-center justify-center bg-gray-100 text-4xl dark:bg-gray-800">
                {getCategoryIcon(categories, form.category)}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {form.name || 'Nombre del producto'}
                </h3>
                <p className="flex-1 text-sm text-gray-500 dark:text-gray-400">
                  {form.description || 'Descripción del producto'}
                </p>
                {form.archetype === 'simple' && !form.hasVariants && form.extras.filter((e) => e.name.trim()).length === 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {form.price ? formatPrice(form.price) : '$0'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-400 dark:border-gray-700">
                          <MessageSquare className="h-3 w-3" />
                        </span>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
                          <Minus className="h-3 w-3" />
                        </span>
                        <span className="w-4 text-center text-xs font-medium text-gray-900 dark:text-gray-100">1</span>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
                          <Plus className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-gray-100 dark:text-gray-900">
                      <ShoppingCart className="h-3 w-3" />
                      Agregar — {form.price ? formatPrice(form.price) : '$0'}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {itemPricing
                        ? 'Armá tu pedido'
                        : !form.hasVariants
                          ? form.price ? formatPrice(form.price) : '$0'
                          : form.formats.length > 1
                            ? `Desde ${formatPrice(Math.min(...form.formats.map((f) => f.price)))}`
                            : form.formats[0]?.price
                              ? formatPrice(form.formats[0].price)
                              : '$0'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDetail(true)}
                      className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
                    >
                      Elegir
                    </button>
                  </div>
                )}
              </div>
            </div>
            {(form.paused || form.counterOnly) && (
              <div className="space-y-1 text-center">
                {form.paused && (
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    ⚠ Pausado — no aparecerá en el menú hasta que lo actives
                  </p>
                )}
                {form.counterOnly && (
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    ⚠ Solo venta en mostrador — no aparecerá en el menú online
                  </p>
                )}
              </div>
            )}

            {/* Formats summary */}
            {form.hasVariants && form.formats.some((f) => f.name.trim()) && (
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Formatos</p>
                <div className="space-y-1">
                  {form.formats.filter((f) => f.name.trim()).map((fmt) => (
                    <div key={fmt.id} className="flex items-center justify-between text-sm">
                      <span>{fmt.name}</span>
                      <span className="font-medium">{formatPrice(fmt.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extras summary */}
            {form.extras.filter((e) => e.name.trim()).length > 0 && (
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Extras</p>
                <div className="flex flex-wrap gap-1.5">
                  {form.extras.filter((e) => e.name.trim()).map((ext) => (
                    <span key={ext.id} className="rounded-full border border-gray-200 px-2 py-0.5 text-xs dark:border-gray-700">
                      {ext.name} {ext.price > 0 && `+${formatPrice(ext.price)}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail preview dialog */}
      <ProductDetailPreview
        form={form}
        categories={categories}
        flavorSources={flavorSources}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />

      {/* ── Mobile preview (below xl) ── */}
      <div className="xl:hidden">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <Eye className="h-4 w-4" />
            Vista previa
          </div>
          <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex h-32 items-center justify-center bg-gray-100 text-4xl dark:bg-gray-800">
              {getCategoryIcon(categories, form.category)}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {form.name || 'Nombre del producto'}
              </h3>
              <p className="flex-1 text-sm text-gray-500 dark:text-gray-400">
                {form.description || 'Descripción del producto'}
              </p>
              {form.archetype === 'simple' && !form.hasVariants && form.extras.filter((e) => e.name.trim()).length === 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {form.price ? formatPrice(form.price) : '$0'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-400 dark:border-gray-700">
                        <MessageSquare className="h-3 w-3" />
                      </span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
                        <Minus className="h-3 w-3" />
                      </span>
                      <span className="w-4 text-center text-xs font-medium text-gray-900 dark:text-gray-100">1</span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
                        <Plus className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-gray-100 dark:text-gray-900">
                    <ShoppingCart className="h-3 w-3" />
                    Agregar — {form.price ? formatPrice(form.price) : '$0'}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {itemPricing
                      ? 'Armá tu pedido'
                      : !form.hasVariants
                        ? form.price ? formatPrice(form.price) : '$0'
                        : form.formats.length > 1
                          ? `Desde ${formatPrice(Math.min(...form.formats.map((f) => f.price)))}`
                          : form.formats[0]?.price
                            ? formatPrice(form.formats[0].price)
                            : '$0'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDetail(true)}
                    className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
                  >
                    Elegir
                  </button>
                </div>
              )}
            </div>
          </div>
          {(form.paused || form.counterOnly) && (
            <div className="space-y-1 text-center">
              {form.paused && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  ⚠ Pausado — no aparecerá en el menú hasta que lo actives
                </p>
              )}
              {form.counterOnly && (
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  ⚠ Solo venta en mostrador — no aparecerá en el menú online
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : isNew ? 'Crear producto' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

// ═══════════════════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════════════════
export default function AdminProductosPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'form'
  const [editingProduct, setEditingProduct] = useState(null) // null = new
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filter, setFilter] = useState('') // text search
  const [categoryFilter, setCategoryFilter] = useState('')
  const [expandedRows, setExpandedRows] = useState(new Set())

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [prods, cats] = await Promise.all([
        adminGetAllProducts(),
        adminGetCategories(),
      ])
      setProducts(prods)
      setCategories(cats)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Handlers ──
  function handleNew() {
    setEditingProduct(null)
    setView('form')
  }

  function handleEdit(product) {
    setEditingProduct(product)
    setView('form')
  }

  function handleCancelForm() {
    setView('list')
    setEditingProduct(null)
  }

  async function handleSave(data) {
    if (editingProduct) {
      const updated = await adminUpdateProduct(editingProduct.id, data)
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      )
    } else {
      const created = await adminCreateProduct(data)
      setProducts((prev) => [...prev, created])
    }
    setView('list')
    setEditingProduct(null)
  }

  async function handleToggle(id) {
    const updated = await adminToggleProduct(id)
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p)),
    )
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    await adminDeleteProduct(deleteTarget.id)
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  // ── Filtered products ──
  const filtered = products.filter((p) => {
    if (categoryFilter && p.category !== categoryFilter) return false
    if (filter) {
      const q = filter.toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]))

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Cargando productos...
      </div>
    )
  }

  // ── Form view ──
  if (view === 'form') {
    return (
      <div className="p-4 lg:p-6">
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSave={handleSave}
          onCancel={handleCancelForm}
        />
      </div>
    )
  }

  // ── List view ──
  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Productos</h1>
        <Button size="sm" onClick={handleNew}>
          <Plus className="mr-1 h-4 w-4" /> Nuevo producto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar..."
          className="w-48"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2" />
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2 text-right">Precio</th>
              <th className="px-3 py-2 text-center">Estado</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((p) => {
              const cat = catMap[p.category]
              const price = p.formats?.[0]?.price
              const archetype = detectArchetype(p)
              const hasExtras = p.extras?.length > 0
              const hasMultiFormats = p.formats?.length > 1
              const isExpanded = expandedRows.has(p.id)
              const showExpandBtn = hasExtras || hasMultiFormats
              return (
                <tr
                  key={p.id}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40 ${
                    p.paused ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-xs text-gray-400">
                    {p.id}
                  </td>
                  <td className="px-3 py-2 text-lg">{p.image}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{p.name}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                      {hasMultiFormats && (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          {p.formats.length} formatos
                        </span>
                      )}
                      {hasExtras && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          {p.extras.length} extra{p.extras.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {showExpandBtn && (
                        <button
                          onClick={() => setExpandedRows((prev) => {
                            const next = new Set(prev)
                            next.has(p.id) ? next.delete(p.id) : next.add(p.id)
                            return next
                          })}
                          className="inline-flex items-center rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Ver detalle"
                        >
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      )}
                    </div>
                    {isExpanded && (
                      <div className="mt-1.5 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                        {hasMultiFormats && (
                          <div>
                            <span className="font-medium">Formatos:</span>{' '}
                            {p.formats.map((f) => `${f.name} (${p.unitPricing ? '—' : formatPrice(f.price)})`).join(', ')}
                          </div>
                        )}
                        {hasExtras && (
                          <div>
                            <span className="font-medium">Extras:</span>{' '}
                            {p.extras.map((e) => `${e.name}${e.price > 0 ? ` +${formatPrice(e.price)}` : ''}`).join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {cat ? `${cat.icon} ${cat.name}` : p.category}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        archetype === 'simple'
                          ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}
                    >
                      {ARCHETYPES.find((a) => a.id === archetype)?.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {p.unitPricing
                      ? <span className="text-xs italic text-gray-500 dark:text-gray-400">Precio por item</span>
                      : hasMultiFormats
                        ? <span className="text-xs italic text-gray-500 dark:text-gray-400">Según formato</span>
                        : price != null ? formatPrice(price) : '—'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {p.counterOnly && (
                        <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Solo mostrador
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.paused
                            ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}
                      >
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${p.paused ? 'bg-gray-400' : 'bg-green-500'}`} />
                        {p.paused ? 'Pausado' : 'Activo'}
                      </span>
                      <button
                        onClick={() => handleToggle(p.id)}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        title={p.paused ? 'Reactivar producto' : 'Pausar producto'}
                      >
                        {p.paused
                          ? <Play className="h-3.5 w-3.5" />
                          : <Pause className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(p)}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(p)}
                        title="Eliminar"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-gray-400"
                >
                  No se encontraron productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar{' '}
              <strong>{deleteTarget?.name}</strong>? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
