// Mock data - simulates backend responses
// Replace with real API calls when backend is ready

export const mockMenu = [
  {
    id: 1,
    name: 'Hamburguesa Clásica',
    description: 'Carne, lechuga, tomate, queso cheddar',
    price: 2500,
    category: 'hamburguesas',
    image: null,
    available: true,
  },
  {
    id: 2,
    name: 'Hamburguesa Doble',
    description: 'Doble carne, doble queso, cebolla caramelizada',
    price: 3500,
    category: 'hamburguesas',
    image: null,
    available: true,
  },
  {
    id: 3,
    name: 'Pizza Muzzarella',
    description: 'Salsa de tomate, muzzarella, orégano',
    price: 3000,
    category: 'pizzas',
    image: null,
    available: true,
  },
  {
    id: 4,
    name: 'Pizza Napolitana',
    description: 'Salsa de tomate, muzzarella, tomate, ajo',
    price: 3200,
    category: 'pizzas',
    image: null,
    available: false,
  },
  {
    id: 5,
    name: 'Papas Fritas',
    description: 'Porción grande con salsa a elección',
    price: 1500,
    category: 'acompañamientos',
    image: null,
    available: true,
  },
  {
    id: 6,
    name: 'Gaseosa 500ml',
    description: 'Coca-Cola, Sprite o Fanta',
    price: 800,
    category: 'bebidas',
    image: null,
    available: true,
  },
]

export const mockCategories = [
  { id: 'hamburguesas', name: 'Hamburguesas' },
  { id: 'pizzas', name: 'Pizzas' },
  { id: 'acompañamientos', name: 'Acompañamientos' },
  { id: 'bebidas', name: 'Bebidas' },
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
