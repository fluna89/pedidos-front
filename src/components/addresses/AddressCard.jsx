import { MapPin, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function AddressCard({
  address,
  isActive,
  onSelect,
  onEdit,
  onDelete,
}) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        isActive &&
          'ring-2 ring-gray-900 dark:ring-gray-100',
      )}
      onClick={() => onSelect(address.id)}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <MapPin
          className={cn(
            'mt-0.5 h-5 w-5 shrink-0',
            address.inCoverage
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-500 dark:text-red-400',
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {address.alias || 'Sin alias'}
            </span>
            {isActive && (
              <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs text-white dark:bg-gray-100 dark:text-gray-900">
                Activa
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {address.street}
            {address.floor ? `, Piso ${address.floor}` : ''}
            {address.apartment ? ` ${address.apartment}` : ''}
          </p>
          {(address.neighborhood || address.city) && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {[address.neighborhood, address.city].filter(Boolean).join(', ')}
            </p>
          )}
          {address.comment && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {address.comment}
            </p>
          )}
          {!address.inCoverage && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
              <AlertTriangle className="h-3 w-3" />
              Fuera de zona de cobertura
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(address)
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(address.id)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
