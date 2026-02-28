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

### v0.2.0 - Acceso y Registro

- [ ] Modo invitado (pedido sin cuenta)
- [ ] Registro con email y contraseña
- [ ] Login con Google (OAuth)
- [ ] Recuperación de contraseña

### v0.3.0 - Gestión de Direcciones

- [ ] CRUD de direcciones de entrega
- [ ] Alias, comentarios y dirección activa
- [ ] Validación de cobertura

### v0.4.0 - Catálogo y Armado del Pedido

- [ ] Listado de productos con formatos
- [ ] Selección de sabores con límite por formato
- [ ] Adicionales con costo extra
- [ ] Comentarios por producto y por pedido

### v0.5.0 - Costos de Delivery

- [ ] Cálculo de costo de envío por distancia
- [ ] Visualización del costo antes de confirmar
- [ ] Bloqueo si dirección fuera de cobertura

### v0.6.0 - Programa de Fidelización (Puntos)

- [ ] Acumulación y visualización de puntos
- [ ] Canje de puntos como descuento
- [ ] Códigos de descuento / cupones

### v0.7.0 - Medios de Pago

- [ ] Mercado Pago (API oficial)
- [ ] Transferencia bancaria
- [ ] Tarjeta crédito/débito
- [ ] Efectivo al delivery

### v0.8.0 - Panel del Usuario

- [ ] Estado en tiempo real del pedido activo
- [ ] Historial de pedidos
- [ ] Saldo de puntos y vencimiento
- [ ] Gestión de direcciones y datos de cuenta

### Futuro

- [ ] Integración con backend real (Python)
- [ ] Notificaciones en tiempo real
- [ ] Testing (Vitest + React Testing Library)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Diseño responsive y mejoras de UX
