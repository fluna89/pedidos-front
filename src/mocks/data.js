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

// ── Catálogo ───────────────────────────────────────────

export const mockCategories = [
  { id: 'helados', name: 'Helados', icon: '🍦' },
  { id: 'postres', name: 'Postres', icon: '🍨' },
  { id: 'tortas', name: 'Tortas heladas', icon: '🎂' },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
]

export const mockMenu = [
  // ── Helados ──────────────────
  {
    id: 1,
    name: 'Helado por kilo',
    description: 'Nuestro helado artesanal elaborado con ingredientes naturales',
    category: 'helados',
    image: '🍦',
    available: true,
    hasFlavors: true,
    formats: [
      { id: 'f1-14', name: '1/4 kg', price: 3500, maxFlavors: 2 },
      { id: 'f1-12', name: '1/2 kg', price: 5500, maxFlavors: 3 },
      { id: 'f1-1', name: '1 kg', price: 9000, maxFlavors: 5 },
    ],
    extras: [
      { id: 'x-salsa-choc', name: 'Salsa de chocolate', price: 300 },
      { id: 'x-salsa-ddl', name: 'Salsa de dulce de leche', price: 300 },
      { id: 'x-crema', name: 'Crema chantilly', price: 350 },
      { id: 'x-granola', name: 'Granola', price: 400 },
    ],
  },
  {
    id: 2,
    name: 'Cucurucho',
    description: 'Cono de waffle crocante con las bochas que elijas',
    category: 'helados',
    image: '🍦',
    available: true,
    hasFlavors: true,
    formats: [
      { id: 'f2-1', name: '1 bocha', price: 2000, maxFlavors: 1 },
      { id: 'f2-2', name: '2 bochas', price: 3200, maxFlavors: 2 },
      { id: 'f2-3', name: '3 bochas', price: 4200, maxFlavors: 3 },
    ],
    extras: [
      { id: 'x-bano-choc', name: 'Baño de chocolate', price: 500 },
      { id: 'x-grana', name: 'Granas de colores', price: 200 },
      { id: 'x-crema', name: 'Crema chantilly', price: 350 },
    ],
  },
  {
    id: 3,
    name: 'Vasito',
    description: 'Helado servido en vaso con cuchara',
    category: 'helados',
    image: '🍨',
    available: true,
    hasFlavors: true,
    formats: [
      { id: 'f3-1', name: '1 bocha', price: 1800, maxFlavors: 1 },
      { id: 'f3-2', name: '2 bochas', price: 2900, maxFlavors: 2 },
      { id: 'f3-3', name: '3 bochas', price: 3800, maxFlavors: 3 },
    ],
    extras: [
      { id: 'x-salsa-choc', name: 'Salsa de chocolate', price: 300 },
      { id: 'x-salsa-ddl', name: 'Salsa de dulce de leche', price: 300 },
      { id: 'x-crema', name: 'Crema chantilly', price: 350 },
      { id: 'x-grana', name: 'Granas de colores', price: 200 },
    ],
  },

  // ── Postres ──────────────────
  {
    id: 4,
    name: 'Sundae clásico',
    description: 'Helado con salsa, crema y topping crocante',
    category: 'postres',
    image: '🍨',
    available: true,
    hasFlavors: true,
    formats: [
      { id: 'f4-chico', name: 'Chico (2 bochas)', price: 3800, maxFlavors: 2 },
      { id: 'f4-grande', name: 'Grande (3 bochas)', price: 5200, maxFlavors: 3 },
    ],
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
    available: true,
    hasFlavors: true,
    formats: [
      { id: 'f5-clasico', name: 'Clásico', price: 5800, maxFlavors: 3 },
    ],
    extras: [
      { id: 'x-brownie', name: 'Brownie', price: 600 },
      { id: 'x-nueces', name: 'Nueces', price: 450 },
      { id: 'x-salsa-choc', name: 'Salsa extra de chocolate', price: 300 },
    ],
  },
  {
    id: 6,
    name: 'Copa de frutas',
    description: 'Helado con frutas frescas de estación',
    category: 'postres',
    image: '🍓',
    available: false,
    hasFlavors: true,
    formats: [
      { id: 'f6-copa', name: 'Copa', price: 4500, maxFlavors: 2 },
    ],
    extras: [
      { id: 'x-granola', name: 'Granola', price: 400 },
      { id: 'x-miel', name: 'Miel', price: 250 },
    ],
  },

  // ── Tortas heladas ───────────
  {
    id: 7,
    name: 'Torta helada clásica',
    description: 'Base de bizcochuelo, capas de helado y merengue',
    category: 'tortas',
    image: '🎂',
    available: true,
    hasFlavors: true,
    formats: [
      { id: 'f7-chica', name: 'Chica (6 porc.)', price: 12000, maxFlavors: 2 },
      { id: 'f7-grande', name: 'Grande (12 porc.)', price: 20000, maxFlavors: 3 },
    ],
    extras: [
      { id: 'x-merengue', name: 'Merengue italiano', price: 800 },
      { id: 'x-salsa-choc', name: 'Cobertura de chocolate', price: 600 },
      { id: 'x-deco', name: 'Decoración personalizada', price: 1000 },
    ],
  },
  {
    id: 8,
    name: 'Torta brownie helada',
    description: 'Base de brownie húmedo con helado y ganache',
    category: 'tortas',
    image: '🍫',
    available: true,
    hasFlavors: true,
    formats: [
      { id: 'f8-chica', name: 'Chica (6 porc.)', price: 14000, maxFlavors: 2 },
      { id: 'f8-grande', name: 'Grande (12 porc.)', price: 24000, maxFlavors: 3 },
    ],
    extras: [
      { id: 'x-nueces', name: 'Nueces', price: 600 },
      { id: 'x-deco', name: 'Decoración personalizada', price: 1000 },
    ],
  },

  // ── Bebidas ──────────────────
  {
    id: 9,
    name: 'Milkshake',
    description: 'Batido cremoso con helado artesanal',
    category: 'bebidas',
    image: '🥤',
    available: true,
    hasFlavors: true,
    formats: [
      { id: 'f9-med', name: 'Mediano (350ml)', price: 3200, maxFlavors: 1 },
      { id: 'f9-grande', name: 'Grande (500ml)', price: 4200, maxFlavors: 2 },
    ],
    extras: [
      { id: 'x-crema', name: 'Crema chantilly', price: 350 },
      { id: 'x-oreo', name: 'Oreo triturada', price: 400 },
    ],
  },
  {
    id: 10,
    name: 'Agua mineral',
    description: 'Con o sin gas',
    category: 'bebidas',
    image: '💧',
    available: true,
    hasFlavors: false,
    formats: [{ id: 'f10-500', name: '500ml', price: 600 }],
    extras: [],
  },
  {
    id: 11,
    name: 'Gaseosa',
    description: 'Coca-Cola, Sprite o Fanta',
    category: 'bebidas',
    image: '🥤',
    available: true,
    hasFlavors: false,
    formats: [
      { id: 'f11-lata', name: 'Lata 354ml', price: 800 },
      { id: 'f11-500', name: 'Botella 500ml', price: 1100 },
    ],
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
