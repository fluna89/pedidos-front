# Changelog - Pedidos Project

Registro de funcionalidades implementadas y planificadas.

## [0.1.0] - 2026-02-28

### Implementado

- **Setup inicial del proyecto** con Vite + React
- **Gestión de versión de Node** con fnm (`.node-version`)
- **ESLint + Prettier** configurados e integrados
- **Estructura base de carpetas**: components, pages, hooks, context, services, mocks, utils
- **Capa de servicios API** (`src/services/api.js`) preparada para conectar con backend Python
- **Mock de datos** con menú de ejemplo, categorías y estados de pedido
- **Mock handlers** con delay simulado para desarrollo sin backend
- **Documentación SETUP.md** para onboarding del equipo

---

## Roadmap (funcionalidades futuras)

### v0.2.0 - Menú y navegación

- [ ] Listado de productos del menú
- [ ] Filtrado por categoría
- [ ] React Router para navegación entre páginas
- [ ] Página de detalle de producto

### v0.3.0 - Carrito de compras

- [ ] Context de carrito (agregar, quitar, modificar cantidad)
- [ ] Vista del carrito
- [ ] Resumen de pedido con total

### v0.4.0 - Flujo de pedido

- [ ] Formulario de datos del cliente
- [ ] Selección de tipo de entrega (delivery / retiro)
- [ ] Confirmación de pedido
- [ ] Pantalla de estado del pedido

### v0.5.0 - Mejoras de UX

- [ ] Loading states y manejo de errores
- [ ] Diseño responsive
- [ ] Animaciones y transiciones

### Futuro

- [ ] Integración con backend real (Python)
- [ ] Autenticación de usuarios
- [ ] Historial de pedidos
- [ ] Notificaciones en tiempo real
- [ ] Testing (Vitest + React Testing Library)
- [ ] CI/CD pipeline (GitHub Actions)
