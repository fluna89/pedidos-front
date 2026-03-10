import { useState, useEffect, useCallback } from 'react'
import {
  adminGetAllOrders,
  adminAdvanceOrder,
  adminRevertOrder,
  adminCancelOrder,
} from '@/mocks/handlers'
import { orderStatusLabels } from '@/mocks/data'
import { Button } from '@/components/ui/button'
import {
  ChevronRight,
  ChevronLeft,
  X,
  RefreshCw,
  LayoutList,
  Columns3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
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

function KanbanColumn({ title, orders, onAdvance, onRevert, onCancel }) {
  return (
    <div className="flex min-w-[320px] flex-1 flex-col rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h3 className="text-sm font-semibold">
          {title}{' '}
          <span className="ml-1 text-xs font-normal text-gray-500">
            ({orders.length})
          </span>
        </h3>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {orders.length === 0 && (
          <p className="py-6 text-center text-xs text-gray-400">Sin pedidos</p>
        )}
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold">#{order.id}</span>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm font-medium">{order.customerName || 'Invitado'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {order.orderType === 'pickup' ? 'Retiro' : order.address?.street || 'Delivery'}
            </p>
            <p className="mt-1 text-xs text-gray-500">{formatDate(order.createdAt)}</p>
            <div className="mt-1 text-sm font-semibold">
              ${order.total?.toLocaleString('es-AR')}
            </div>
            <div className="mt-2 flex items-center gap-1">
              {order.status !== 'pendiente' &&
                order.status !== 'cancelado' &&
                order.status !== 'entregado' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onRevert(order.id)}
                    title="Retroceder estado"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                )}
              {order.status !== 'entregado' && order.status !== 'cancelado' && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onAdvance(order.id)}
                    title="Avanzar estado"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                    onClick={() => onCancel(order.id)}
                    title="Cancelar pedido"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'kanban'

  const loadOrders = useCallback(async () => {
    setLoading(true)
    const data = await adminGetAllOrders()
    setOrders(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function init() {
      const data = await adminGetAllOrders()
      if (!cancelled) {
        setOrders(data)
        setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

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

  async function handleCancel(orderId) {
    if (!confirm('¿Cancelar este pedido?')) return
    try {
      const updated = await adminCancelOrder(orderId)
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o)),
      )
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">Cargando pedidos...</div>
    )
  }

  // Kanban groups
  const entrantes = orders.filter((o) => o.status === 'pendiente')
  const enProceso = orders.filter(
    (o) => o.status === 'en_preparacion' || o.status === 'listo',
  )
  const finalizado = orders.filter(
    (o) =>
      o.status === 'en_camino' ||
      o.status === 'entregado' ||
      o.status === 'cancelado',
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="flex items-center gap-2">
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
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn
            title="Entrantes"
            orders={entrantes}
            onAdvance={handleAdvance}
            onRevert={handleRevert}
            onCancel={handleCancel}
          />
          <KanbanColumn
            title="En proceso"
            orders={enProceso}
            onAdvance={handleAdvance}
            onRevert={handleRevert}
            onCancel={handleCancel}
          />
          <KanbanColumn
            title="Finalizados"
            orders={finalizado}
            onAdvance={handleAdvance}
            onRevert={handleRevert}
            onCancel={handleCancel}
          />
        </div>
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
                        order.status !== 'cancelado' &&
                        order.status !== 'entregado' && (
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
    </div>
  )
}
