import { useContext } from 'react'
import { StoreStatusContext } from '@/context/store-status-context'

export default function useStoreStatus() {
  const context = useContext(StoreStatusContext)
  if (!context) throw new Error('useStoreStatus must be used within StoreStatusProvider')
  return context
}
