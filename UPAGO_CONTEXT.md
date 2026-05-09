# Contexto del Proyecto: Upago (MiUNAMIS)
> Documento de contexto y "skill" para asistentes de IA. Leer esto antes de realizar modificaciones en el código para no perder el hilo de la arquitectura y diseño.

## 1. Arquitectura General
- **Frontend:** React + TypeScript + Vite.
- **Estilos:** Tailwind CSS, componentes de Framer Motion para animaciones, e íconos combinados de `lucide-react` y `@mui/icons-material`.
- **Backend:** PHP (`api.php` y otros scripts) corriendo en el puerto `8001`. El frontend corre en `5173`.
- **Despliegue Local:** 
  - Backend: `php -S localhost:8001`
  - Frontend: `npm run dev`

## 2. Estructura de Navegación y Vistas (Core)
El enrutamiento principal se maneja en `App.tsx` usando un estado de sesión simulado (`auth`, `student`, `admin`).

### Modo Administrador (Finanzas)
- El contenedor principal para el área administrativa es **`src/components/AdminFinanceDashboard.tsx`**.
- Este archivo maneja la navegación lateral y el renderizado condicional de las secciones internas mediante el estado `activeSection`.
- **IMPORTANTE:** Para agregar nuevas pantallas administrativas, se deben importar los componentes dentro de `AdminFinanceDashboard.tsx` y no en `ArancelesModule.tsx` (que funciona como un wrapper legacy o para otros contextos).

### Componentes Financieros Implementados (`src/components/aranceles/`)
1. **`BankReconciliation.tsx`**: Módulo de conciliación bancaria. Usa un diseño de tabla y tarjetas de resumen para comparar ingresos vs extractos.
2. **`FinancialReports.tsx`**: Dashboard de reportes. Incluye un gráfico de dona construido en SVG puro, barras de progreso y una tabla cronológica de transacciones.
3. **`OfficialReceipt.tsx`**: Módulo de "Facturas". 
   - **Característica Crítica:** Posee un diseño dual. En pantalla (`print:hidden`) muestra un diseño web moderno y responsivo. Al invocar la impresión (`window.print()`), se oculta la interfaz web y se muestra un contenedor oculto (`print:block`) que simula **exactamente** la plantilla del formulario físico en papel de la UNAMIS (RUC, Códigos Presupuestarios/Contables, Firmas).

## 3. Guía de Estilos y UI/UX
- **Paleta Institucional:** 
  - Color principal: Bordó/Vino (`#800020`) utilizado en botones primarios, fondos de tarjetas clave y el menú lateral.
  - Color secundario/acentos: Azul Marino oscuro (`#001738`, `#002f6c`) y gris neutro oscuro (`#43474f`).
  - Fondos: Blanco para tarjetas (`#ffffff`) y gris azulado muy claro para el fondo de la app (`#f7f9fb`).
- **Filosofía de Diseño:** *Modern-minimalist* y *Premium*. Las interfaces deben verse corporativas, confiables y de alta gama. Se deben usar bordes redondeados (`rounded-xl` o `rounded-2xl`), sombras suaves (`shadow-sm`) e interacciones sutiles en hover.
- **Gráficos:** No se deben usar librerías pesadas de gráficos a menos que sea estrictamente necesario. Los gráficos simples (donas, barras) se construyen con Tailwind, divs y SVG nativo para mantener el bundle ligero.

## 4. Próximos Pasos y Estado Actual
- El frontend administrativo está completamente maquetado y con el flujo de navegación funcional.
- Actualmente se están utilizando datos *mockeados* en los componentes.
- **Siguiente objetivo sugerido:** Conectar los endpoints de PHP (`api.php` / base de datos MySQL) mediante `fetch` o `axios` para reemplazar el mock data en `BankReconciliation` y `FinancialReports`.
