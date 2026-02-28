# Pedidos Project - Setup Guide

Guía para configurar el entorno de desarrollo y empezar a colaborar.

## Requisitos previos

| Herramienta | Versión mínima | Propósito                       |
| ----------- | -------------- | ------------------------------- |
| **fnm**     | 1.x            | Gestión de versiones de Node.js |
| **Node.js** | 24.x LTS       | Runtime JavaScript              |
| **npm**     | 11.x           | Gestor de paquetes              |
| **Git**     | 2.x            | Control de versiones            |

## 1. Instalar fnm (Fast Node Manager)

fnm permite tener múltiples versiones de Node.js y fijar la versión por proyecto (similar a Poetry en Python).

### Windows (PowerShell)

```powershell
winget install Schniz.fnm
```

Después de instalar, agregar lo siguiente al perfil de PowerShell (`$PROFILE`):

```powershell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
```

> **Nota:** Si PowerShell bloquea scripts, ejecutar una vez:
>
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

### macOS / Linux

```bash
curl -fsSL https://fnm.vercel.app/install | bash
```

Agregar al `.bashrc` / `.zshrc`:

```bash
eval "$(fnm env --use-on-cd)"
```

## 2. Instalar Node.js

Al entrar al directorio del proyecto, fnm debería detectar el archivo `.node-version` automáticamente. Si no:

```bash
fnm install
fnm use
```

Verificar:

```bash
node --version  # Debe coincidir con el contenido de .node-version
npm --version
```

## 3. Instalar dependencias

```bash
npm install
```

## 4. Scripts disponibles

| Comando                | Descripción                           |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Inicia servidor de desarrollo (Vite)  |
| `npm run build`        | Genera build de producción en `dist/` |
| `npm run preview`      | Previsualiza el build de producción   |
| `npm run lint`         | Ejecuta ESLint                        |
| `npm run lint:fix`     | Ejecuta ESLint con auto-fix           |
| `npm run format`       | Formatea código con Prettier          |
| `npm run format:check` | Verifica formato sin modificar        |

## 5. Estructura del proyecto

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

## 6. Convenciones

- **Formato**: Prettier se ejecuta con `npm run format`. Configurar VS Code para formatear al guardar.
- **Linting**: ESLint está configurado para React. Ejecutar `npm run lint` antes de commitear.
- **Componentes**: Un archivo por componente. Nombre en PascalCase. Ejemplo: `components/MenuCard/MenuCard.jsx`.
- **Commits**: Usar mensajes descriptivos en español. Ejemplo: `feat: agregar listado de menú`.

## 7. Extensiones recomendadas de VS Code

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## 8. Notas sobre el backend

El backend se desarrolla en un proyecto separado (Python). Mientras tanto, las respuestas de la API están mockeadas en `src/mocks/`. Cuando el backend esté listo, se reemplazarán los handlers mock por llamadas reales a través de `src/services/api.js`.

La URL base de la API se configura con la variable de entorno `VITE_API_URL` (default: `http://localhost:8000/api`).
