# Requerimientos Funcionales — Módulo Usuario (App/Web)

> Fuente: Documento de requerimientos, Sección 2

## Criterios generales de diseño

- **Mobile first** para las vistas de cliente e invitado (la mayoría de los usuarios pedirán desde el celular)
- **Desktop oriented** para el panel de administración (operación desde navegador de escritorio)
- Diseño **responsive**: todas las vistas deben funcionar correctamente en ambos formatos

## 2.1 Acceso y Registro

| Funcionalidad                   | Detalle                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Modo invitado                   | El usuario puede realizar un pedido sin crear cuenta. Solo se solicitan datos mínimos (nombre, teléfono/mail, dirección). |
| Registro con email y contraseña | Creación de cuenta con email y contraseña. Verificación por email.                                                        |
| Login con Google                | Autenticación OAuth con cuenta Google.                                                                                    |
| Recuperación de contraseña      | Flujo estándar de recuperación vía email.                                                                                 |

## 2.2 Gestión de Direcciones

El usuario registrado puede gestionar múltiples direcciones de entrega con las siguientes características:

- Agregar, editar y eliminar direcciones
- Asignar un alias o etiqueta a cada dirección (ej: 'Casa', 'Trabajo')
- Agregar comentarios por dirección (ej: 'Piso 3, timbre B', 'Portón verde')
- Seleccionar la dirección activa al momento de armar el pedido
- Validación de cobertura: si la dirección cae fuera de la zona de delivery, se informa al usuario

## 2.3 Catálogo y Armado del Pedido

El catálogo presenta los productos disponibles para delivery. Los productos marcados como 'solo mostrador' no se muestran en la app de pedidos online.

| Elemento                        | Descripción                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Formatos disponibles (delivery) | ½ kg, 1 kg, 2 kg, tarrina, pote, etc. (configurables desde admin).                                           |
| Formatos solo mostrador         | Cucurucho, vasito y otros. Ocultos en la app de delivery.                                                    |
| Selección de sabores            | Cada formato tiene un límite de sabores configurado: 3 o 4 según el formato.                                 |
| Sabores sin stock               | Los sabores deshabilitados por el admin no aparecen disponibles para selección.                              |
| Adicionales                     | Categorías de adicionales con costo extra (ej: cobertura, salsa, mix-ins). Precio configurado por adicional. |
| Comentario por producto         | El cliente puede dejar una nota libre por ítem del pedido.                                                   |
| Comentario general del pedido   | Campo de observaciones general para el pedido completo.                                                      |

## 2.4 Costos de Delivery

El costo de envío se calcula automáticamente en función de la distancia entre el local y la dirección de entrega, definida en kilómetros. La arquitectura debe soportar la evolución futura hacia zonas definidas por polígonos geográficos.

- El costo se muestra al cliente antes de confirmar el pedido
- Las zonas y tarifas son configurables desde el panel admin
- Si la dirección está fuera de cobertura, el pedido no puede completarse como delivery

## 2.5 Programa de Fidelización — Puntos

| Parámetro                  | Definición                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| Tasa de acumulación        | 1 peso = 1 punto (sobre el total del pedido, excluyendo costo de envío).                            |
| Vencimiento de puntos      | Los puntos vencen a los 3 meses desde su fecha de acreditación.                                     |
| Canje de puntos            | El cliente puede canjear puntos acumulados como descuento en el total del pedido.                   |
| Descuentos / cupones       | El cliente puede ingresar un código de descuento. Validación automática antes de confirmar el pago. |
| Validación desde mostrador | El admin puede consultar y acreditar puntos a un cliente ingresando su teléfono o email.            |

## 2.6 Medios de Pago

El cliente puede abonar mediante los siguientes medios:

- Mercado Pago (integración vía API oficial — pago 100% online)
- Transferencia bancaria
- Tarjeta de crédito / débito (gateway integrado)
- Efectivo al delivery (el pago se registra como 'pendiente' hasta que el admin lo confirma como cobrado)

## 2.7 Panel del Usuario

El usuario registrado dispone de un panel personal con acceso a:

- Estado en tiempo real del pedido activo
- Historial de pedidos anteriores
- Saldo de puntos acumulados y fecha de vencimiento
- Gestión de direcciones guardadas
- Datos de cuenta (nombre, email, contraseña)
