import { useState, useEffect, useCallback } from 'react'
import {
  adminGetFlavorSources,
  adminCreateFlavorSource,
  adminUpdateFlavorSource,
  adminDeleteFlavorSource,
  getFlavors,
  adminAddFlavor,
  adminDeleteFlavor,
} from '@/mocks/handlers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, X, ChevronLeft } from 'lucide-react'

function formatPrice(n) {
  return `$${n.toLocaleString('es-AR')}`
}

export default function AdminListasPage() {
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'detail'
  const [selectedSource, setSelectedSource] = useState(null)

  // Source form
  const [showNewSource, setShowNewSource] = useState(false)
  const [editingSource, setEditingSource] = useState(null)
  const [sourceLabel, setSourceLabel] = useState('')
  const [sourceHasItemPrices, setSourceHasItemPrices] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Flavor detail
  const [flavors, setFlavors] = useState([])
  const [loadingFlavors, setLoadingFlavors] = useState(false)
  const [newFlavorName, setNewFlavorName] = useState('')
  const [newFlavorPrice, setNewFlavorPrice] = useState('')

  const loadSources = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminGetFlavorSources()
      setSources(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSources()
  }, [loadSources])

  const loadFlavors = useCallback(async (sourceId) => {
    setLoadingFlavors(true)
    try {
      const key = sourceId === 'default' ? undefined : sourceId
      const data = await getFlavors(key)
      setFlavors(data)
    } finally {
      setLoadingFlavors(false)
    }
  }, [])

  // ── Source CRUD ──
  function openNewSource() {
    setSourceLabel('')
    setSourceHasItemPrices(false)
    setEditingSource(null)
    setShowNewSource(true)
  }

  function openEditSource(src) {
    setSourceLabel(src.label)
    setSourceHasItemPrices(src.hasItemPrices || false)
    setEditingSource(src.id)
    setShowNewSource(true)
  }

  async function handleSaveSource() {
    const label = sourceLabel.trim()
    if (!label) return
    if (editingSource) {
      await adminUpdateFlavorSource(editingSource, {
        label,
        hasItemPrices: sourceHasItemPrices,
      })
    } else {
      await adminCreateFlavorSource({
        label,
        hasItemPrices: sourceHasItemPrices,
      })
    }
    setShowNewSource(false)
    setEditingSource(null)
    await loadSources()
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    await adminDeleteFlavorSource(deleteTarget.id)
    setDeleteTarget(null)
    await loadSources()
  }

  // ── Flavor CRUD ──
  function openSourceDetail(src) {
    setSelectedSource(src)
    setView('detail')
    loadFlavors(src.id)
  }

  async function handleAddFlavor() {
    const name = newFlavorName.trim()
    if (!name || !selectedSource) return
    const data = { name }
    if (selectedSource.hasItemPrices && newFlavorPrice) {
      data.price = Number(newFlavorPrice)
    }
    const key = selectedSource.id === 'default' ? undefined : selectedSource.id
    await adminAddFlavor(key, data)
    setNewFlavorName('')
    setNewFlavorPrice('')
    loadFlavors(selectedSource.id)
    loadSources()
  }

  async function handleDeleteFlavor(flavorId) {
    if (!selectedSource) return
    const key = selectedSource.id === 'default' ? undefined : selectedSource.id
    await adminDeleteFlavor(key, flavorId)
    loadFlavors(selectedSource.id)
    loadSources()
  }

  function handleBackToList() {
    setView('list')
    setSelectedSource(null)
    setNewFlavorName('')
    setNewFlavorPrice('')
  }

  // ── Detail view ──
  if (view === 'detail' && selectedSource) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{selectedSource.label}</h1>
            <div className="mt-1 flex items-center gap-2">
              {selectedSource.hasItemPrices && (
                <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  Precio individual por item
                </span>
              )}
              <span className="text-xs text-gray-400">{flavors.length} opciones</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditSource(selectedSource)}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Editar lista
          </Button>
        </div>

        {selectedSource.usedBy?.length > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <span className="font-medium">Usada por {selectedSource.usedBy.length} producto{selectedSource.usedBy.length !== 1 ? 's' : ''}:</span>{' '}
              {selectedSource.usedBy.map((p) => p.name).join(', ')}
            </p>
            <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-400">
              Los cambios en esta lista se reflejan en todos los productos que la usan.
            </p>
          </div>
        )}

        {/* Flavor list */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700">
          {loadingFlavors ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">Cargando...</div>
          ) : (
            <>
              {flavors.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  Esta lista no tiene opciones todavía
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {flavors.map((fl) => (
                    <div
                      key={fl.id}
                      className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        {fl.image && <span>{fl.image}</span>}
                        <span className="font-medium">{fl.name}</span>
                        {fl.price != null && (
                          <span className="text-gray-400">
                            {formatPrice(fl.price)}
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => handleDeleteFlavor(fl.id)}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800 dark:hover:text-red-400"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add flavor */}
              <div className="flex items-center gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                <div className="flex-1">
                  <Input
                    value={newFlavorName}
                    onChange={(e) => setNewFlavorName(e.target.value)}
                    placeholder="Nueva opción..."
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddFlavor()
                      }
                    }}
                  />
                </div>
                {selectedSource.hasItemPrices && (
                  <div className="w-24">
                    <Input
                      type="number"
                      min="0"
                      value={newFlavorPrice}
                      onChange={(e) => setNewFlavorPrice(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="Precio"
                      className="h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddFlavor()
                        }
                      }}
                    />
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={handleAddFlavor}
                  disabled={!newFlavorName.trim()}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Edit source dialog (reused) */}
        <Dialog open={showNewSource} onOpenChange={(open) => !open && setShowNewSource(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSource ? 'Editar lista' : 'Nueva lista'}</DialogTitle>
              <DialogDescription>
                {editingSource
                  ? 'Modificá los datos de esta lista de opciones.'
                  : 'Creá una nueva lista de opciones para usar en tus productos.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={sourceLabel}
                  onChange={(e) => setSourceLabel(e.target.value)}
                  placeholder="Ej: Sabores de helado"
                  className="mt-1"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={sourceHasItemPrices}
                  onChange={(e) => setSourceHasItemPrices(e.target.checked)}
                  className="rounded"
                />
                Precio individual por item
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewSource(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveSource} disabled={!sourceLabel.trim()}>
                {editingSource ? 'Guardar' : 'Crear lista'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ── List view ──
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Listas de opciones</h1>
        <Button size="sm" onClick={openNewSource}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Nueva lista
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400">Cargando...</div>
      ) : sources.length === 0 ? (
        <div className="py-12 text-center text-gray-400">No hay listas creadas.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-4 py-2.5">Nombre</th>
                <th className="px-4 py-2.5">Productos</th>
                <th className="px-4 py-2.5 text-center">Opciones</th>
                <th className="px-4 py-2.5 text-center">Precio por item</th>
                <th className="px-4 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {sources.map((src) => (
                <tr
                  key={src.id}
                  className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  onClick={() => openSourceDetail(src)}
                >
                  <td className="px-4 py-2.5 font-medium">{src.label}</td>
                  <td className="px-4 py-2.5">
                    {src.usedBy?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {src.usedBy.map((p) => (
                          <span key={p.id} className="inline-block rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {p.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Sin usar</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono">{src.count}</td>
                  <td className="px-4 py-2.5 text-center">
                    {src.hasItemPrices ? (
                      <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        Sí
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditSource(src)}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(src)}
                        title="Eliminar"
                        className="text-red-500 hover:text-red-700"
                        disabled={src.count > 0 || src.usedBy?.length > 0}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New / Edit source dialog */}
      <Dialog open={showNewSource} onOpenChange={(open) => !open && setShowNewSource(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSource ? 'Editar lista' : 'Nueva lista'}</DialogTitle>
            <DialogDescription>
              {editingSource
                ? 'Modificá los datos de esta lista de opciones.'
                : 'Creá una nueva lista de opciones para usar en tus productos.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nombre</Label>
              <Input
                value={sourceLabel}
                onChange={(e) => setSourceLabel(e.target.value)}
                placeholder="Ej: Sabores de helado"
                className="mt-1"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={sourceHasItemPrices}
                onChange={(e) => setSourceHasItemPrices(e.target.checked)}
                className="rounded"
              />
              Precio individual por item
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSource(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSource} disabled={!sourceLabel.trim()}>
              {editingSource ? 'Guardar' : 'Crear lista'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar lista</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar <strong>{deleteTarget?.label}</strong>? Esta acción no se puede deshacer.
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
