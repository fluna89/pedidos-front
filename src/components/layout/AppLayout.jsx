import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import MobileUserBar from '@/components/layout/MobileUserBar'
import FloatingCartBar from '@/components/layout/FloatingCartBar'
import StoreClosedBanner from '@/components/layout/StoreClosedBanner'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Header />
      <StoreClosedBanner />
      <MobileUserBar />
      <main className="mx-auto max-w-5xl px-4 py-6 pb-24">
        <Outlet />
      </main>
      <FloatingCartBar />
    </div>
  )
}
