# Planifi - Aplicación de Finanzas Personales

Planifi es una app de finanzas personales para Android, construida con React y empaquetada con Capacitor. Reúne transacciones, presupuestos por categoría, metas de ahorro y reportes. Todos los datos se guardan en el dispositivo (localStorage); no hay servidor ni cuenta.

Interfaz en español. Los montos se muestran en la divisa elegida en Configuración (pesos colombianos por defecto).

## 🚀 Características

### 🧭 Navegación
- **Celular y tablet**: barra inferior con Inicio, Movimientos, Presupuesto, Metas y Reportes, al alcance del pulgar. Configuración, la búsqueda y el tema están en el header. La barra se esconde mientras escribes en un campo para no tapar el teclado.
- **Escritorio** (desde 1024 px): menú lateral fijo con todas las secciones y el botón "Nueva transacción".

### 🏠 Inicio
- Saludo con la fecha del día.
- **Balance neto** destacado, con una barra que muestra qué parte de lo que entró ya salió.
- **Ahorrado en metas**: total acumulado y avance frente a la suma de todas las metas.
- Últimos 5 movimientos y estado de los 3 primeros presupuestos.

### 💸 Transacciones
- Registro de ingresos y gastos con título, monto, categoría, fecha y descripción.
- Búsqueda por nombre y filtro rápido Todos / Ingresos / Gastos.
- "Más filtros y orden": categoría, monto mínimo y máximo, orden por fecha, monto, título o categoría.
- Montos libres (no tienen que ser múltiplos de 1.000).
- Eliminación con confirmación.
- Exportación a CSV (en Android abre el menú de compartir para guardarlo en Archivos o Drive, o enviarlo).

### 👛 Presupuesto
- Límite por categoría de gasto (semanal, mensual, trimestral o anual).
- **Lo gastado se calcula desde las transacciones del período del presupuesto**: se reinicia cada semana, mes, trimestre o año, baja al eliminar un gasto y un presupuesto nuevo incluye los gastos que ya hiciste en el período.
- Resumen de cuánto te queda por gastar.
- Estado por categoría según el porcentaje usado: **Vas bien** (< 75 %), **Ojo** (≥ 75 %), **Casi al tope** (≥ 90 %), **Te pasaste** (≥ 100 %).

### 🎯 Metas
- Metas con monto objetivo, fecha límite, categoría y prioridad.
- Progreso general y por meta, días restantes (días de calendario, en hora local) y estado (En progreso, Próxima, Urgente, Vencida, ¡Completada!).
- Actualización del total ahorrado de cada meta.

### 📊 Reportes
- **Filtro por período**: esta semana (desde el lunes), este mes, este trimestre o este año.
- **Balance, ingresos y gastos del período**, comparados con los **mismos días del período anterior** (por ejemplo, 1–19 de octubre contra 1–19 de septiembre), para no comparar un mes a medias contra uno completo. La comparación dice si el cambio es bueno o malo: más gastos se marca en rojo, más ingresos en verde.
- **Tasa de ahorro**: porcentaje de lo que entró en el período que no se gastó.
- **Tendencia de ingresos y gastos** con datos reales: últimas 6 semanas, 6 meses, 4 trimestres o 3 años, según el período.
- Gastos por categoría del período, estado actual de los presupuestos y avance acumulado de las metas.

### 🔍 Búsqueda
- En el celular se abre con la lupa del header; en pantallas anchas está siempre visible.
- Busca en título, descripción y categoría de los movimientos, en presupuestos y en metas, sin importar tildes ni mayúsculas.
- Al tocar un movimiento abre Transacciones ya filtrado por ese movimiento.

### ⚙️ Configuración
- Perfil: nombre, email y **divisa de los montos** (COP, USD, EUR, MXN, ARS). Cambia el formato de todos los montos y de los ejes de los gráficos; no convierte valores.
- **Apariencia**: tema oscuro (por defecto), claro o automático (sigue el modo del celular).
- Respaldo: exportar e importar todos los datos en JSON, y restablecer al estado inicial. **Importar valida el archivo**: si no es un respaldo de Planifi se rechaza sin tocar tus datos, y los registros inválidos se descartan.

### 🛡️ Datos guardados
- Si lo guardado en el dispositivo está dañado, la app arranca igual con los datos de ejemplo y guarda una copia de lo dañado en `localStorage` bajo `planifi-state-unreadable`.

## 🎨 Sistema de diseño: "Noche de mora"

La identidad de la app (usuarios, personalidad, principios) está en [`PRODUCT.md`](PRODUCT.md).

| Rol | Nombre | Uso |
|---|---|---|
| Fondo | Mora | Neutros casi negros con tinte de mora |
| Acento | Maracuyá | Acciones principales y selección |
| Ingresos | Lulo | Montos y tendencias positivas |
| Gastos | Guayaba | Alertas y tendencias negativas |
| Ahorro | Caribe | Metas y ahorro |
| Advertencia | Mango | Presupuestos cerca del límite |

- **Tokens** en `src/styles/tokens.css`, en OKLCH. El tema oscuro va en `:root` y el claro en `[data-theme="light"]`. Todas las combinaciones de texto y fondo cumplen contraste WCAG 2.1 AA.
- **Componentes compartidos** en `src/styles/components.css`: botones, campos, tarjetas, hojas inferiores, etiquetas, barras de progreso, filas de movimientos, avisos. El CSS de cada página solo define su layout y usa clases con prefijo propio (`dash-`, `tx-`, `budget-`, `goal-`, `rep-`, `settings-`) para que los estilos no choquen entre páginas.
- **Tipografía**: Rubik variable, empaquetada en la app (funciona sin internet). Los montos usan números tabulares.
- **Iconos**: Lucide. Cada categoría tiene icono y color propios (`src/components/CategoryIcon.jsx`).
- **Espaciado**: grilla de 4 px, margen lateral de 20 px en móvil.
- **Android**: la app se dibuja de borde a borde. El header respeta la barra de estado con `env(safe-area-inset-top)`, y el color de los iconos de la barra de estado cambia con el tema (`@capacitor/status-bar`).
- **Accesibilidad**: objetivos táctiles de 44 px, foco visible, ingresos y gastos siempre con signo (+/−) además del color, `prefers-reduced-motion` respetado.

## 🛠️ Tecnologías

| Paquete | Versión | Uso |
|---|---|---|
| React | 19.1 | Interfaz |
| React Router DOM | 7.8 | Navegación |
| Vite | 7.1 | Desarrollo y build (minificación con terser) |
| Chart.js | 4.5 | Gráficos, con colores leídos de los tokens del tema |
| Capacitor (core, android) | 7.4 | Empaquetado Android |
| @capacitor/status-bar | 7.0 | Color de la barra de estado según el tema |
| @capacitor/filesystem + @capacitor/share | 7.1 / 7.0 | Exportar archivos en Android (caché + menú de compartir) |
| lucide-react | 1.59 | Iconos |
| @fontsource-variable/rubik | 5.3 | Tipografía |

Estado global con Context API (`src/context/AppContext.jsx` + `src/hooks/useAppState.js`), persistido en `localStorage` bajo la clave `planifi-state`.

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── Header.jsx          # Encabezado: logo, búsqueda, tema, Configuración
│   ├── BottomNav.jsx       # Barra de navegación inferior (celular y tablet)
│   ├── Sidebar.jsx         # Menú lateral fijo (escritorio)
│   ├── navItems.js         # Secciones de la app, compartidas por ambas navegaciones
│   ├── SearchBar.jsx       # Búsqueda global (escritorio)
│   ├── ThemeToggle.jsx     # Selector de tema del header
│   ├── CategoryIcon.jsx    # Icono y color por categoría
│   └── Chart.jsx           # Envoltura de Chart.js con colores del tema
├── pages/                  # Inicio, Transacciones, Presupuesto, Metas, Reportes, Configuración
├── context/AppContext.jsx  # Proveedor de estado
├── hooks/useAppState.js    # Estado, datos de ejemplo y persistencia
├── styles/
│   ├── tokens.css          # Colores, tipografía, espaciado, movimiento
│   ├── base.css            # Reset y estilos base
│   └── components.css      # Componentes compartidos
└── utils/
    ├── periods.js          # Rangos de fechas y totales (Reportes y presupuestos)
    ├── budget.js           # Gasto por período y estado de presupuestos
    ├── storage.js          # Validación de datos guardados e importados
    ├── saveFile.js         # Descarga en navegador / compartir en Android
    ├── formatters.js       # Moneda configurable, porcentajes y fechas (es-CO)
    ├── *.test.js           # Tests (npm test)
    ├── notifications.js    # Avisos y diálogo de confirmación
    ├── theme.js            # Cambio de tema y barra de estado
    ├── exportUtils.js      # Exportación CSV
    ├── chartUtils.js, keyboardShortcuts.js, performance.js  # Utilidades sin conectar a la UI
android/                    # Proyecto nativo de Capacitor
PRODUCT.md                  # Identidad y principios de diseño
DEPLOYMENT.md               # Publicación en Play Store
```

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js `^20.19.0` o `>=22.12.0` (requisito de Vite 7)
- npm

### Instalación
```bash
git clone [url-del-repositorio]
cd planifi
npm install
npm run dev       # http://localhost:3000
```

> Si copias el proyecto desde otro sistema operativo, borra `node_modules` y vuelve a ejecutar `npm install`: Vite y esbuild instalan binarios nativos por plataforma.

### Scripts
| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm test` | Tests con el runner nativo de Node (`node --test`) |
| `npm run lint` | ESLint (ver pendientes: la configuración actual no corre) |

## 📱 Probar en un celular Android

### 1. Herramientas (una sola vez)
- **JDK 21**: Capacitor 7 compila con Java 21 (con Java 17 falla con `invalid source release: 21`), y Gradle 8.11 no corre con Java 24 o superior.
- **Android SDK**: con Android Studio, o solo las herramientas de línea de comandos. En macOS con Homebrew:

```bash
brew install --cask android-commandlinetools android-platform-tools
brew install openjdk@21
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
SDK=/opt/homebrew/share/android-commandlinetools
yes | sdkmanager --sdk_root=$SDK --licenses
sdkmanager --sdk_root=$SDK "platform-tools" "platforms;android-35" "build-tools;34.0.0"
```

- Crea `android/local.properties` (no se sube a git) con la ruta de tu SDK:

```properties
sdk.dir=/opt/homebrew/share/android-commandlinetools
```

### 2. Preparar el celular
1. Ajustes → Acerca del teléfono → Información de software → toca 7 veces **Número de compilación**.
2. Ajustes → Opciones de desarrollador → activa **Depuración USB**.
3. Conecta un cable de datos y acepta **Permitir depuración USB**. `adb devices` debe mostrar el equipo como `device`.

### 3. Compilar e instalar
```bash
npm run build && npx cap sync android
cd android
JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home sh ./gradlew installDebug
```

Para publicar en Play Store, ver [`DEPLOYMENT.md`](DEPLOYMENT.md).

## 🧪 Tests

`npm test` corre `src/**/*.test.js` con el runner nativo de Node (15 tests):

- `periods.test.js`: inicio de semana en lunes, cambio de mes sin desbordar días (31 de marzo menos un mes es 28/29 de febrero), comparación contra los mismos días del período anterior, rangos de tendencia y totales por rango.
- `budget.test.js`: el gasto se reinicia por período, baja al eliminar una transacción e incluye gastos anteriores al presupuesto.
- `storage.test.js`: rechazo de archivos que no son respaldos, descarte de registros inválidos, arranque seguro con datos dañados.
- `formatters.test.js`: fechas sin hora leídas en hora local (en Colombia), días restantes y divisa configurable.

## ⚠️ Pendientes conocidos

- **ESLint no corre**: `eslint.config.js` usa la configuración plana de ESLint 9, pero el proyecto tiene ESLint 8 instalado.
- **Las metas no guardan el historial de aportes**, así que Reportes muestra lo acumulado y no lo ahorrado por período.
- **La app solo está en español**: el selector de idioma se quitó porque no tenía efecto.
- **Menores**: el header de escritorio muestra un usuario fijo y se puede guardar una transacción de $ 0.
- **Atajos de teclado** (`utils/keyboardShortcuts.js`) y **utilidades de rendimiento** (`utils/performance.js`) existen pero no están conectados a la interfaz.
- **Credenciales del keystore de release**: están escritas en `android/app/build.gradle` y en `DEPLOYMENT.md`. Conviene moverlas a un archivo fuera de git y cambiar la contraseña.

## 📝 Licencia

MIT.

---

**Planifi**: tus finanzas claras, desde el celular.
