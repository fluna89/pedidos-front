import { Card, CardContent } from '@/components/ui/card'

export default function ProductCardShell({ image, name, description, isCombo, className, children }) {
  return (
    <Card
      className={`flex flex-row items-center overflow-hidden ${
        isCombo
          ? 'border-2 border-amber-400 ring-1 ring-amber-200 dark:border-amber-500 dark:ring-amber-700'
          : ''
      } ${className || ''}`}
    >
      <div className="relative ml-3 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        {isCombo && (
          <span className="absolute top-1 right-1 z-10 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-500">
            COMBO
          </span>
        )}
        {image}
      </div>
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold">{name}</h3>
        <p className="flex-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
        {children}
      </CardContent>
    </Card>
  )
}
