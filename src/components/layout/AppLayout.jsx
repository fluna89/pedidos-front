import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
