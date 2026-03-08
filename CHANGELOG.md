# Changelog - Pedidos Project

Registro de funcionalidades implementadas y planificadas.

## [0.10.1] - 2026-03-08

### Mejorado

- **Empanadas con cantidad libre**: reemplazados los 2 productos fijos (docena / media docena) por un único producto "Empanadas" con selector de cantidad libre — el usuario elige cuántas quiere con +/−, ve precio unitario × cantidad, y luego distribuye gustos
- **`unitPricing`**: nuevo flag en producto; el precio se calcula por unidad y la sección de formato se oculta automáticamente

---

## [0.10.0] - 2026-03-08

### Implementado

- **Empanadas en el menú**: docena ($9.600) y media docena ($5.400) con selección de gustos por cantidad
- **Modo de selección por cantidad (`flavorMode: 'quantity'`)**: nuevo modo donde el usuario elige cuántas unidades de cada gusto quiere (ej: 4 Carne + 4 Pollo + 4 J&Q = 12), con controles +/- por gusto y contador de unidades restantes
- **Gustos de empanadas**: Carne, Pollo, Jamón y queso, Humita, Caprese, Verdura
- **Categoría Empanadas 🥟**: nueva categoría en el filtro del catálogo
- **`getFlavors(source)` parametrizado**: el handler acepta source opcional para devolver la lista de gustos correcta según el producto
- **Carrito muestra cantidades por gusto**: ej. "3 Carne, 3 Pollo, 6 Jamón y queso"

---

## [0.9.1] - 2026-03-08

### Corregido

- **Tortas eliminadas**: se removieron las 4 tortas heladas del menú
- **Filtro de categorías restaurado**: botones Todos / Helados / Postres / Bebidas en CatalogPage

---

## [0.9.0] - 2026-03-08

### Implementado

- **Catálogo plano**: cada producto es un SKU individual visible de un vistazo, sin navegar categorías
- **Helados por kilo**: separados en 3 productos (1 kg, 1/2 kg, 1/4 kg) con sabores y extras
- **Bebidas individuales**: Coca-Cola, Sprite, Fanta, Agua sin gas, Agua con gas (en lugar de "Gaseosa")
- **Milkshakes**: mediano y grande como productos separados
- **Tortas**: cada tamaño como producto independiente (clásica 6/12 porc., brownie 6/12 porc.)
- **Cucurucho eliminado**: no apto para delivery
- **CatalogPage simplificado**: sin filtro de categorías, grilla directa de productos
- **ProductCard**: precio directo (sin "Desde")

---

## [0.8.10] - 2026-03-05

### Mejorado

- **Barra de progreso con paso actual en amarillo**: el estado actual se muestra en ámbar (barra y texto), los anteriores en verde, los pendientes en gris

---

## [0.8.9] - 2026-03-05

### Corregido

- **Barra de progreso mobile**: labels ultra cortos para evitar solapamiento (Pend. · Conf. · Prep. · Listo · Envío · Entreg.)

---

## [0.8.8] - 2026-03-05

### Mejorado

- **Enlace al panel con nombre de usuario**: reemplazado "Mis pedidos" por el nombre del usuario con ícono `UserCircle`, enlaza al panel
- **Aspecto tappeable en mobile**: nombre del usuario en MobileUserBar con estilo pill (`rounded-full`, fondo gris, `active:` feedback)
- **Header desktop**: nombre como botón ghost con `font-semibold`

---

## [0.8.7] - 2026-03-05

### Corregido

- **Tabs del panel no scrolleables**: eliminado scroll horizontal, las tabs se ajustan al ancho disponible

---

## [0.8.6] - 2026-03-05

### Implementado

- **Múltiples pedidos activos**: el panel y la home ahora muestran todos los pedidos en curso, no solo uno
- **Aviso de pago pendiente**: los pedidos con efectivo o transferencia muestran cartel "Pendiente de pago — el pedido avanzará cuando se confirme el pago"

### Corregido

- **Progresión detenida para pagos pendientes**: los pedidos con pago en efectivo o transferencia ya no avanzan de estado hasta que se confirma el pago
- `processPayment` arranca la progresión automática cuando el pago se confirma

---

## [0.8.5] - 2026-03-05

### Corregido

- **Crash al volver a Home tras confirmar pedido**: los items del carrito (format como objeto, flavors como array) se normalizan a strings en `createOrder` para que el panel los renderice sin error

---

## [0.8.4] - 2026-03-05

### Implementado

- **Persistencia mock de pedidos**: `createOrder` ahora guarda el pedido en memoria para que aparezca en panel e historial
- **Progresión automática de estado**: cada 15 s el pedido avanza (pendiente → confirmado → preparación → listo → en camino → entregado)
- **Polling en ActiveOrderSection**: refresca cada 10 s para mostrar el avance en tiempo real
- `processPayment` actualiza el `paymentStatus` del pedido almacenado
- `CheckoutPage` pasa `userId` a `createOrder`

### Corregido

- **Layout barra de progreso**: label "En preparación" acortado a "Preparación", agregado `truncate` y `min-w-0` para evitar desborde

---

## [0.8.3] - 2026-03-05

### Corregido

- **Pedido activo mock eliminado**: se quitó el pedido en curso (id 2048) de los datos mock para que no aparezca sin haber hecho un pedido real

---

## [0.8.2] - 2026-03-05

### Mejorado

- **Banner invitado mejorado**: texto actualizado a "Creá una cuenta para ver el estado de tus pedidos, acumular puntos y guardar direcciones"
- **Pedido activo en Home**: usuarios registrados ven su pedido en curso directamente en la página principal
- **"Mi panel" → "Mis pedidos"**: renombrado y resaltado con `variant="outline"` y `font-semibold` en header y barra mobile

---

## [0.8.1] - 2026-03-05

### Mejorado

- **MobileUserBar solo para registrados**: la barra inferior ya no se muestra para invitados
- **Banner invitado en Home**: los invitados ven un aviso para crear cuenta en la página principal
- **Botón explícito al panel**: reemplazado el enlace con nombre por un botón "Mi panel" con ícono

---

## [0.8.0] - 2026-03-04

### Implementado

- **Panel del usuario** — nueva página `/panel` con 4 secciones en tabs
- **Pedido activo**: estado en tiempo real con barra de progreso visual (pendiente → entregado)
- **Historial de pedidos**: lista de pedidos anteriores con detalle expandible (items, descuentos, envío, pago)
- **Saldo de puntos**: balance actual, historial de movimientos con fecha de vencimiento
- **Mi cuenta**: edición de nombre y email, accesos rápidos a direcciones y cambio de contraseña
- **Mock orders**: 4 pedidos de ejemplo para el usuario mock (1 activo en camino, 3 entregados)
- **Handlers**: `getUserOrders`, `getActiveOrder`, `updateUserProfile`
- **Navegación**: nombre de usuario en header (md+) enlaza al panel, saludo en MobileUserBar enlaza al panel
- **Ruta protegida**: solo usuarios registrados acceden al panel

---

## [0.7.4] - 2026-03-04

### Mejorado

- **Puntos pendientes visibles**: la página de confirmación muestra la cantidad de puntos que se acreditarán cuando se confirme el pago

---

## [0.7.3] - 2026-03-04

### Corregido

- **Puntos diferidos para pagos pendientes**: en pagos con efectivo o transferencia, los puntos se acreditan recién cuando se confirma el pago
- Página de confirmación muestra aviso "Los puntos se acreditarán cuando se confirme el pago" para estos métodos

---

## [0.7.2] - 2026-03-04

### Corregido

- **Efectivo disponible para retiro en local**: se eliminó la restricción que limitaba el pago en efectivo solo a delivery

---

## [0.7.1] - 2026-03-04

### Corregido

- **Transferencia bancaria como pendiente de pago**: el pago por transferencia ahora queda con estado "pendiente de pago" igual que efectivo

---

## [0.7.0] - 2026-03-05

### Implementado

- **Medios de pago** — selección de método de pago en el checkout
- **Mercado Pago**: pago online simulado (mock)
- **Transferencia bancaria**: muestra datos bancarios (CBU, alias, titular, CUIT) con botón de copiar
- **Tarjeta crédito/débito**: pago online simulado (mock)
- **Efectivo al delivery**: solo disponible para delivery, pedido queda como "pendiente de pago"
- **PaymentMethodSelector**: selector visual con íconos, info contextual por método
- **OrderConfirmationPage**: página de confirmación post-pago con resumen, estado, puntos ganados
- **Flujo completo**: confirmar pedido → procesar pago → canjear puntos → acumular puntos → limpiar carrito → confirmación
- **Mock handlers**: `getPaymentMethods` (filtra por tipo de pedido) y `processPayment` (simula procesamiento)

---

## [0.6.1] - 2026-03-04

### Mejorado

- **Header mobile optimizado**: solo iconos esenciales en pantallas chicas, textos en sm+
- **Marca responsive**: "Ainara" en mobile, "Ainara Helados" en sm+
- **MobileUserBar**: barra contextual debajo del header (solo mobile) con saludo, puntos y acceso a Direcciones
- **Botón logout** en rojo para distinción visual
- **Botón login** en verde con fondo semitransparente e ícono `CircleUserRound`
- **Nombre de usuario** visible solo en md+ para ahorrar espacio

---

## [0.6.0] - 2026-03-01

### Implementado

- **Programa de Fidelización** — sistema de puntos para usuarios registrados
- **Acumulación de puntos**: 1 peso = 1 punto (excluye costo de envío)
- **Vencimiento**: puntos expiran a los 3 meses desde la acreditación
- **Canje de puntos** como descuento en el checkout (1 punto = $1)
- **Cupones de descuento** con validación automática (porcentaje o monto fijo)
- **CouponInput**: ingreso y validación de códigos de descuento con feedback de error
- **RedeemPoints**: selector de puntos a canjear con botón "Usar máximo"
- **PointsBadge**: indicador de saldo de puntos en el header (estrella dorada)
- **LoyaltyContext**: contexto global con saldo, historial, canje y acumulación
- **Mock data**: historial de puntos, 4 cupones de prueba (HELADOGRATIS, VERANO20, AINARA10, EXPIRADO)
- **Desglose en checkout**: subtotal − puntos − cupón + envío = total
- Descuentos solo para usuarios registrados (invitados ven cupones pero no puntos)

---

## [0.5.1] - 2026-03-01

### Implementado

- **Opción de login para invitados en checkout**: los usuarios guest ven botones "Iniciar sesión" y "Crear cuenta" en el resumen del pedido, con redirect de vuelta al checkout

---

## [0.5.0] - 2026-03-01

### Implementado

- **Toggle delivery / retiro en local** en la página de checkout
- **Selector de dirección** para usuarios registrados, con indicador de cobertura
- **Formulario de dirección inline** para invitados (calle + ciudad)
- **Cálculo automático de costo de envío** por distancia (Haversine), con zonas configurables (Cercana, Media, Lejana)
- **Zonas de delivery mock** con 3 tramos: hasta 1.5 km ($500), hasta 3 km ($800), hasta 5 km ($1200)
- **Bloqueo de pedido** si la dirección está fuera de cobertura (alerta visual + botón deshabilitado)
- **Desglose de costos** en resumen: subtotal + envío + total
- **Handler `calcDeliveryCost`** que retorna zona, distancia y costo
- **Estado derivado** para loading de costo (sin setState sincrónico en effects)

---

## [0.4.1] - 2026-03-01

### Implementado

- **Catálogo de heladería**: datos mock adaptados con 16 sabores, helados por kilo/cucurucho/vasito, postres, tortas heladas, milkshakes y bebidas
- **Selección de sabores por formato**: cada formato define `maxFlavors`, el usuario elige sabores con límite visual
- **Sabores flexibles**: se permite elegir entre 1 y `maxFlavors` sabores (no obliga a completar el máximo)
- **Sabores en carrito y checkout**: se muestran los sabores elegidos en cada línea del pedido
- **Chips de sabores**: layout tipo chip (`flex-wrap`, `rounded-full`) que se adapta al ancho sin truncar nombres largos
- **Branding**: nombre del local "Ainara Helados" en header y homepage
- **ngrok**: `server.allowedHosts` configurado para dominios `*.ngrok-free.app`

---

## [0.4.0] - 2026-03-01

### Implementado

- **Catálogo de productos** con grilla responsive y filtro por categoría (tabs con íconos)
- **Detalle de producto** con selección de formato (tamaño), extras opcionales con costo, comentario libre
- **Carrito de compras** con agregar, eliminar, modificar cantidad, comentario general del pedido
- **CartContext** con estado global: items, itemCount, subtotal, clearCart
- **Checkout con login gate**: usuarios no autenticados ven opciones de ingreso; al autenticarse se redirigen de vuelta al checkout
- **Ícono de carrito en header** con badge de cantidad de items, visible para todos
- **Link "Menú" en header** accesible para visitantes y logueados
- **HomePage** actualizada con CTA "Ver menú"
- **Datos mock enriquecidos**: productos con array de formatos (nombre, precio) y extras (nombre, precio)
- **GuestRoute mejorado**: preserva `location.state` al redirigir (soporte para flujo checkout → login → checkout)
- **Redirección post-auth**: LoginPage, RegisterPage y GuestPage respetan `state.from` para volver a la ruta de origen

---

## [0.3.1] - 2026-03-01

### Implementado

- **Campos de dirección extendidos**: piso, departamento y barrio como campos separados
- **Alias y ciudad obligatorios** con validación en formulario
- **Etiquetas "(opcional)"** en campos no obligatorios (piso, depto, barrio, comentario)
- **Convención de formularios**: campos opcionales marcados, obligatorios sin asterisco

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

## [0.2.1] - 2026-03-01

### Implementado

- **Login con Google** (OAuth mock) con botón e ícono SVG
- **Modo oscuro** con toggle sol/luna en header, persistido en localStorage
- **Detección automática** del tema del sistema (prefers-color-scheme)
- **Clases `dark:`** en todos los componentes UI y páginas
- **GuestRoute** para redirigir usuarios logueados fuera de login/register

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

### Futuro

- [ ] Integración con backend real (Python)
- [ ] Notificaciones en tiempo real
- [ ] Testing (Vitest + React Testing Library)
- [ ] CI/CD pipeline (GitHub Actions)
