import { Link } from 'react-router-dom'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const {
    items,
    orderComment,
    setOrderComment,
    removeItem,
    updateQuantity,
    subtotal,
  } = useCart()

  if (items.length === 0) {
    return (
      <div className="space-y-4 py-12 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">
          Tu carrito está vacío
        </p>
        <Link to="/menu">
          <Button variant="outline">Ver menú</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Mi pedido</h1>
        <Link to="/menu">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Seguir pidiendo
          </Button>
        </Link>
      </div>

      {/* Cart items */}
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.cartId}>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.format.name}
                  {item.flavors.length > 0 &&
                    ' · ' +
                      item.flavors
                        .map((f) =>
                          f.quantity ? `${f.quantity} ${f.name}` : f.name,
                        )
                        .join(', ')}
                  {item.extras.length > 0 &&
                    ' + ' + item.extras.map((e) => e.name).join(', ')}
                </p>
                {item.comboSelections && (
                  <div className="mt-1 space-y-0.5">
                    {item.comboSelections.map((cs, i) => (
                      <p
                        key={i}
                        className="text-sm text-gray-500 dark:text-gray-400"
                      >
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          {cs.label}:
                        </span>{' '}
                        {cs.flavors
                          .map((f) =>
                            f.quantity > 1
                              ? `${f.name} ×${f.quantity}`
                              : f.name,
                          )
                          .join(', ')}
                      </p>
                    ))}
                  </div>
                )}
                {item.comment && (
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 italic">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                )}
                <p className="mt-1 text-sm font-medium">
                  ${(item.unitPrice * item.quantity).toLocaleString('es-AR')}
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                onClick={() => removeItem(item.cartId)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order comment */}
      <div className="space-y-2">
        <Label htmlFor="order-comment">
          Comentario del pedido{' '}
          <span className="text-gray-400 dark:text-gray-500">(opcional)</span>
        </Label>
        <Textarea
          id="order-comment"
          placeholder="Indicaciones generales para tu pedido..."
          value={orderComment}
          onChange={(e) => setOrderComment(e.target.value)}
          rows={2}
        />
      </div>

      {/* Subtotal + checkout */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Subtotal</p>
          <p className="text-lg font-bold">
            ${subtotal.toLocaleString('es-AR')}
          </p>
        </div>
        <Link to="/checkout">
          <Button size="lg">Confirmar pedido</Button>
        </Link>
      </div>
    </div>
  )
}
