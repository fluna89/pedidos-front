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

## [0.2.0] - 2026-02-28

### Implementado

- **Tailwind CSS v4** + **shadcn/ui** (Button, Input, Label, Card)
- **React Router** con layout y navegación entre páginas
- **Layout mobile first** con header responsive
- **Login** con email y contraseña (mock)
- **Registro** con validación de contraseñas (mock)
- **Recuperación de contraseña** (mock)
- **Modo invitado** con datos mínimos (nombre, teléfono, email opcional)
- **Auth context** con persistencia en localStorage
- **Alias `@/`** para imports absolutos

---

## [0.2.1] - 2026-03-01

### Implementado

- **Login con Google** (OAuth mock) con botón e ícono SVG
- **Modo oscuro** con toggle sol/luna en header, persistido en localStorage
- **Detección automática** del tema del sistema (prefers-color-scheme)
- **Clases `dark:`** en todos los componentes UI y páginas
- **GuestRoute** para redirigir usuarios logueados fuera de login/register

---

## [0.3.0] - 2026-03-01

### Implementado

- **CRUD de direcciones** con agregar, editar y eliminar
- **Alias y comentarios** por dirección (ej: 'Casa', 'Piso 3 timbre B')
- **Dirección activa** seleccionable para el pedido, persistida en localStorage
- **Validación de cobertura** con fórmula Haversine (zona de 5 km)
- **Indicador visual** de cobertura en cada dirección (verde/rojo + alerta)
- **Ruta protegida** `/addresses` solo para usuarios registrados (no guests)
- **Link en header** con ícono de mapa, visible para usuarios logueados
- **AddressContext** con estado global de direcciones y dirección activa
- **Componente Textarea** UI reutilizable con dark mode
- **ProtectedRoute** para restringir acceso a rutas autenticadas

---

## [0.3.1] - 2026-03-01

### Implementado

- **Campos de dirección extendidos**: piso, departamento y barrio como campos separados
- **Alias y ciudad obligatorios** con validación en formulario
- **Etiquetas "(opcional)"** en campos no obligatorios (piso, depto, barrio, comentario)
- **Convención de formularios**: campos opcionales marcados, obligatorios sin asterisco

---

## Roadmap (funcionalidades futuras)

### v0.2.1 - Login con Google + Modo oscuro

- [x] Login con Google (OAuth mock)
- [x] Modo oscuro con toggle (persistido en localStorage)

### v0.3.0 - Gestión de Direcciones

- [x] CRUD de direcciones de entrega
- [x] Alias, comentarios y dirección activa
- [x] Validación de cobertura

### v0.3.1 - Campos de dirección extendidos

- [x] Piso, departamento y barrio como campos separados
- [x] Alias y ciudad obligatorios
- [x] Etiquetas de campos opcionales

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
