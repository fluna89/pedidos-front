# Pedidos Project - Setup Guide (Windows)

Guía para configurar el entorno de desarrollo en **Windows** y empezar a colaborar.

> **Nota:** Esta guía está orientada a Windows. Si usás macOS o Linux, los pasos son similares pero los comandos de instalación y configuración de shell varían.

## Requisitos previos

| Herramienta | Versión mínima | Propósito                       |
| ----------- | -------------- | ------------------------------- |
| **fnm**     | 1.x            | Gestión de versiones de Node.js |
| **Node.js** | 24.x LTS       | Runtime JavaScript              |
| **npm**     | 11.x           | Gestor de paquetes              |
| **Git**     | 2.x            | Control de versiones            |

## 1. Instalar fnm (Fast Node Manager)

fnm permite tener múltiples versiones de Node.js y fijar la versión por proyecto (similar a Poetry en Python).

Abrir **PowerShell** y ejecutar:

```powershell
winget install Schniz.fnm
```

`winget` es el gestor de paquetes de Windows (viene preinstalado en Windows 10/11). Este comando descarga e instala fnm.

## 2. Configurar la shell

fnm necesita activarse en cada sesión de terminal. Seguí las instrucciones según la shell que uses:

### Opción A: CMD (Símbolo del sistema)

No se necesita configuración global. Al abrir CMD, navegá al proyecto y ejecutá:

```cmd
cd C:\repos\pedidos\pedidos-front
init.cmd
```

Esto activa fnm y carga la versión de Node del proyecto. Hay que ejecutarlo una vez cada vez que se abre una nueva ventana de CMD.

### Opción B: PowerShell

Agregar lo siguiente al perfil de PowerShell para que fnm se active automáticamente.

1. Abrir el archivo de perfil:

   ```powershell
   notepad $PROFILE
   ```

   `$PROFILE` es una variable que apunta al archivo de configuración que PowerShell ejecuta cada vez que se abre una nueva terminal. Si el archivo no existe, te va a preguntar si querés crearlo — aceptá.

2. Agregar esta línea:

   ```powershell
   fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
   ```

   Este comando genera las variables de entorno necesarias para que Node/npm estén disponibles. La opción `--use-on-cd` hace que fnm cambie automáticamente de versión de Node cuando entrás a un directorio con archivo `.node-version`.

3. Guardar y cerrar. A partir de ahora, cada terminal nueva va a tener Node/npm disponible automáticamente.

> **Nota:** Si PowerShell bloquea scripts, ejecutar una vez:
>
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```
>
> Esto permite ejecutar scripts locales en PowerShell. Por defecto Windows lo bloquea por seguridad.

## 3. Instalar Node.js

Al entrar al directorio del proyecto, fnm debería detectar el archivo `.node-version` automáticamente (si configuraste PowerShell con `--use-on-cd`). Si no:

```bash
fnm install   # Descarga la versión de Node indicada en .node-version
fnm use       # Activa esa versión en la sesión actual
```

Verificar (en CMD ejecutar `init.cmd` primero):

```bash
node --version  # Debe coincidir con el contenido de .node-version
npm --version
```

## 4. Instalar dependencias

```bash
npm install
```

Lee el archivo `package.json` y descarga todas las librerías que el proyecto necesita en la carpeta `node_modules/`. Solo hay que hacerlo la primera vez o cuando alguien agrega una dependencia nueva.

## 5. Scripts disponibles

| Comando                | Descripción                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Inicia servidor de desarrollo (Vite) en `localhost:5173`. Tiene hot-reload: al guardar un archivo, el cambio se ve al instante en el navegador. |
| `npm run build`        | Genera build de producción en `dist/`. Bundlea, minifica y optimiza todo el código para subir a un servidor.                                    |
| `npm run preview`      | Levanta un servidor local que sirve el contenido de `dist/` para probar el build antes de deployar.                                             |
| `npm run lint`         | Analiza el código con ESLint buscando errores y malas prácticas. No modifica nada, solo reporta.                                                |
| `npm run lint:fix`     | Igual que `lint` pero corrige automáticamente los problemas que puede.                                                                          |
| `npm run format`       | Reformatea todos los archivos con Prettier (indentación, comillas, etc.).                                                                       |
| `npm run format:check` | Verifica si el formato es correcto sin modificar nada. Útil para CI/CD.                                                                         |

## 6. Estructura del proyecto

```
src/
├── components/    # Componentes reutilizables de UI
├── pages/         # Componentes a nivel de página/ruta
├── hooks/         # Custom React hooks
├── context/       # React Context providers
├── services/      # Capa de comunicación con API
├── mocks/         # Datos y handlers mock (simula backend)
├── utils/         # Funciones utilitarias
├── assets/        # Imágenes, fuentes, etc.
├── App.jsx        # Componente raíz
├── App.css        # Estilos del componente raíz
├── main.jsx       # Entry point
└── index.css      # Estilos globales
```

## 7. Convenciones

- **Formato**: Prettier se ejecuta con `npm run format`. Configurar VS Code para formatear al guardar.
- **Linting**: ESLint está configurado para React. Ejecutar `npm run lint` antes de commitear.
- **Componentes**: Un archivo por componente. Nombre en PascalCase. Ejemplo: `components/MenuCard/MenuCard.jsx`.
- **Commits**: Usar mensajes descriptivos en español. Ejemplo: `feat: agregar listado de menú`.

## 8. Extensiones recomendadas de VS Code

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## 9. Notas sobre el backend

El backend se desarrolla en un proyecto separado (Python). Mientras tanto, las respuestas de la API están mockeadas en `src/mocks/`. Cuando el backend esté listo, se reemplazarán los handlers mock por llamadas reales a través de `src/services/api.js`.

La URL base de la API se configura con la variable de entorno `VITE_API_URL` (default: `http://localhost:8000/api`).
