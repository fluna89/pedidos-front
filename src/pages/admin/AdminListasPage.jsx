import { useState, useEffect, useCallback } from 'react'
import {
  adminGetFlavorSources,
  adminCreateFlavorSource,
  adminUpdateFlavorSource,
  adminDeleteFlavorSource,
  adminGetFlavors,
  adminAddFlavor,
  adminDeleteFlavor,
  adminUpdateFlavor,
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
import { Plus, Pencil, Trash2, X, ChevronLeft, Pause, Play, AlertCircle } from 'lucide-react'

export default function AdminListasPage() {
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'detail'
  const [selectedSource, setSelectedSource] = useState(null)

  // Source form
  const [showNewSource, setShowNewSource] = useState(false)
  const [sourceLabel, setSourceLabel] = useState('')
  const [sourceHasItemPrices, setSourceHasItemPrices] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [savingMeta, setSavingMeta] = useState(false)

  // Flavor detail
  const [flavors, setFlavors] = useState([])
  const [loadingFlavors, setLoadingFlavors] = useState(false)
  const [newFlavorName, setNewFlavorName] = useState('')
  const [newFlavorPrice, setNewFlavorPrice] = useState('')
  const [flavorEdits, setFlavorEdits] = useState({}) // { [flavorId]: { paused?, price?, deleted? } }

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
      const data = await adminGetFlavors(key)
      setFlavors(data)
    } finally {
      setLoadingFlavors(false)
    }
  }, [])

  // ── Source CRUD ──
  function openNewSource() {
    setSourceLabel('')
    setSourceHasItemPrices(false)
    setShowNewSource(true)
  }

  async function handleSaveSource() {
    const label = sourceLabel.trim()
    if (!label) return
    await adminCreateFlavorSource({
      label,
      hasItemPrices: sourceHasItemPrices,
    })
    setShowNewSource(false)
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
    setSourceLabel(src.label)
    setSourceHasItemPrices(src.hasItemPrices || false)
    setFlavorEdits({})
    setView('detail')
    loadFlavors(src.id)
  }

  async function handleSaveSourceMeta() {
    if (!selectedSource || !sourceLabel.trim()) return
    // Validate prices when hasItemPrices is enabled
    if (sourceHasItemPrices) {
      const missingPrice = flavors.some((fl) => {
        if (flavorEdits[fl.id]?.deleted) return false
        const price = flavorEdits[fl.id]?.price !== undefined ? flavorEdits[fl.id].price : fl.price
        return price == null || isNaN(price)
      })
      if (missingPrice) return
    }
    setSavingMeta(true)
    try {
      // Save source metadata
      await adminUpdateFlavorSource(selectedSource.id, {
        label: sourceLabel.trim(),
        hasItemPrices: sourceHasItemPrices,
      })
      const key = selectedSource.id === 'default' ? undefined : selectedSource.id
      // Process deletions first
      for (const [flavorId, edits] of Object.entries(flavorEdits)) {
        if (edits.deleted) {
          await adminDeleteFlavor(key, flavorId)
        }
      }
      // Then save updates (skip deleted)
      for (const [flavorId, edits] of Object.entries(flavorEdits)) {
        if (!edits.deleted) {
          const { deleted: _, ...updates } = edits
          if (Object.keys(updates).length > 0) {
            await adminUpdateFlavor(key, flavorId, updates)
          }
        }
      }
      setFlavorEdits({})
      const updated = { ...selectedSource, label: sourceLabel.trim(), hasItemPrices: sourceHasItemPrices }
      setSelectedSource(updated)
      await loadSources()
      await loadFlavors(selectedSource.id)
    } finally {
      setSavingMeta(false)
    }
  }

  async function handleAddFlavor() {
    const name = newFlavorName.trim()
    if (!name || !selectedSource) return
    const data = { name }
    if (sourceHasItemPrices && newFlavorPrice) {
      data.price = Number(newFlavorPrice)
    }
    const key = selectedSource.id === 'default' ? undefined : selectedSource.id
    await adminAddFlavor(key, data)
    setNewFlavorName('')
    setNewFlavorPrice('')
    loadFlavors(selectedSource.id)
    loadSources()
  }

  function handleDeleteFlavor(flavorId) {
    setFlavorEdits((prev) => ({
      ...prev,
      [flavorId]: { ...prev[flavorId], deleted: true },
    }))
  }

  function handleTogglePauseFlavor(flavor) {
    const currentPaused = flavorEdits[flavor.id]?.paused ?? flavor.paused ?? false
    setFlavorEdits((prev) => ({
      ...prev,
      [flavor.id]: { ...prev[flavor.id], paused: !currentPaused },
    }))
  }

  function handleEditFlavorPrice(flavor, newPrice) {
    const parsed = newPrice === '' ? undefined : Number(newPrice)
    setFlavorEdits((prev) => ({
      ...prev,
      [flavor.id]: { ...prev[flavor.id], price: parsed },
    }))
  }

  function handleBackToList() {
    setView('list')
    setSelectedSource(null)
    setNewFlavorName('')
    setNewFlavorPrice('')
    setFlavorEdits({})
  }

  // ── Detail view ──
  if (view === 'detail' && selectedSource) {
    const metaDirty = sourceLabel.trim() !== selectedSource.label || sourceHasItemPrices !== (selectedSource.hasItemPrices || false)
    const flavorsDirty = Object.keys(flavorEdits).length > 0
    const hasPendingChanges = metaDirty || flavorsDirty
    const activeCount = flavors.filter((fl) => !flavorEdits[fl.id]?.deleted).length
    const hasMissingPrices = sourceHasItemPrices && flavors.some((fl) => {
      if (flavorEdits[fl.id]?.deleted) return false
      const price = flavorEdits[fl.id]?.price !== undefined ? flavorEdits[fl.id].price : fl.price
      return price == null || isNaN(price)
    })

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

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400">Nombre de la lista</Label>
            <Input
              value={sourceLabel}
              onChange={(e) => setSourceLabel(e.target.value)}
              placeholder="Nombre de la lista"
              className="mt-1 text-lg font-bold"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={sourceHasItemPrices}
                onChange={(e) => setSourceHasItemPrices(e.target.checked)}
                className="rounded"
              />
              Precio individual por item
            </label>
            <div className="flex items-center gap-2">
              {hasPendingChanges && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSourceLabel(selectedSource.label)
                    setSourceHasItemPrices(selectedSource.hasItemPrices || false)
                    setFlavorEdits({})
                  }}
                  disabled={savingMeta}
                >
                  Cancelar
                </Button>
              )}
              <Button
                size="sm"
                variant={hasPendingChanges ? 'default' : 'outline'}
                onClick={handleSaveSourceMeta}
                disabled={!sourceLabel.trim() || savingMeta || hasMissingPrices}
              >
                {savingMeta ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>

        {hasMissingPrices && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">
              Todas las opciones deben tener un precio asignado.
            </p>
          </div>
        )}

        {hasPendingChanges && !hasMissingPrices && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Tenés cambios sin guardar. Presioná <strong>Guardar</strong> para aplicarlos.
            </p>
          </div>
        )}

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
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800/50">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Opciones</span>
            <span className="text-xs text-gray-400">{activeCount} {activeCount === 1 ? 'opción' : 'opciones'}</span>
          </div>
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
                  {flavors.map((fl) => {
                    const isDeleted = flavorEdits[fl.id]?.deleted
                    const isPaused = flavorEdits[fl.id]?.paused ?? fl.paused ?? false
                    const isEdited = fl.id in flavorEdits
                    if (isDeleted) {
                      return (
                        <div
                          key={fl.id}
                          className="flex items-center justify-between border-l-2 border-l-red-400 px-4 py-2.5 opacity-40"
                        >
                          <span className="flex items-center gap-2 text-sm">
                            {fl.image && <span className="line-through">{fl.image}</span>}
                            <span className="font-medium line-through">{fl.name}</span>
                            <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">Eliminado</span>
                          </span>
                          <button
                            onClick={() => setFlavorEdits((prev) => {
                              const next = { ...prev, [fl.id]: { ...prev[fl.id] } }
                              delete next[fl.id].deleted
                              if (Object.keys(next[fl.id]).length === 0) delete next[fl.id]
                              return next
                            })}
                            className="rounded px-2 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                            title="Deshacer eliminación"
                          >
                            Deshacer
                          </button>
                        </div>
                      )
                    }
                    return (
                      <div
                        key={fl.id}
                        className={`flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40 ${isPaused ? 'opacity-50' : ''} ${isEdited ? 'border-l-2 border-l-amber-400' : ''}`}
                      >
                        <span className="flex items-center gap-2 text-sm">
                          {fl.image && <span>{fl.image}</span>}
                          <span className={`font-medium ${isPaused ? 'line-through' : ''}`}>{fl.name}</span>
                          {isPaused && (
                            <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Pausado</span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          {sourceHasItemPrices && (
                            <Input
                              type="number"
                              min="0"
                              defaultValue={fl.price ?? ''}
                              onChange={(e) => handleEditFlavorPrice(fl, e.target.value)}
                              placeholder="Precio"
                              className="h-7 w-24 text-right text-sm"
                            />
                          )}
                          <button
                            onClick={() => handleTogglePauseFlavor(fl)}
                            className={`rounded p-1 transition-colors ${
                              isPaused
                                ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20'
                                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800'
                            }`}
                            title={isPaused ? 'Reactivar' : 'Pausar'}
                          >
                            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteFlavor(fl.id)}
                            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800 dark:hover:text-red-400"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
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
                {sourceHasItemPrices && (
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
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
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
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openSourceDetail(src)}
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

      {/* New source dialog */}
      <Dialog open={showNewSource} onOpenChange={(open) => !open && setShowNewSource(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva lista</DialogTitle>
            <DialogDescription>
              Creá una nueva lista de opciones para usar en tus productos.
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
              Crear lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          {deleteTarget?.usedBy?.length > 0 ? (
            <>
              <DialogHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <DialogTitle className="text-center">Lista en uso</DialogTitle>
                <DialogDescription className="text-center">
                  <strong>{deleteTarget.label}</strong> no se puede eliminar porque está siendo usada por:
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                <ul className="space-y-1">
                  {deleteTarget.usedBy.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {p.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                <span className="mt-0.5 text-sm">💡</span>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Editá cada producto y cambiá su lista de sabores por otra.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteTarget(null)} className="w-full sm:w-auto">
                  Entendido
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <DialogTitle className="text-center">Eliminar lista</DialogTitle>
                <DialogDescription className="text-center">
                  ¿Estás seguro de que querés eliminar <strong>{deleteTarget?.label}</strong>?
                  {deleteTarget?.count > 0 && <> Se eliminarán sus {deleteTarget.count} items.</>}
                  {' '}Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>
                  Eliminar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
