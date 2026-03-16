# Changelog - Pedidos Project

Registro de funcionalidades implementadas y planificadas.

## [0.14.3] - 2026-03-16

### Mejorado — Columna productos en listas

- **Pills por producto**: la columna "Productos" ahora muestra cada producto como un badge/pill individual en vez de texto plano separado por comas

## [0.14.2] - 2026-03-16

### Mejorado — Productos vinculados en listas de opciones

- **Columna "Productos" en tabla**: muestra los nombres de los productos que usan cada lista
- **Banner informativo en detalle**: al entrar a una lista usada por productos, se muestra un aviso azul con los nombres y la advertencia de que los cambios impactan a todos
- **Handler `adminGetFlavorSources`**: ahora incluye `usedBy` con id y nombre de productos vinculados (directos y combo items)
- **Protección de eliminación**: no se puede eliminar una lista que esté en uso por algún producto

## [0.14.1] - 2026-03-16

### Mejorado — Listas de opciones

- **Eliminado campo "Descripción"** de las listas de opciones: removido de tabla, dialogs de crear/editar, y vista de detalle

## [0.14.0] - 2026-03-16

### Implementado — Gestión de listas de opciones (admin)

- **AdminListasPage**: nueva página independiente para administrar listas de opciones (sabores, gustos, etc.)
  - Vista de tabla con nombre, descripción, cantidad de opciones y flag de precio por item
  - Crear y editar listas mediante dialog (nombre, descripción, checkbox "Precio individual por item")
  - Eliminar listas vacías con confirmación
  - Vista de detalle: listado completo de opciones con agregar/eliminar inline
  - Soporte de precio opcional por opción cuando la lista tiene `hasItemPrices`
- **Sidebar admin**: nuevo ítem "Listas de opciones" con ícono de lista
- **Ruta**: `/admin/listas`
- **Formulario de producto simplificado**: se removió el CRUD inline de listas; queda solo el selector + link a la página de Listas + gestión inline de opciones
- **CLAUDE.md**: agregada regla de workflow (commit + push con cada cambio)

## [0.13.1] - 2026-03-16

### Mejorado — UX del listado y formulario de productos

- **Indicadores en lista**: badges compactos debajo del nombre muestran cantidad de formatos (violeta) y extras (ámbar) de cada producto
- **Detalle expandible**: botón chevron en cada fila despliega lista inline de formatos con precios y extras con recargos
- **Precio por item en lista**: productos con `unitPricing` muestran "Precio por item" en vez de $0
- **Precio según formato en lista**: productos con múltiples formatos muestran "Según formato" en vez del precio del primer formato
- **Vista previa móvil**: en pantallas menores a `xl`, la tarjeta de preview aparece al final del formulario (antes solo se veía en desktop)
- **Badge "Solo mostrador"**: renombrado de "Mostrador" a "Solo mostrador" para mayor claridad
- **Datos mock enriquecidos**: productos con combinaciones de `paused`, `counterOnly` y múltiples formatos para cubrir todos los estados posibles
  - Banana Split → pausado
  - Sundae clásico → solo mostrador
  - Milkshake grande → pausado + solo mostrador
  - Pizza muzzarella → 2 formatos (Porción/Entera) + 2 extras

## [0.13.0] - 2026-03-16

### Implementado — CRUD de productos (admin) + componente compartido

- **AdminProductosPage**: nueva página de gestión de productos para el panel admin
  - Listado con nombre, categoría, precio, tipo, estado y acciones
  - Formulario de creación/edición con 2 arquetipos: **simple** y **con opciones a elegir** (unifica el antiguo "slots" y "porciones")
  - Productos pueden usar precio único o expandir a variantes con formatos (para cualquier arquetipo)
  - Gestión inline de sabores/opciones (agregar con precio opcional, eliminar) por fuente
  - CRUD de fuentes de opciones (crear, renombrar, eliminar) con flag **"Precio individual por item"**
  - El flag `hasItemPrices` de la lista determina si el precio va en cada opción (ej: empanadas) o en el formato (ej: helado)
  - Badge de estado: `● Activo` (verde) / `● Pausado` (gris) + botón de acción separado (⏸/▶)
  - Checkboxes independientes: **Pausado** (no aparece en menú) y **Solo mostrador** (no aparece online)
  - Vista previa de tarjeta (columna lateral, sticky) con "Desde $X" para multi-formato
  - Vista previa de detalle (dialog) usando el componente compartido
- **ProductDetailView**: nuevo componente compartido (`src/components/catalog/ProductDetailView.jsx`)
  - Unifica vista de detalle entre página del cliente y preview del admin
  - Toda la lógica interactiva (formatos, sabores en 3 modos, combos, extras, comentario, agregar al carrito)
  - Prop `preview` para deshabilitar agregar al carrito
- **ProductDetailPage refactorizado**: reducido de ~660 a ~95 líneas, delega toda la UI a `ProductDetailView`
- **ProductCard mejorado**: productos simples muestran controles inline; multi-formato muestra "Desde $X" con precio mínimo
- **Inputs numéricos**: eliminados spinners nativos (CSS), selección automática al enfocar
- **Mock handlers**: `adminGetAllProducts`, `adminGetCategories`, `adminCreateProduct`, `adminUpdateProduct`, `adminDeleteProduct`, `adminToggleProduct`, `getFlavors` (por fuente), `adminAddFlavor`, `adminDeleteFlavor`, CRUD de fuentes de sabores con `hasItemPrices`

## [0.12.4] - 2026-03-14

### Implementado — Drag & drop en kanban

- **Drag & drop**: las tarjetas del kanban se pueden arrastrar entre columnas para cambiar el estado del pedido
- **Librería**: `@hello-pangea/dnd` (fork mantenido de react-beautiful-dnd)
- **Feedback visual**: columna destino resaltada en azul al arrastrar, tarjeta con rotación y sombra
- **Actualización optimista**: el estado cambia inmediatamente con rollback automático si falla
- **Handler `adminSetOrderStatus`**: nuevo mock handler para establecer estado arbitrario

## [0.12.3] - 2026-03-14

### Implementado — Cancelación con motivo e imagen

- **Diálogo de cancelación**: al cancelar un pedido se abre un modal que solicita motivo obligatorio y permite adjuntar una imagen (opcional)
- **Componente Dialog (shadcn/ui)**: nuevo componente `dialog.jsx` basado en Radix UI Dialog
- **Datos de cancelación**: el pedido almacena `cancelReason` e `cancelImageUrl`
- **Visualización**: las cards de pedidos cancelados muestran el motivo y la imagen adjunta

## [0.12.2] - 2026-03-10

### Mejorado — Kanban y alertas de pedidos

- **Kanban 1 col/estado**: 5 columnas individuales (Pendiente, En preparación, Listo, En camino, Entregado). Cancelados en sección colapsable aparte
- **Cards compactas**: menor ancho mínimo (150px), texto reducido, layout más denso
- **Ver más/menos**: las columnas muestran máx. 4 cards, con botón expandir/colapsar
- **Revertir cancelación y entrega**: botón Undo en pedidos cancelados y entregados (tabla, kanban y sección cancelados)
- **Alertas de nuevo pedido**: polling cada 10s, sonido audible (Web Audio API) y destaque visual (pulse verde) en cards/filas nuevas durante 8s
- **Mute/Sonido**: toggle para silenciar alertas sonoras
- **Simular pedido**: botón "Simular" para testing que genera pedidos aleatorios

## [0.12.1] - 2026-03-09

### Corregido

- **Redirección admin al login**: GuestRoute ahora redirige a `/admin` cuando el usuario es admin, evitando que el redirect a `/` gane la carrera con `navigate('/admin')`

## [0.12.0] - 2026-03-09

### Implementado — Panel Admin (Fase 1a)

- **Layout admin** con sidebar de navegación, tema claro/oscuro, botón de logout
- **Autenticación admin**: nuevo rol `admin` en el sistema de auth. Mock user: `admin@ainara.com` / `admin`
- **AdminRoute** guard: protege rutas `/admin/*`, redirige a login si no es admin
- **Pedidos — Vista listado**: tabla con columnas ID, fecha, cliente/dirección, tipo de entrega, medio de pago, importe, estado, estado de pago, y acciones
- **Pedidos — Vista Kanban**: 3 columnas (Entrantes / En proceso / Finalizados) con tarjetas de pedido
- **Acciones por pedido**: avanzar estado, retroceder estado, cancelar
- **Badges de estado** con colores diferenciados: pendiente (amarillo), en preparación (azul), listo (verde), en camino (violeta), entregado (gris), cancelado (rojo)
- **Highlight visual** en filas de pedidos pendientes (fondo amarillo sutil)
- **Mock data**: 4 pedidos activos adicionales para el admin (distintos estados y clientes)
- **Redirect automático**: login con admin redirige a `/admin`, login normal a la ruta anterior
- Rutas: `/admin` → redirige a `/admin/pedidos`

## [0.11.5] - 2026-03-09

### Mejorado

- **Botones de volver** más destacados: cambiados de `ghost` a `outline` en ProductDetailPage, CartPage y CheckoutPage

## [0.11.4] - 2026-03-09

### Implementado

- **Barra flotante de carrito**: barra fija en la parte inferior que aparece cuando hay ítems en el carrito, muestra cantidad de ítems + subtotal + botón "Ver carrito"
- Se oculta automáticamente en `/cart`, `/checkout` y `/order-confirmation`
- Padding inferior en el `<main>` para evitar que la barra tape contenido
- Diseño responsive: funciona en mobile y desktop

## [0.11.3] - 2026-03-08

### Cambiado

- **Pizzas individuales**: cada pizza es un producto propio sin selección de gustos — Muzzarella ($5.500), Napolitana ($5.800), Fugazzeta ($6.000)
- **Combo Pizza + 2 Gaseosas** ($6.500): pizza muzzarella + 2 latas de gaseosa a elección
- Eliminado `mockPizzaFlavors` (ya no se necesita)

## [0.11.2] - 2026-03-08

### Implementado

- **Categoría Pizzas** (🍕) con producto Pizza casera (id 22) — selección de gusto (Muzzarella, Napolitana, Fugazzeta, Jamón y morrones, Calabresa, Roquefort)
- **Combo Pizza + Gaseosa** ($5.800): pizza a elección + gaseosa a elección (Coca-Cola, Sprite, Fanta)
- Nuevos flavor sources: `pizzas` y `gaseosas` en handlers

## [0.11.1] - 2026-03-08

### Mejorado

- **Combos primero**: los combos siempre aparecen en las primeras posiciones del catálogo
- **Destaque visual**: las cards de combos tienen borde ámbar, ring y badge "COMBO"

## [0.11.0] - 2026-03-08

### Implementado

- **Combos**: nuevo tipo de producto que combina ítems existentes a precio promocional
- **Combo 2× 1/4 kg** ($6.000 vs $7.000 por separado): 2 helados de 1/4 kg, cada uno con su propia selección de sabores
- **Combo Docena de empanadas** ($8.400): 12 empanadas con selección de gustos y emojis
- **Categoría 🎁 Combos** en el filtro del catálogo
- **Selección de sabores por ítem del combo**: cada componente tiene su propio selector con contador +/- (X de Y) e indicador verde al completar
- **Carrito muestra detalle del combo**: cada ítem con sus sabores seleccionados
- **Normalización de pedidos**: los combos se serializan como "Ítem1: sabores | Ítem2: sabores" en el historial

---

## [0.10.3] - 2026-03-08

### Mejorado

- **Helados con selector de cantidad por sabor**: los helados, postres y milkshakes ahora usan el mismo selector +/- por sabor que las empanadas. Ej: Helado 1 kg → Dulce de leche ×3, Chocolate ×1, Frutilla ×1
- **`flavorMode: 'quantity'` en todos los productos con sabor**: helados (1kg/1/2kg/1/4kg), sundae, banana split, milkshakes mediano y grande
- **Label diferenciado**: "Sabores" para helados/postres/bebidas, "Gustos" para empanadas

---

## [0.10.2] - 2026-03-08

### Mejorado

- **Empanadas con precio por gusto**: cada gusto tiene su propio precio (Carne $900, Pollo $850, etc.) y emoji representativo
- **Cantidad libre sin tope**: el usuario agrega +/- de cada gusto directamente, sin necesidad de elegir un total primero
- **Precio dinámico**: el total se calcula en tiempo real como suma de (cantidad × precio unitario) de cada gusto seleccionado
- **Filas con imagen**: cada gusto muestra su emoji, nombre, precio unitario y controles +/-
- **ProductCard**: los productos con `unitPricing` muestran "Armá tu pedido" en lugar de $0
- **Modo quantity sin pricing preservado**: los productos con `unitCount` fijo siguen funcionando igual

---

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

## Roadmap — Panel de Administración

> Detalle completo en [`docs/admin-roadmap.md`](docs/admin-roadmap.md)

### v1.0.0 — Fase 1: MVP Admin

- [x] Layout admin (sidebar + contenido) con autenticación de rol admin *(v0.12.0)*
- [x] **Pedidos — Listado**: tabla con ID, fecha, cliente, tipo entrega, medio de pago, importe, estado, repartidor, acciones *(v0.12.0)*
- [x] **Pedidos — Kanban**: 3 columnas (Entrantes / En proceso / Finalizados) *(v0.12.0)*
- [x] **Pedidos — Alertas**: sonido y destaque visual al recibir pedido nuevo *(v0.12.2 — parcial: polling, no real-time)*
- [x] **Pedidos — Acciones básicas**: avanzar/retroceder estado, cancelar *(v0.12.0)*
- [ ] **Productos**: CRUD con los 3 arquetipos (Simple, Slots Fijos, Porciones y Sabores)
- [ ] **Sabores**: lista maestra global con toggle ON/OFF
- [ ] **Configuración**: horarios de apertura, apagado de emergencia, mensaje de ausencia

### v1.1.0 — Fase 2: Operación completa

- [ ] **Pedidos — Carga manual**: WhatsApp, mostrador, delivery
- [ ] **Pedidos — Comanda**: impresión para pegar en bolsa
- [ ] **Pedidos — Edición**: modificar sabores, dirección, extras
- [ ] **Pedidos — Especiales**: pedido sin costo (reposición), forzar fuera de zona
- [ ] **Pedidos — Delivery**: estados paralelos (buscando repartidor → retirado → entregado)
- [ ] **Zonas**: configuración por radio y polígono, demora estimada, apagar zona
- [ ] **Delivery**: lista de repartidores, asignación
- [ ] **Configuración**: pagos (efectivo on/off, compra mínima, precios diferenciados)

### v1.2.0 — Fase 3: Clientes y fidelización

- [ ] **Clientes**: listado, clasificación VIP, notas privadas, historial de pedidos
- [ ] **Puntos**: configuración de acumulación y canje desde admin
- [ ] **Puntos Usados**: historial de canjes
- [ ] **Promos**: CRUD de promos, vinculación a productos o al carrito

### v1.3.0 — Fase 4: Facturación y analítica

- [ ] **Facturación**: acumulados por fecha/medio de pago, caja chica, exportación CSV/Excel
- [ ] **Informe**: origen de clientes (UTM), encuesta post-pedido
- [ ] **Rentabilidad**: costos estimados, análisis TC y comisiones

### v1.4.0 — Fase 5: Integraciones

- [ ] Integración Rapiboy (GPS tracking de delivery)
- [ ] Gift cards / vouchers
- [ ] Cash flow y estado de resultados

### Futuro (sin versión asignada)

- [ ] Integración con backend real (Python)
- [ ] Notificaciones en tiempo real
- [ ] Testing (Vitest + React Testing Library)
- [ ] CI/CD pipeline (GitHub Actions)
