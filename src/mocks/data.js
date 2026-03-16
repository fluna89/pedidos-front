// Mock data - simulates backend responses
// Replace with real API calls when backend is ready

// ── Sabores disponibles ────────────────────────────────

export const mockFlavors = [
  { id: 'fl-ddl', name: 'Dulce de leche' },
  { id: 'fl-ddl-g', name: 'Dulce de leche granizado' },
  { id: 'fl-choc', name: 'Chocolate' },
  { id: 'fl-choc-am', name: 'Chocolate amargo' },
  { id: 'fl-fru', name: 'Frutilla' },
  { id: 'fl-cre', name: 'Crema americana' },
  { id: 'fl-sam', name: 'Sambayón' },
  { id: 'fl-lim', name: 'Limón' },
  { id: 'fl-men', name: 'Menta granizada' },
  { id: 'fl-tra', name: 'Tramontana' },
  { id: 'fl-masc', name: 'Mascarpone con frutos rojos' },
  { id: 'fl-pis', name: 'Pistacho' },
  { id: 'fl-ban', name: 'Banana split' },
  { id: 'fl-man', name: 'Maracuyá' },
  { id: 'fl-caf', name: 'Café' },
  { id: 'fl-tir', name: 'Tiramisú' },
]

// ── Gustos de empanadas ────────────────────────────────

export const mockEmpanadaFlavors = [
  { id: 'emp-carne', name: 'Carne', price: 900, image: '🥩' },
  { id: 'emp-pollo', name: 'Pollo', price: 850, image: '🍗' },
  { id: 'emp-jyq', name: 'Jamón y queso', price: 800, image: '🧀' },
  { id: 'emp-humita', name: 'Humita', price: 800, image: '🌽' },
  { id: 'emp-caprese', name: 'Caprese', price: 850, image: '🍅' },
  { id: 'emp-verdura', name: 'Verdura', price: 750, image: '🥬' },
]

// ── Opciones de gaseosa (para combos) ──────────────────

export const mockGaseosaFlavors = [
  { id: 'gas-coca', name: 'Coca-Cola', image: '🥤' },
  { id: 'gas-sprite', name: 'Sprite', image: '🥤' },
  { id: 'gas-fanta', name: 'Fanta', image: '🥤' },
]

// ── Catálogo ───────────────────────────────────────────
// Flat product list — each item is a single SKU with one format.
// The user sees everything at a glance without navigating categories.

export const mockCategories = [
  { id: 'helados', name: 'Helados', icon: '🍦' },
  { id: 'postres', name: 'Postres', icon: '🍨' },
  { id: 'empanadas', name: 'Empanadas', icon: '🥟' },
  { id: 'pizzas', name: 'Pizzas', icon: '🍕' },
  { id: 'combos', name: 'Combos', icon: '🎁' },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
]

export const mockMenu = [
  // ── Helados por kilo ─────────
  {
    id: 1,
    name: 'Helado 1 kg',
    description: 'Hasta 5 sabores a elección — nuestro helado artesanal',
    category: 'helados',
    image: '🍦',
    hasFlavors: true,
    flavorMode: 'quantity',
    formats: [{ id: 'f-1kg', name: '1 kg', price: 9000, unitCount: 5 }],
    extras: [
      { id: 'x-salsa-choc', name: 'Salsa de chocolate', price: 300 },
      { id: 'x-salsa-ddl', name: 'Salsa de dulce de leche', price: 300 },
      { id: 'x-crema', name: 'Crema chantilly', price: 350 },
      { id: 'x-granola', name: 'Granola', price: 400 },
    ],
  },
  {
    id: 2,
    name: 'Helado 1/2 kg',
    description: 'Hasta 3 sabores a elección — nuestro helado artesanal',
    category: 'helados',
    image: '🍦',
    hasFlavors: true,
    flavorMode: 'quantity',
    formats: [{ id: 'f-12kg', name: '1/2 kg', price: 5500, unitCount: 3 }],
    extras: [
      { id: 'x-salsa-choc', name: 'Salsa de chocolate', price: 300 },
      { id: 'x-salsa-ddl', name: 'Salsa de dulce de leche', price: 300 },
      { id: 'x-crema', name: 'Crema chantilly', price: 350 },
      { id: 'x-granola', name: 'Granola', price: 400 },
    ],
  },
  {
    id: 3,
    name: 'Helado 1/4 kg',
    description: 'Hasta 2 sabores a elección — nuestro helado artesanal',
    category: 'helados',
    image: '🍦',
    hasFlavors: true,
    flavorMode: 'quantity',
    formats: [{ id: 'f-14kg', name: '1/4 kg', price: 3500, unitCount: 2 }],
    extras: [
      { id: 'x-salsa-choc', name: 'Salsa de chocolate', price: 300 },
      { id: 'x-salsa-ddl', name: 'Salsa de dulce de leche', price: 300 },
      { id: 'x-crema', name: 'Crema chantilly', price: 350 },
      { id: 'x-granola', name: 'Granola', price: 400 },
    ],
  },

  // ── Postres ──────────────────
  {
    id: 4,
    name: 'Sundae clásico',
    description: 'Helado con salsa, crema y topping crocante (hasta 2 sabores)',
    category: 'postres',
    image: '🍨',
    counterOnly: true,
    hasFlavors: true,
    flavorMode: 'quantity',
    formats: [{ id: 'f-sundae', name: 'Sundae', price: 3800, unitCount: 2 }],
    extras: [
      { id: 'x-brownie', name: 'Brownie', price: 600 },
      { id: 'x-salsa-fru', name: 'Salsa de frutilla', price: 300 },
      { id: 'x-nueces', name: 'Nueces', price: 450 },
      { id: 'x-crema', name: 'Crema extra', price: 350 },
    ],
  },
  {
    id: 5,
    name: 'Banana Split',
    description: 'Banana, 3 bochas de helado, salsas y crema',
    category: 'postres',
    image: '🍌',
    paused: true,
    hasFlavors: true,
    flavorMode: 'quantity',
    formats: [{ id: 'f-bsplit', name: 'Clásico', price: 5800, unitCount: 3 }],
    extras: [
      { id: 'x-brownie', name: 'Brownie', price: 600 },
      { id: 'x-nueces', name: 'Nueces', price: 450 },
      { id: 'x-salsa-choc', name: 'Salsa extra de chocolate', price: 300 },
    ],
  },

  // ── Milkshakes ───────────────
  {
    id: 10,
    name: 'Milkshake mediano',
    description: 'Batido cremoso con helado artesanal (350ml, 1 sabor)',
    category: 'bebidas',
    image: '🥤',
    hasFlavors: true,
    flavorMode: 'quantity',
    formats: [{ id: 'f-milk-m', name: 'Mediano (350ml)', price: 3200, unitCount: 1 }],
    extras: [
      { id: 'x-crema', name: 'Crema chantilly', price: 350 },
      { id: 'x-oreo', name: 'Oreo triturada', price: 400 },
    ],
  },
  {
    id: 11,
    name: 'Milkshake grande',
    description: 'Batido cremoso con helado artesanal (500ml, hasta 2 sabores)',
    category: 'bebidas',
    image: '🥤',
    paused: true,
    counterOnly: true,
    hasFlavors: true,
    flavorMode: 'quantity',
    formats: [{ id: 'f-milk-g', name: 'Grande (500ml)', price: 4200, unitCount: 2 }],
    extras: [
      { id: 'x-crema', name: 'Crema chantilly', price: 350 },
      { id: 'x-oreo', name: 'Oreo triturada', price: 400 },
    ],
  },

  // ── Empanadas ────────────────
  {
    id: 17,
    name: 'Empanadas',
    description: 'Empanadas caseras a elección de gustos — elegí la cantidad que quieras',
    category: 'empanadas',
    image: '🥟',
    hasFlavors: true,
    flavorMode: 'quantity',
    flavorsSource: 'empanadas',
    unitPricing: true,
    formats: [{ id: 'f-emp', name: 'Empanadas', price: 0 }],
    extras: [],
  },
  // ── Pizzas ───────────────────────
  {
    id: 22,
    name: 'Pizza muzzarella',
    description: 'Clásica pizza de muzzarella, recién salida del horno',
    category: 'pizzas',
    image: '🍕',
    hasFlavors: false,
    formats: [
      { id: 'f-pizza-muzza-p', name: 'Porción', price: 1200 },
      { id: 'f-pizza-muzza', name: 'Pizza entera', price: 5500 },
    ],
    extras: [
      { id: 'x-muzza-extra', name: 'Muzzarella extra', price: 500 },
      { id: 'x-aceitunas', name: 'Aceitunas', price: 300 },
    ],
  },
  {
    id: 24,
    name: 'Pizza napolitana',
    description: 'Pizza con tomate, muzzarella y ajo',
    category: 'pizzas',
    image: '🍕',
    hasFlavors: false,
    formats: [{ id: 'f-pizza-napo', name: 'Pizza entera', price: 5800 }],
    extras: [],
  },
  {
    id: 25,
    name: 'Pizza fugazzeta',
    description: 'Pizza rellena de muzzarella y cebolla',
    category: 'pizzas',
    image: '🍕',
    hasFlavors: false,
    formats: [{ id: 'f-pizza-fuga', name: 'Pizza entera', price: 6000 }],
    extras: [],
  },
  // ── Combos ──────────────────────
  {
    id: 20,
    name: 'Combo 2× 1/4 kg',
    description: '2 helados de 1/4 kg — más helado, mejor precio',
    category: 'combos',
    image: '🎁',
    isCombo: true,
    hasFlavors: false,
    formats: [{ id: 'f-combo-2x14', name: 'Combo 2× 1/4 kg', price: 6000 }],
    comboItems: [
      { label: 'Helado 1/4 kg (1°)', unitCount: 2 },
      { label: 'Helado 1/4 kg (2°)', unitCount: 2 },
    ],
    extras: [],
  },
  {
    id: 21,
    name: 'Combo Docena de empanadas',
    description: '12 empanadas caseras al mejor precio',
    category: 'combos',
    image: '🎁',
    isCombo: true,
    hasFlavors: false,
    formats: [{ id: 'f-combo-emp12', name: 'Combo docena', price: 8400 }],
    comboItems: [
      { label: 'Empanadas (12)', flavorsSource: 'empanadas', unitCount: 12 },
    ],
    extras: [],
  },
  {
    id: 23,
    name: 'Combo Pizza + 2 Gaseosas',
    description: 'Pizza muzzarella + 2 latas de gaseosa a elección',
    category: 'combos',
    image: '🎁',
    isCombo: true,
    hasFlavors: false,
    formats: [{ id: 'f-combo-pizza-gas', name: 'Combo Pizza + 2 Gaseosas', price: 6500 }],
    comboItems: [
      { label: 'Gaseosa (2 latas)', flavorsSource: 'gaseosas', unitCount: 2 },
    ],
    extras: [],
  },
  // ── Bebidas ──────────────────
  {
    id: 12,
    name: 'Coca-Cola',
    description: 'Lata 354 ml',
    category: 'bebidas',
    image: '🥤',
    hasFlavors: false,
    formats: [{ id: 'f-coca', name: 'Lata 354ml', price: 800 }],
    extras: [],
  },
  {
    id: 13,
    name: 'Sprite',
    description: 'Lata 354 ml',
    category: 'bebidas',
    image: '🥤',
    hasFlavors: false,
    formats: [{ id: 'f-sprite', name: 'Lata 354ml', price: 800 }],
    extras: [],
  },
  {
    id: 14,
    name: 'Fanta',
    description: 'Lata 354 ml',
    category: 'bebidas',
    image: '🥤',
    hasFlavors: false,
    formats: [{ id: 'f-fanta', name: 'Lata 354ml', price: 800 }],
    extras: [],
  },
  {
    id: 15,
    name: 'Agua mineral sin gas',
    description: 'Botella 500 ml',
    category: 'bebidas',
    image: '💧',
    hasFlavors: false,
    formats: [{ id: 'f-agua-sg', name: '500ml', price: 600 }],
    extras: [],
  },
  {
    id: 16,
    name: 'Agua mineral con gas',
    description: 'Botella 500 ml',
    category: 'bebidas',
    image: '💧',
    hasFlavors: false,
    formats: [{ id: 'f-agua-cg', name: '500ml', price: 600 }],
    extras: [],
  },
]

export const mockOrderStatuses = [
  'pendiente',
  'confirmado',
  'en_preparacion',
  'listo',
  'en_camino',
  'entregado',
]

// Status labels for display
export const orderStatusLabels = {
  pendiente: 'Pendiente',
  pendiente_pago: 'Pendiente de pago',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  listo: 'Listo',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

// ── Historial de pedidos (mock user id: 1) ─────────────

export const mockOrders = [
  {
    id: 2035,
    userId: 1,
    status: 'entregado',
    orderType: 'delivery',
    customerName: 'Juan Pérez',
    items: [
      {
        name: 'Helado por kilo',
        format: '1/2 kg',
        flavors: 'Tiramisú, Mascarpone con frutos rojos, Café',
        quantity: 1,
        unitPrice: 5500,
      },
    ],
    subtotal: 5500,
    deliveryCost: 500,
    pointsRedeemed: 2000,
    coupon: 'AINARA10',
    couponDiscount: 550,
    total: 3450,
    paymentMethod: 'Tarjeta crédito/débito',
    paymentStatus: 'pagado',
    address: { alias: 'Trabajo', street: 'Maipú 456' },
    createdAt: '2026-02-28T12:00:00Z',
    updatedAt: '2026-02-28T13:45:00Z',
  },
  {
    id: 2021,
    userId: 1,
    status: 'entregado',
    orderType: 'pickup',
    customerName: 'Juan Pérez',
    items: [
      {
        name: 'Torta helada',
        format: 'Mediana (8 porc.)',
        flavors: 'Dulce de leche, Chocolate amargo',
        quantity: 1,
        unitPrice: 12000,
      },
      {
        name: 'Sundae',
        format: 'Individual',
        flavors: 'Crema americana',
        quantity: 3,
        unitPrice: 3500,
      },
    ],
    subtotal: 22500,
    deliveryCost: 0,
    pointsRedeemed: 0,
    coupon: null,
    couponDiscount: 0,
    total: 22500,
    paymentMethod: 'Efectivo',
    paymentStatus: 'pagado',
    address: null,
    createdAt: '2026-02-14T18:00:00Z',
    updatedAt: '2026-02-14T18:30:00Z',
  },
  {
    id: 2010,
    userId: 1,
    status: 'entregado',
    orderType: 'delivery',
    customerName: 'Juan Pérez',
    items: [
      {
        name: 'Helado por kilo',
        format: '1 kg',
        flavors: 'Dulce de leche granizado, Tramontana, Banana split, Limón, Menta granizada',
        quantity: 1,
        unitPrice: 9000,
      },
    ],
    subtotal: 9000,
    deliveryCost: 1200,
    pointsRedeemed: 0,
    coupon: 'HELADOGRATIS',
    couponDiscount: 3500,
    total: 6700,
    paymentMethod: 'Transferencia bancaria',
    paymentStatus: 'pagado',
    address: { alias: 'Casa', street: 'Av. Corrientes 1234' },
    createdAt: '2026-01-20T14:00:00Z',
    updatedAt: '2026-01-20T15:15:00Z',
  },
  // ── Pedidos activos para el admin ─────────────
  {
    id: 3001,
    userId: 'guest-100',
    status: 'pendiente',
    orderType: 'delivery',
    customerName: 'María López',
    items: [
      { name: 'Helado 1/4 kg', format: '1/4 kg', flavors: 'Dulce de leche, Chocolate', quantity: 2, unitPrice: 3500 },
      { name: 'Coca-Cola', format: 'Lata 354ml', flavors: '', quantity: 1, unitPrice: 800 },
    ],
    subtotal: 7800,
    deliveryCost: 800,
    total: 8600,
    paymentMethod: 'Mercado Pago',
    paymentStatus: 'pagado',
    address: { alias: 'Casa', street: 'Av. Santa Fe 2100' },
    createdAt: '2026-03-09T14:30:00Z',
    updatedAt: '2026-03-09T14:30:00Z',
  },
  {
    id: 3002,
    userId: 3,
    status: 'en_preparacion',
    orderType: 'delivery',
    customerName: 'Carlos Ruiz',
    items: [
      { name: 'Pizza muzzarella', format: 'Pizza entera', flavors: '', quantity: 1, unitPrice: 5500 },
      { name: 'Empanadas', format: 'Empanadas', flavors: '4 Carne, 2 Pollo', quantity: 1, unitPrice: 5300 },
    ],
    subtotal: 10800,
    deliveryCost: 500,
    total: 11300,
    paymentMethod: 'Efectivo',
    paymentStatus: 'pendiente_pago',
    address: { alias: 'Oficina', street: 'Lavalle 800' },
    createdAt: '2026-03-09T14:15:00Z',
    updatedAt: '2026-03-09T14:20:00Z',
  },
  {
    id: 3003,
    userId: 4,
    status: 'listo',
    orderType: 'pickup',
    customerName: 'Ana García',
    items: [
      { name: 'Combo 2× 1/4 kg', format: 'Combo 2× 1/4 kg', flavors: 'Helado 1/4 kg (1°): Frutilla, Limón | Helado 1/4 kg (2°): Chocolate, Pistacho', quantity: 1, unitPrice: 6000 },
    ],
    subtotal: 6000,
    deliveryCost: 0,
    total: 6000,
    paymentMethod: 'Mercado Pago',
    paymentStatus: 'pagado',
    address: null,
    createdAt: '2026-03-09T13:50:00Z',
    updatedAt: '2026-03-09T14:10:00Z',
  },
  {
    id: 3004,
    userId: 5,
    status: 'pendiente',
    orderType: 'delivery',
    customerName: 'Roberto Díaz',
    items: [
      { name: 'Combo Pizza + 2 Gaseosas', format: 'Combo Pizza + 2 Gaseosas', flavors: 'Gaseosa: Coca-Cola, Sprite', quantity: 1, unitPrice: 6500 },
      { name: 'Helado 1 kg', format: '1 kg', flavors: 'Dulce de leche, Chocolate amargo, Sambayón, Tramontana, Pistacho', quantity: 1, unitPrice: 9000 },
    ],
    subtotal: 15500,
    deliveryCost: 1200,
    total: 16700,
    paymentMethod: 'Transferencia bancaria',
    paymentStatus: 'pendiente_pago',
    address: { alias: 'Casa', street: 'Av. Callao 350' },
    createdAt: '2026-03-09T14:45:00Z',
    updatedAt: '2026-03-09T14:45:00Z',
  },
  {
    id: 3005,
    userId: 6,
    status: 'cancelado',
    orderType: 'delivery',
    customerName: 'Laura Méndez',
    items: [
      { name: 'Helado 1/2 kg', format: '1/2 kg', flavors: 'Frutilla, Limón, Chocolate', quantity: 1, unitPrice: 5500 },
    ],
    subtotal: 5500,
    deliveryCost: 800,
    total: 6300,
    paymentMethod: 'Mercado Pago',
    paymentStatus: 'pagado',
    address: { alias: 'Casa', street: 'Av. Cabildo 1200' },
    cancelReason: 'Cliente indicó dirección incorrecta y no pudo corregirla a tiempo',
    cancelImageUrl: 'https://placehold.co/600x400/ef4444/ffffff?text=Captura+chat+cliente',
    createdAt: '2026-03-09T13:20:00Z',
    updatedAt: '2026-03-09T13:35:00Z',
  },
]

// Coverage zone — addresses within 5 km of the store are covered
export const mockStoreLocation = { lat: -34.6037, lng: -58.3816 } // CABA centro
export const mockMaxDeliveryKm = 5

// Delivery zones — cost tiers by distance (km)
// Sorted ascending by maxKm. The first matching zone applies.
export const mockDeliveryZones = [
  { id: 'zone-1', name: 'Cercana', maxKm: 1.5, cost: 500 },
  { id: 'zone-2', name: 'Media', maxKm: 3, cost: 800 },
  { id: 'zone-3', name: 'Lejana', maxKm: 5, cost: 1200 },
]

// ── Medios de Pago ─────────────────────────────────────

export const mockPaymentMethods = [
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    icon: '💳',
    description: 'Pagá online con tu cuenta de Mercado Pago',
    type: 'online',
    available: true,
  },
  {
    id: 'transfer',
    name: 'Transferencia bancaria',
    icon: '🏦',
    description: 'Transferí al CBU/CVU del local',
    type: 'manual',
    available: true,
    bankInfo: {
      bank: 'Banco Nación',
      cbu: '0110012340012345678901',
      alias: 'AINARA.HELADOS',
      holder: 'Ainara Helados S.R.L.',
      cuit: '30-12345678-9',
    },
  },
  {
    id: 'card',
    name: 'Tarjeta crédito/débito',
    icon: '💳',
    description: 'Visa, Mastercard, Amex',
    type: 'online',
    available: true,
  },
  {
    id: 'cash',
    name: 'Efectivo',
    icon: '💵',
    description: 'Pagás al recibir o retirar tu pedido',
    type: 'cash',
    available: true,
  },
]

// ── Programa de Fidelización ───────────────────────────

/**
 * Points history for mock user (id: 1 — Juan Pérez).
 * type: 'earn' | 'redeem' | 'expire'
 * Each earn row accrues 1 point per peso (excl. shipping).
 * Points expire 3 months after accrual.
 */
export const mockPointsHistory = [
  {
    id: 'pts-1',
    userId: 1,
    type: 'earn',
    points: 9000,
    description: 'Pedido #1001 — Helado por kilo 1kg',
    date: '2025-12-15T14:30:00Z',
    expiresAt: '2026-03-15T14:30:00Z',
  },
  {
    id: 'pts-2',
    userId: 1,
    type: 'earn',
    points: 4300,
    description: 'Pedido #1002 — Sundae + Milkshake',
    date: '2026-01-22T10:00:00Z',
    expiresAt: '2026-04-22T10:00:00Z',
  },
  {
    id: 'pts-3',
    userId: 1,
    type: 'redeem',
    points: -2000,
    description: 'Canje en pedido #1003',
    date: '2026-02-05T18:00:00Z',
    expiresAt: null,
  },
  {
    id: 'pts-4',
    userId: 1,
    type: 'earn',
    points: 5500,
    description: 'Pedido #1003 — Helado 1/2 kg',
    date: '2026-02-05T18:00:00Z',
    expiresAt: '2026-05-05T18:00:00Z',
  },
]

/**
 * Mock discount coupons.
 * type: 'percentage' | 'fixed'
 * minOrder: minimum subtotal to apply the coupon.
 */
export const mockCoupons = [
  {
    id: 'cup-1',
    code: 'HELADOGRATIS',
    type: 'fixed',
    value: 3500,
    description: '$3.500 de descuento',
    minOrder: 5000,
    expiresAt: '2026-06-30T23:59:59Z',
    active: true,
  },
  {
    id: 'cup-2',
    code: 'VERANO20',
    type: 'percentage',
    value: 20,
    description: '20% de descuento',
    minOrder: 3000,
    maxDiscount: 5000,
    expiresAt: '2026-04-01T23:59:59Z',
    active: true,
  },
  {
    id: 'cup-3',
    code: 'AINARA10',
    type: 'percentage',
    value: 10,
    description: '10% de descuento',
    minOrder: 0,
    maxDiscount: 2000,
    expiresAt: '2026-12-31T23:59:59Z',
    active: true,
  },
  {
    id: 'cup-4',
    code: 'EXPIRADO',
    type: 'fixed',
    value: 1000,
    description: '$1.000 de descuento',
    minOrder: 0,
    expiresAt: '2025-06-01T23:59:59Z',
    active: false,
  },
]

// ── Direcciones ────────────────────────────────────────

export const mockAddresses = [
  {
    id: 'addr-1',
    alias: 'Casa',
    street: 'Av. Corrientes 1234',
    floor: '3',
    apartment: 'B',
    neighborhood: 'San Nicolás',
    city: 'CABA',
    comment: 'Timbre B',
    lat: -34.6045,
    lng: -58.3923,
    inCoverage: true,
  },
  {
    id: 'addr-2',
    alias: 'Trabajo',
    street: 'Maipú 456',
    floor: '12',
    apartment: 'A',
    neighborhood: 'Retiro',
    city: 'CABA',
    comment: '',
    lat: -34.5997,
    lng: -58.3751,
    inCoverage: true,
  },
  {
    id: 'addr-3',
    alias: 'Casa de mamá',
    street: 'Av. San Martín 8900',
    floor: '',
    apartment: '',
    neighborhood: 'Centro',
    city: 'Pilar',
    comment: 'Portón verde',
    lat: -34.4588,
    lng: -58.9142,
    inCoverage: false,
  },
]
