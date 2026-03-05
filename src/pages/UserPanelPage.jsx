import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Package, ClipboardList, Star, UserCog } from 'lucide-react'
import ActiveOrderSection from '@/components/panel/ActiveOrderSection'
import OrderHistorySection from '@/components/panel/OrderHistorySection'
import PointsSection from '@/components/panel/PointsSection'
import AccountSection from '@/components/panel/AccountSection'

const tabs = [
  { id: 'active', label: 'Pedido activo', icon: Package },
  { id: 'history', label: 'Historial', icon: ClipboardList },
  { id: 'points', label: 'Puntos', icon: Star },
  { id: 'account', label: 'Mi cuenta', icon: UserCog },
]

export default function UserPanelPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('active')

  const firstName = user?.name?.split(' ')[0] || 'Usuario'

  return (
    <div className="mx-auto max-w-md space-y-4 pt-4">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold">Hola, {firstName}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gestioná tus pedidos, puntos y datos de cuenta
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors sm:px-3 sm:text-sm',
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'active' && <ActiveOrderSection />}
        {activeTab === 'history' && <OrderHistorySection />}
        {activeTab === 'points' && <PointsSection />}
        {activeTab === 'account' && <AccountSection />}
      </div>
    </div>
  )
}
