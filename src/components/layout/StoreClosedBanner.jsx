import useStoreStatus from '@/hooks/useStoreStatus'
import { AlertTriangle } from 'lucide-react'

export default function StoreClosedBanner() {
  const { isOpen, message, loading } = useStoreStatus()

  if (loading || isOpen) return null

  return (
    <div className="bg-amber-500 px-4 py-2.5 text-center text-sm font-medium text-white">
      <AlertTriangle className="mr-1.5 inline-block h-4 w-4 align-text-bottom" />
      {message || 'El local se encuentra cerrado en este momento.'}
    </div>
  )
}
