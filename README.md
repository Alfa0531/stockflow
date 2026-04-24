# StockFlow

Sistema de gestión de inventario para distribuidoras. Controla entradas y salidas de mercancía mediante escáner de código de barras, con análisis de stock, compras y reportes.

---

## Requisitos previos

Instala lo siguiente antes de empezar:

- **Node.js 20 o superior** → https://nodejs.org (descarga la versión LTS)
- **Git** → https://git-scm.com

Verifica que estén instalados abriendo la terminal y ejecutando:

```bash
node --version
git --version
```

---

## Instalación desde cero

### 1. Clonar el repositorio

```bash
git clone https://github.com/Alfa0531/stockflow.git
cd stockflow
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear el archivo de configuración `.env`

Este archivo le dice a la app dónde guardar la base de datos. Sigue estos pasos según tu sistema operativo:

#### En Mac

1. Abre la terminal y escribe este comando para saber tu ruta exacta (cópiala, la necesitas en el siguiente paso):
   ```bash
   pwd
   ```
   Verás algo como: `/Users/maria/Documents/stockflow`

2. Abre el **TextEdit**, ve al menú **Formato → Convertir a formato sin estilo**

3. Pega el siguiente texto, reemplazando la ruta con la que obtuviste en el paso 1:
   ```
   DATABASE_URL="file:/Users/maria/Documents/stockflow/prisma/dev.db"
   ```

4. Ve a **Archivo → Guardar**, navega a la carpeta `stockflow`, escribe `.env` como nombre del archivo y guarda.  
   Si el sistema te advierte que los archivos que empiezan con punto están ocultos, haz clic en **Usar .env**.

#### En Windows

1. Abre la terminal (CMD o PowerShell) y escribe este comando para saber tu ruta exacta:
   ```bash
   cd
   ```
   Verás algo como: `C:\Users\maria\Documents\stockflow`

2. Abre el **Bloc de notas**

3. Pega el siguiente texto, reemplazando la ruta con la que obtuviste en el paso 1 (usa `/` en lugar de `\`):
   ```
   DATABASE_URL="file:C:/Users/maria/Documents/stockflow/prisma/dev.db"
   ```

4. Ve a **Archivo → Guardar como**, navega a la carpeta `stockflow`, escribe `.env` como nombre del archivo, cambia "Tipo" a **Todos los archivos (\*.\*)** y guarda.

> **Verificación:** Si lo hiciste bien, dentro de la carpeta `stockflow` verás un archivo llamado `.env` (puede aparecer oculto en Mac, es normal).

### 4. Crear la base de datos

```bash
npx prisma migrate dev --name init
```

### 5. Cargar los productos

```bash
npm run db:seed:dulceria
```

Esto carga las 20 presentaciones de productos de la dulcería con stock inicial.

### 6. Iniciar la aplicación

```bash
npm run dev
```

Abre tu navegador en **http://localhost:3000**

---

## Uso básico

### Registrar una venta (salida)

1. Ve a **Escaneo** en el menú lateral
2. Selecciona el modo **SALIDA — Venta** (azul)
3. Escanea el código de barras de la caja con el escáner USB, o escribe el SKU manualmente (ej: `VAL-C12`) y presiona **Enter**
4. Ajusta la cantidad de cajas
5. Presiona **Agregar** — puedes seguir escaneando más productos
6. Escribe el número de folio (opcional)
7. Presiona **Confirmar SALIDA**

### Registrar una entrada (compra)

Mismo flujo, pero selecciona el modo **ENTRADA — Compra** (verde).

### Registrar el barcode de una caja nueva

La primera vez que escaneas un código EAN que no está registrado, el sistema pregunta a qué producto corresponde. Selecciónalo en el listado y presiona **Vincular barcode**. A partir de ese momento el escáner lo reconoce automáticamente.

---

## Secciones de la aplicación

| Sección | Descripción |
|---|---|
| Dashboard | Resumen general: valor de inventario, alertas, ventas recientes |
| Productos | Catálogo completo con precios, stock y estado |
| Inventario | Historial de todos los movimientos de entrada y salida |
| Compras | Análisis predictivo: cuándo y cuánto comprar (ROP, EOQ) |
| Reportes | Análisis ABC, rotación de inventario, productos muertos |
| Alertas | Productos con stock crítico, exceso o sin movimiento |
| Escaneo | Terminal de operación con escáner de código de barras |

---

## Comandos útiles

```bash
npm run dev              # Inicia el servidor de desarrollo
npm run build            # Compila para producción
npm run db:seed:dulceria # Carga los productos de la dulcería
npm run db:reset         # Borra todo y reinicia la base de datos
```

---

## Tecnologías

- **Next.js 16** con TypeScript
- **Prisma 6** + SQLite
- **Tailwind CSS v4** + shadcn/ui
- **Recharts** para gráficas
- **TanStack Table** para tablas con filtros y paginación
