import { useState, useEffect, useCallback, useRef } from 'react'
import {
  adminGetAllOrders,
  adminAdvanceOrder,
  adminRevertOrder,
  adminCancelOrder,
  adminSetOrderStatus,
  adminSimulateNewOrder,
} from '@/services/handlers'
import { orderStatusLabels } from '@/services/handlers'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  LayoutList,
  Columns3,
  Ban,
  Undo2,
  Bell,
  BellOff,
  Plus,
  ImagePlus,
  FileText,
  Image,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Sound utility ──────────────────────────────────────

function playNewOrderSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const playTone = (freq, start, dur) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + dur)
    }
    playTone(880, 0, 0.15)
    playTone(1100, 0.18, 0.15)
    playTone(880, 0.36, 0.2)
  } catch {
    // Audio not available
  }
}

const POLL_INTERVAL = 10_000 // 10 seconds

const statusColors = {
  pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  en_preparacion: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  listo: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  en_camino: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  entregado: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  pendiente_pago: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
}

const paymentStatusColors = {
  pagado: 'text-green-600 dark:text-green-400',
  pendiente_pago: 'text-orange-600 dark:text-orange-400',
}

function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-tight',
        statusColors[status] || 'bg-gray-100 text-gray-600',
      )}
    >
      {orderStatusLabels[status] || status}
    </span>
  )
}

function formatDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Kanban Column ──────────────────────────────────────

const KANBAN_MAX_VISIBLE = 4

function KanbanColumn({ title, orders, onAdvance, onRevert, onCancel, newOrderIds, droppableId }) {
  const [expanded, setExpanded] = useState(false)
  const visibleOrders = expanded ? orders : orders.slice(0, KANBAN_MAX_VISIBLE)
  const hasMore = orders.length > KANBAN_MAX_VISIBLE

  return (
    <div className="flex min-w-[150px] flex-1 flex-col rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-2 py-2 dark:border-gray-700">
        <h3 className="text-xs font-semibold">
          {title}{' '}
          <span className="ml-1 text-[10px] font-normal text-gray-500">
            ({orders.length})
          </span>
        </h3>
      </div>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 space-y-2 p-2 transition-colors',
              snapshot.isDraggingOver && 'bg-blue-50/50 dark:bg-blue-950/20',
            )}
          >
            {orders.length === 0 && !snapshot.isDraggingOver && (
              <p className="py-4 text-center text-[10px] text-gray-400">Sin pedidos</p>
            )}
            {visibleOrders.map((order, index) => (
              <Draggable key={order.id} draggableId={String(order.id)} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={cn(
                      'cursor-grab rounded-md border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800',
                      newOrderIds?.has(order.id) &&
                        'animate-pulse border-green-400 bg-green-50 ring-2 ring-green-400/50 dark:border-green-500 dark:bg-green-950/30',
                      dragSnapshot.isDragging && 'cursor-grabbing rotate-2 shadow-lg ring-2 ring-blue-400/50',
                    )}
                  >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-bold">#{order.id}</span>
              <StatusBadge status={order.status} />
            </div>
            <p className="truncate text-xs font-medium">{order.customerName || 'Invitado'}</p>
            <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">
              {order.orderType === 'pickup' ? 'Retiro' : order.address?.street || 'Delivery'}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-gray-500">{formatDate(order.createdAt)}</span>
              <span className="text-xs font-semibold">${order.total?.toLocaleString('es-AR')}</span>
            </div>
            <div className="mt-1 flex items-center gap-0.5">
              {order.status !== 'pendiente' &&
                order.status !== 'cancelado' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onRevert(order.id)}
                    title="Retroceder estado"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                )}
              {order.status === 'entregado' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-orange-500 hover:text-orange-600"
                  onClick={() => onRevert(order.id)}
                  title="Revertir entrega"
                >
                  <Undo2 className="h-3 w-3" />
                </Button>
              )}
              {order.status !== 'entregado' && order.status !== 'cancelado' && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onAdvance(order.id)}
                    title="Avanzar estado"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-600"
                    onClick={() => onCancel(order.id)}
                    title="Cancelar pedido"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {provided.placeholder}
            {hasMore && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-[10px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                Ver más ({orders.length - KANBAN_MAX_VISIBLE})
                <ChevronDown className="h-3 w-3" />
              </button>
            )}
            {hasMore && expanded && (
              <button
                onClick={() => setExpanded(false)}
                className="flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-[10px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                Ver menos
                <ChevronUp className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}

// ── Image Preview Dialog ───────────────────────────────

function ImagePreviewDialog({ imageUrl, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Imagen adjunta</DialogTitle>
          <DialogDescription>Imagen adjunta a la cancelación del pedido.</DialogDescription>
        </DialogHeader>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Adjunto cancelación"
            className="max-h-[70vh] w-full rounded-md object-contain"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Cancel Order Dialog ────────────────────────────────

function CancelOrderDialog({ orderId, open, onOpenChange, onConfirm }) {
  const [reason, setReason] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  function removeImage() {
    setImagePreview(null)
  }

  async function handleSubmit() {
    if (!reason.trim()) return
    setSubmitting(true)
    // In a real app, imageFile would be uploaded to a server.
    // For the mock we pass the data URL as imageUrl.
    await onConfirm(orderId, { reason: reason.trim(), imageUrl: imagePreview })
    setSubmitting(false)
    setReason('')
    setImagePreview(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar pedido #{orderId}</DialogTitle>
          <DialogDescription>
            Indicá el motivo de la cancelación. Opcionalmente podés adjuntar una imagen.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Motivo</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Ej: Cliente solicitó cancelación, producto sin stock..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Imagen (opcional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Adjunto"
                  className="max-h-40 rounded-md border border-gray-200 object-contain dark:border-gray-700"
                />
                <button
                  onClick={removeImage}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500">
                <ImagePlus className="h-4 w-4" />
                Adjuntar imagen
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Volver
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason.trim() || submitting}
          >
            {submitting ? 'Cancelando...' : 'Confirmar cancelación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Cancelled Orders Section ───────────────────────────

function CancelledSection({ orders, onRevert, onPreviewImage }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <Ban className="h-3.5 w-3.5 text-red-500" />
        <span className="text-xs font-semibold text-red-700 dark:text-red-400">
          Cancelados ({orders.length})
        </span>
        {open ? (
          <ChevronUp className="ml-auto h-3.5 w-3.5 text-red-400" />
        ) : (
          <ChevronDown className="ml-auto h-3.5 w-3.5 text-red-400" />
        )}
      </button>
      {open && (
        <div className="border-t border-red-200 px-3 py-2 dark:border-red-900/50">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-md border border-red-200 bg-white p-2 dark:border-red-900/30 dark:bg-gray-800"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-bold">#{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="truncate text-xs font-medium">
                  {order.customerName || 'Invitado'}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">{formatDate(order.createdAt)}</span>
                  <span className="text-xs font-semibold">
                    ${order.total?.toLocaleString('es-AR')}
                  </span>
                </div>
                {order.cancelReason && (
                  <p className="mt-1 flex items-start gap-1 text-[10px] text-red-600 dark:text-red-400">
                    <FileText className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                    <span className="line-clamp-2">{order.cancelReason}</span>
                  </p>
                )}
                {order.cancelImageUrl && (
                  <button
                    onClick={() => onPreviewImage(order.cancelImageUrl)}
                    className="mt-1 flex cursor-pointer items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <Image className="h-2.5 w-2.5" />
                    Ver imagen
                  </button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-6 w-full text-[10px] text-orange-600 hover:text-orange-700 dark:text-orange-400"
                  onClick={() => onRevert(order.id)}
                >
                  <Undo2 className="mr-1 h-3 w-3" />
                  Revertir
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'kanban'
  const [muted, setMuted] = useState(false)
  const [newOrderIds, setNewOrderIds] = useState(new Set())
  const knownIdsRef = useRef(new Set())
  const [cancelDialogOrderId, setCancelDialogOrderId] = useState(null)
  const [previewImageUrl, setPreviewImageUrl] = useState(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    const data = await adminGetAllOrders()
    setOrders(data)
    setLoading(false)
  }, [])

  // Initial load
  useEffect(() => {
    let cancelled = false
    async function init() {
      const data = await adminGetAllOrders()
      if (!cancelled) {
        knownIdsRef.current = new Set(data.map((o) => o.id))
        setOrders(data)
        setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  // Polling for new orders
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await adminGetAllOrders()
      const incoming = data.filter((o) => !knownIdsRef.current.has(o.id))
      if (incoming.length > 0) {
        const incomingIds = incoming.map((o) => o.id)
        incomingIds.forEach((id) => knownIdsRef.current.add(id))
        setNewOrderIds((prev) => {
          const next = new Set(prev)
          incomingIds.forEach((id) => next.add(id))
          return next
        })
        if (!muted) playNewOrderSound()
        // Auto-clear highlight after 8 seconds
        setTimeout(() => {
          setNewOrderIds((prev) => {
            const next = new Set(prev)
            incomingIds.forEach((id) => next.delete(id))
            return next
          })
        }, 8000)
      }
      setOrders(data)
    }, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [muted])

  async function handleSimulateOrder() {
    await adminSimulateNewOrder()
    // Polling will pick it up, but also trigger an immediate fetch
    const data = await adminGetAllOrders()
    const incoming = data.filter((o) => !knownIdsRef.current.has(o.id))
    if (incoming.length > 0) {
      const incomingIds = incoming.map((o) => o.id)
      incomingIds.forEach((id) => knownIdsRef.current.add(id))
      setNewOrderIds((prev) => {
        const next = new Set(prev)
        incomingIds.forEach((id) => next.add(id))
        return next
      })
      if (!muted) playNewOrderSound()
      setTimeout(() => {
        setNewOrderIds((prev) => {
          const next = new Set(prev)
          incomingIds.forEach((id) => next.delete(id))
          return next
        })
      }, 8000)
    }
    setOrders(data)
  }

  async function handleAdvance(orderId) {
    try {
      const updated = await adminAdvanceOrder(orderId)
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o)),
      )
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleRevert(orderId) {
    try {
      const updated = await adminRevertOrder(orderId)
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o)),
      )
    } catch (err) {
      alert(err.message)
    }
  }

  function handleCancel(orderId) {
    setCancelDialogOrderId(orderId)
  }

  async function handleConfirmCancel(orderId, { reason, imageUrl }) {
    try {
      const updated = await adminCancelOrder(orderId, { reason, imageUrl })
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o)),
      )
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleDragEnd(result) {
    const { draggableId, destination, source } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return
    const orderId = Number(draggableId)
    const newStatus = destination.droppableId
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    )
    try {
      await adminSetOrderStatus(orderId, newStatus)
    } catch (err) {
      alert(err.message)
      // Rollback
      const data = await adminGetAllOrders()
      setOrders(data)
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">Cargando pedidos...</div>
    )
  }

  // Kanban columns — one per active status (cancelados shown separately)
  const kanbanStatuses = [
    'pendiente',
    'en_preparacion',
    'listo',
    'en_camino',
    'entregado',
  ]
  const cancelledOrders = orders.filter((o) => o.status === 'cancelado')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulateOrder}
            title="Simular nuevo pedido (testing)"
          >
            <Plus className="mr-1 h-4 w-4" />
            Simular
          </Button>
          <Button
            variant={muted ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => setMuted(!muted)}
            title={muted ? 'Activar sonido' : 'Silenciar alertas'}
          >
            {muted ? <BellOff className="mr-1 h-4 w-4" /> : <Bell className="mr-1 h-4 w-4" />}
            {muted ? 'Mute' : 'Sonido'}
          </Button>
          <Button variant="outline" size="sm" onClick={loadOrders}>
            <RefreshCw className="mr-1 h-4 w-4" />
            Actualizar
          </Button>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setView('list')}
            >
              <LayoutList className="mr-1 h-4 w-4" />
              Lista
            </Button>
            <Button
              variant={view === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setView('kanban')}
            >
              <Columns3 className="mr-1 h-4 w-4" />
              Kanban
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-2 overflow-x-auto pb-4">
              {kanbanStatuses.map((status) => (
                <KanbanColumn
                  key={status}
                  droppableId={status}
                  title={orderStatusLabels[status] || status}
                  orders={orders.filter((o) => o.status === status)}
                  onAdvance={handleAdvance}
                  onRevert={handleRevert}
                  onCancel={handleCancel}
                  newOrderIds={newOrderIds}
                />
              ))}
            </div>
          </DragDropContext>
          {cancelledOrders.length > 0 && (
            <CancelledSection orders={cancelledOrders} onRevert={handleRevert} onPreviewImage={setPreviewImageUrl} />
          )}
        </>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Entrega</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3 text-right">Importe</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Pago est.</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className={cn(
                    'bg-white dark:bg-gray-800',
                    order.status === 'pendiente' &&
                      'bg-yellow-50/50 dark:bg-yellow-900/10',
                    newOrderIds.has(order.id) &&
                      'animate-pulse bg-green-100 shadow-[inset_4px_0_0_0_theme(--color-green-500)] dark:bg-green-900/40',
                  )}
                >
                  <td className="px-4 py-3 font-mono font-bold">#{order.id}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.customerName || 'Invitado'}</div>
                    {order.address && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.address.street}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {order.orderType === 'pickup' ? (
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Retiro
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        Delivery
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{order.paymentMethod}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ${order.total?.toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                    {order.status === 'cancelado' && order.cancelReason && (
                      <p className="mt-1 flex items-start gap-1 text-[10px] text-red-600 dark:text-red-400">
                        <FileText className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                        <span className="line-clamp-2 max-w-[200px]">{order.cancelReason}</span>
                      </p>
                    )}
                    {order.status === 'cancelado' && order.cancelImageUrl && (
                      <button
                        onClick={() => setPreviewImageUrl(order.cancelImageUrl)}
                        className="mt-1 flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <Image className="h-2.5 w-2.5" />
                        Ver imagen
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-xs font-medium',
                        paymentStatusColors[order.paymentStatus] || 'text-gray-500',
                      )}
                    >
                      {order.paymentStatus === 'pagado' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {order.status !== 'pendiente' &&
                        order.status !== 'cancelado' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRevert(order.id)}
                            title="Retroceder estado"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        )}
                      {(order.status === 'entregado' || order.status === 'cancelado') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-orange-500 hover:text-orange-600"
                          onClick={() => handleRevert(order.id)}
                          title={order.status === 'cancelado' ? 'Revertir cancelación' : 'Revertir entrega'}
                        >
                          <Undo2 className="h-4 w-4" />
                        </Button>
                      )}
                      {order.status !== 'entregado' &&
                        order.status !== 'cancelado' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleAdvance(order.id)}
                              title="Avanzar estado"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => handleCancel(order.id)}
                              title="Cancelar pedido"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancel Dialog */}
      <CancelOrderDialog
        orderId={cancelDialogOrderId}
        open={cancelDialogOrderId !== null}
        onOpenChange={(open) => { if (!open) setCancelDialogOrderId(null) }}
        onConfirm={handleConfirmCancel}
      />

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        imageUrl={previewImageUrl}
        open={previewImageUrl !== null}
        onOpenChange={(open) => { if (!open) setPreviewImageUrl(null) }}
      />
    </div>
  )
}
