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
