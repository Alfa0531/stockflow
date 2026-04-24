import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed...")

  // Warehouse
  const almacen = await prisma.warehouse.upsert({
    where: { code: "ALM-01" },
    update: {},
    create: { name: "Almacén Principal", code: "ALM-01", address: "Av. Industrial 450, CDMX" },
  })

  // Categories
  const cats = await Promise.all([
    prisma.category.upsert({ where: { name: "Abarrotes" }, update: {}, create: { name: "Abarrotes", description: "Productos de consumo básico" } }),
    prisma.category.upsert({ where: { name: "Bebidas" }, update: {}, create: { name: "Bebidas", description: "Refrescos, agua, jugos" } }),
    prisma.category.upsert({ where: { name: "Lácteos" }, update: {}, create: { name: "Lácteos", description: "Leche, queso, yogurt" } }),
    prisma.category.upsert({ where: { name: "Limpieza" }, update: {}, create: { name: "Limpieza", description: "Productos de limpieza del hogar" } }),
    prisma.category.upsert({ where: { name: "Cuidado Personal" }, update: {}, create: { name: "Cuidado Personal", description: "Higiene y belleza" } }),
    prisma.category.upsert({ where: { name: "Botanas" }, update: {}, create: { name: "Botanas", description: "Frituras y snacks" } }),
    prisma.category.upsert({ where: { name: "Dulcería" }, update: {}, create: { name: "Dulcería", description: "Dulces y chocolates" } }),
  ])

  const [catAbarrotes, catBebidas, catLacteos, catLimpieza, catCuidado, catBotanas, catDulceria] = cats

  // Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.upsert({ where: { code: "PROV-001" }, update: {}, create: { name: "Grupo Bimbo Distribución", code: "PROV-001", email: "pedidos@bimbo.com.mx", phone: "55-5000-1000", contact: "Carlos Méndez", leadTime: 3, paymentTerms: 30, rating: 4.8 } }),
    prisma.supplier.upsert({ where: { code: "PROV-002" }, update: {}, create: { name: "Coca-Cola FEMSA", code: "PROV-002", email: "distribuidores@coca-cola.com.mx", phone: "55-5800-2000", contact: "Ana Rodríguez", leadTime: 2, paymentTerms: 15, rating: 4.9 } }),
    prisma.supplier.upsert({ where: { code: "PROV-003" }, update: {}, create: { name: "Lala S.A. de C.V.", code: "PROV-003", email: "ventas@lala.com.mx", phone: "55-5600-3000", contact: "Roberto García", leadTime: 1, paymentTerms: 7, rating: 4.7 } }),
    prisma.supplier.upsert({ where: { code: "PROV-004" }, update: {}, create: { name: "Procter & Gamble México", code: "PROV-004", email: "clientes@pg.com", phone: "55-5900-4000", contact: "María López", leadTime: 7, paymentTerms: 45, rating: 4.6 } }),
    prisma.supplier.upsert({ where: { code: "PROV-005" }, update: {}, create: { name: "Sabritas PepsiCo", code: "PROV-005", email: "distribución@sabritas.com.mx", phone: "55-5700-5000", contact: "José Hernández", leadTime: 4, paymentTerms: 30, rating: 4.5 } }),
    prisma.supplier.upsert({ where: { code: "PROV-006" }, update: {}, create: { name: "Nestlé México", code: "PROV-006", email: "pedidos@nestle.com.mx", phone: "55-5200-6000", contact: "Lucía Pérez", leadTime: 5, paymentTerms: 30, rating: 4.7 } }),
  ])

  const [provBimbo, provCoca, provLala, provPG, provSabritas, provNestle] = suppliers

  // Products data
  const productsData = [
    // ABARROTES
    { sku: "ABR-001", name: "Arroz SOS 1kg", brand: "SOS", cost: 18.5, price: 26.0, stockCurrent: 320, stockMin: 50, stockMax: 500, stockSafety: 30, leadTime: 5, categoryId: catAbarrotes.id, supplierId: provBimbo.id, unit: "KG", location: "A-01-01" },
    { sku: "ABR-002", name: "Frijol negro Isadora 500g", brand: "Isadora", cost: 14.0, price: 22.0, stockCurrent: 12, stockMin: 40, stockMax: 300, stockSafety: 25, leadTime: 5, categoryId: catAbarrotes.id, supplierId: provBimbo.id, unit: "PZA", location: "A-01-02", status: "OUT_OF_STOCK" },
    { sku: "ABR-003", name: "Aceite Capullo 1L", brand: "Capullo", cost: 28.0, price: 42.0, stockCurrent: 180, stockMin: 30, stockMax: 250, stockSafety: 20, leadTime: 7, categoryId: catAbarrotes.id, supplierId: provBimbo.id, unit: "PZA", location: "A-01-03" },
    { sku: "ABR-004", name: "Azúcar estándar Zulka 1kg", brand: "Zulka", cost: 16.0, price: 24.0, stockCurrent: 450, stockMin: 60, stockMax: 400, stockSafety: 40, leadTime: 5, categoryId: catAbarrotes.id, supplierId: provBimbo.id, unit: "KG", location: "A-01-04", status: "SLOW_MOVING" },
    { sku: "ABR-005", name: "Sal La Fina 1kg", brand: "La Fina", cost: 6.0, price: 10.0, stockCurrent: 85, stockMin: 20, stockMax: 150, stockSafety: 15, leadTime: 5, categoryId: catAbarrotes.id, supplierId: provBimbo.id, unit: "KG", location: "A-01-05" },
    { sku: "ABR-006", name: "Pasta Barilla Espagueti 500g", brand: "Barilla", cost: 13.5, price: 20.0, stockCurrent: 210, stockMin: 40, stockMax: 300, stockSafety: 25, leadTime: 7, categoryId: catAbarrotes.id, supplierId: provBimbo.id, unit: "PZA", location: "A-01-06" },
    { sku: "ABR-007", name: "Mayonesa Hellmann's 400g", brand: "Hellmann's", cost: 22.0, price: 34.0, stockCurrent: 95, stockMin: 25, stockMax: 200, stockSafety: 15, leadTime: 7, categoryId: catAbarrotes.id, supplierId: provNestle.id, unit: "PZA", location: "A-01-07" },
    { sku: "ABR-008", name: "Atún Tuny en agua 140g", brand: "Tuny", cost: 17.0, price: 26.0, stockCurrent: 3, stockMin: 50, stockMax: 400, stockSafety: 30, leadTime: 7, categoryId: catAbarrotes.id, supplierId: provBimbo.id, unit: "PZA", location: "A-01-08", status: "OUT_OF_STOCK" },

    // BEBIDAS
    { sku: "BEB-001", name: "Coca-Cola 600ml", brand: "Coca-Cola", cost: 9.5, price: 16.0, stockCurrent: 1200, stockMin: 200, stockMax: 2000, stockSafety: 150, leadTime: 2, categoryId: catBebidas.id, supplierId: provCoca.id, unit: "PZA", location: "B-01-01" },
    { sku: "BEB-002", name: "Pepsi 600ml", brand: "Pepsi", cost: 8.5, price: 15.0, stockCurrent: 480, stockMin: 150, stockMax: 1500, stockSafety: 100, leadTime: 3, categoryId: catBebidas.id, supplierId: provSabritas.id, unit: "PZA", location: "B-01-02" },
    { sku: "BEB-003", name: "Agua Ciel 1.5L", brand: "Ciel", cost: 7.0, price: 12.0, stockCurrent: 640, stockMin: 100, stockMax: 1200, stockSafety: 80, leadTime: 2, categoryId: catBebidas.id, supplierId: provCoca.id, unit: "PZA", location: "B-01-03" },
    { sku: "BEB-004", name: "Jugo Del Valle Naranja 1L", brand: "Del Valle", cost: 18.0, price: 28.0, stockCurrent: 195, stockMin: 50, stockMax: 600, stockSafety: 40, leadTime: 3, categoryId: catBebidas.id, supplierId: provCoca.id, unit: "PZA", location: "B-01-04" },
    { sku: "BEB-005", name: "Coca-Cola 2L", brand: "Coca-Cola", cost: 19.0, price: 32.0, stockCurrent: 380, stockMin: 80, stockMax: 800, stockSafety: 60, leadTime: 2, categoryId: catBebidas.id, supplierId: provCoca.id, unit: "PZA", location: "B-01-05" },
    { sku: "BEB-006", name: "Powerade Azul 600ml", brand: "Powerade", cost: 12.0, price: 20.0, stockCurrent: 55, stockMin: 60, stockMax: 500, stockSafety: 40, leadTime: 2, categoryId: catBebidas.id, supplierId: provCoca.id, unit: "PZA", location: "B-01-06" },
    { sku: "BEB-007", name: "Jarritos Tamarindo 600ml", brand: "Jarritos", cost: 8.0, price: 14.0, stockCurrent: 0, stockMin: 80, stockMax: 600, stockSafety: 50, leadTime: 4, categoryId: catBebidas.id, supplierId: provCoca.id, unit: "PZA", location: "B-01-07", status: "OUT_OF_STOCK" },
    { sku: "BEB-008", name: "Red Bull 250ml", brand: "Red Bull", cost: 28.0, price: 50.0, stockCurrent: 120, stockMin: 30, stockMax: 300, stockSafety: 20, leadTime: 7, categoryId: catBebidas.id, supplierId: provBimbo.id, unit: "PZA", location: "B-01-08" },

    // LÁCTEOS
    { sku: "LAC-001", name: "Leche Lala entera 1L", brand: "Lala", cost: 17.5, price: 26.0, stockCurrent: 280, stockMin: 60, stockMax: 600, stockSafety: 48, leadTime: 1, categoryId: catLacteos.id, supplierId: provLala.id, unit: "PZA", location: "C-01-01" },
    { sku: "LAC-002", name: "Queso Oaxaca Lala 400g", brand: "Lala", cost: 52.0, price: 78.0, stockCurrent: 45, stockMin: 20, stockMax: 200, stockSafety: 15, leadTime: 2, categoryId: catLacteos.id, supplierId: provLala.id, unit: "PZA", location: "C-01-02" },
    { sku: "LAC-003", name: "Yogurt Yoplait fresa 1kg", brand: "Yoplait", cost: 38.0, price: 58.0, stockCurrent: 65, stockMin: 20, stockMax: 200, stockSafety: 15, leadTime: 2, categoryId: catLacteos.id, supplierId: provNestle.id, unit: "PZA", location: "C-01-03" },
    { sku: "LAC-004", name: "Crema Lala 200ml", brand: "Lala", cost: 15.0, price: 24.0, stockCurrent: 110, stockMin: 30, stockMax: 250, stockSafety: 20, leadTime: 1, categoryId: catLacteos.id, supplierId: provLala.id, unit: "PZA", location: "C-01-04" },
    { sku: "LAC-005", name: "Mantequilla Lala 90g", brand: "Lala", cost: 19.0, price: 30.0, stockCurrent: 78, stockMin: 25, stockMax: 200, stockSafety: 18, leadTime: 1, categoryId: catLacteos.id, supplierId: provLala.id, unit: "PZA", location: "C-01-05" },

    // LIMPIEZA
    { sku: "LIM-001", name: "Detergente Ariel 1kg", brand: "Ariel", cost: 52.0, price: 80.0, stockCurrent: 145, stockMin: 30, stockMax: 400, stockSafety: 25, leadTime: 7, categoryId: catLimpieza.id, supplierId: provPG.id, unit: "PZA", location: "D-01-01" },
    { sku: "LIM-002", name: "Suavitel Primavera 1L", brand: "Suavitel", cost: 28.0, price: 44.0, stockCurrent: 98, stockMin: 25, stockMax: 300, stockSafety: 20, leadTime: 7, categoryId: catLimpieza.id, supplierId: provPG.id, unit: "PZA", location: "D-01-02" },
    { sku: "LIM-003", name: "Ajax Limpiador Pino 400g", brand: "Ajax", cost: 18.0, price: 29.0, stockCurrent: 160, stockMin: 30, stockMax: 350, stockSafety: 22, leadTime: 7, categoryId: catLimpieza.id, supplierId: provPG.id, unit: "PZA", location: "D-01-03" },
    { sku: "LIM-004", name: "Pinol Multiusos 1L", brand: "Pinol", cost: 22.0, price: 36.0, stockCurrent: 73, stockMin: 25, stockMax: 250, stockSafety: 18, leadTime: 7, categoryId: catLimpieza.id, supplierId: provPG.id, unit: "PZA", location: "D-01-04" },
    { sku: "LIM-005", name: "Fabuloso Lavanda 1L", brand: "Fabuloso", cost: 20.0, price: 32.0, stockCurrent: 125, stockMin: 30, stockMax: 350, stockSafety: 22, leadTime: 7, categoryId: catLimpieza.id, supplierId: provPG.id, unit: "PZA", location: "D-01-05" },
    { sku: "LIM-006", name: "Cloralex 960ml", brand: "Cloralex", cost: 14.0, price: 22.0, stockCurrent: 200, stockMin: 40, stockMax: 400, stockSafety: 30, leadTime: 5, categoryId: catLimpieza.id, supplierId: provPG.id, unit: "PZA", location: "D-01-06" },

    // CUIDADO PERSONAL
    { sku: "CUI-001", name: "Shampoo Head & Shoulders 375ml", brand: "H&S", cost: 58.0, price: 90.0, stockCurrent: 88, stockMin: 20, stockMax: 250, stockSafety: 15, leadTime: 7, categoryId: catCuidado.id, supplierId: provPG.id, unit: "PZA", location: "E-01-01" },
    { sku: "CUI-002", name: "Jabón Dial antibacterial 90g", brand: "Dial", cost: 12.0, price: 20.0, stockCurrent: 152, stockMin: 30, stockMax: 400, stockSafety: 25, leadTime: 7, categoryId: catCuidado.id, supplierId: provPG.id, unit: "PZA", location: "E-01-02" },
    { sku: "CUI-003", name: "Pasta Colgate Triple Acción 75ml", brand: "Colgate", cost: 22.0, price: 36.0, stockCurrent: 118, stockMin: 30, stockMax: 350, stockSafety: 22, leadTime: 7, categoryId: catCuidado.id, supplierId: provPG.id, unit: "PZA", location: "E-01-03" },
    { sku: "CUI-004", name: "Desodorante Dove Original 150ml", brand: "Dove", cost: 35.0, price: 58.0, stockCurrent: 65, stockMin: 20, stockMax: 200, stockSafety: 15, leadTime: 7, categoryId: catCuidado.id, supplierId: provPG.id, unit: "PZA", location: "E-01-04" },
    { sku: "CUI-005", name: "Papel Higiénico Regio 4 rollos", brand: "Regio", cost: 28.0, price: 44.0, stockCurrent: 230, stockMin: 50, stockMax: 600, stockSafety: 40, leadTime: 5, categoryId: catCuidado.id, supplierId: provPG.id, unit: "PZA", location: "E-01-05" },

    // BOTANAS
    { sku: "BOT-001", name: "Sabritas Original 45g", brand: "Sabritas", cost: 8.5, price: 14.0, stockCurrent: 380, stockMin: 60, stockMax: 800, stockSafety: 50, leadTime: 4, categoryId: catBotanas.id, supplierId: provSabritas.id, unit: "PZA", location: "F-01-01" },
    { sku: "BOT-002", name: "Doritos Nacho 65g", brand: "Doritos", cost: 9.0, price: 15.0, stockCurrent: 295, stockMin: 60, stockMax: 700, stockSafety: 45, leadTime: 4, categoryId: catBotanas.id, supplierId: provSabritas.id, unit: "PZA", location: "F-01-02" },
    { sku: "BOT-003", name: "Takis Fuego 56g", brand: "Barcel", cost: 9.5, price: 16.0, stockCurrent: 420, stockMin: 70, stockMax: 900, stockSafety: 55, leadTime: 4, categoryId: catBotanas.id, supplierId: provSabritas.id, unit: "PZA", location: "F-01-03" },
    { sku: "BOT-004", name: "Ruffles 45g", brand: "Ruffles", cost: 8.0, price: 13.5, stockCurrent: 160, stockMin: 50, stockMax: 600, stockSafety: 40, leadTime: 4, categoryId: catBotanas.id, supplierId: provSabritas.id, unit: "PZA", location: "F-01-04" },
    { sku: "BOT-005", name: "Cheetos Bolitas 40g", brand: "Sabritas", cost: 7.5, price: 13.0, stockCurrent: 8, stockMin: 60, stockMax: 700, stockSafety: 45, leadTime: 4, categoryId: catBotanas.id, supplierId: provSabritas.id, unit: "PZA", location: "F-01-05", status: "OUT_OF_STOCK" },
    { sku: "BOT-006", name: "Palomitas Act II Mantequilla 90g", brand: "Act II", cost: 14.0, price: 22.0, stockCurrent: 90, stockMin: 30, stockMax: 400, stockSafety: 25, leadTime: 5, categoryId: catBotanas.id, supplierId: provBimbo.id, unit: "PZA", location: "F-01-06" },

    // DULCERÍA
    { sku: "DUL-001", name: "Chocolate Abuelita 540g", brand: "Nestlé", cost: 52.0, price: 82.0, stockCurrent: 42, stockMin: 15, stockMax: 200, stockSafety: 12, leadTime: 5, categoryId: catDulceria.id, supplierId: provNestle.id, unit: "PZA", location: "G-01-01" },
    { sku: "DUL-002", name: "Mazapán De La Rosa 30g", brand: "De La Rosa", cost: 4.0, price: 7.0, stockCurrent: 500, stockMin: 80, stockMax: 1200, stockSafety: 60, leadTime: 5, categoryId: catDulceria.id, supplierId: provNestle.id, unit: "PZA", location: "G-01-02", status: "SLOW_MOVING" },
    { sku: "DUL-003", name: "Paleta Payaso 40g", brand: "Ricolino", cost: 5.0, price: 9.0, stockCurrent: 310, stockMin: 50, stockMax: 800, stockSafety: 40, leadTime: 5, categoryId: catDulceria.id, supplierId: provNestle.id, unit: "PZA", location: "G-01-03" },
    { sku: "DUL-004", name: "Gansito Marinela 42g", brand: "Marinela", cost: 11.0, price: 18.0, stockCurrent: 185, stockMin: 40, stockMax: 600, stockSafety: 35, leadTime: 3, categoryId: catDulceria.id, supplierId: provBimbo.id, unit: "PZA", location: "G-01-04" },
    { sku: "DUL-005", name: "Pingüinos Marinela 2pz", brand: "Marinela", cost: 13.0, price: 21.0, stockCurrent: 138, stockMin: 35, stockMax: 500, stockSafety: 28, leadTime: 3, categoryId: catDulceria.id, supplierId: provBimbo.id, unit: "PZA", location: "G-01-05" },
    { sku: "DUL-006", name: "Kranky Nestlé 33g", brand: "Nestlé", cost: 8.0, price: 14.0, stockCurrent: 67, stockMin: 25, stockMax: 400, stockSafety: 20, leadTime: 5, categoryId: catDulceria.id, supplierId: provNestle.id, unit: "PZA", location: "G-01-06" },

    // MUERTOS (para demo de producto muerto)
    { sku: "MUE-001", name: "Refresco Boing! 1L (descontinuado)", brand: "Boing", cost: 10.0, price: 18.0, stockCurrent: 280, stockMin: 20, stockMax: 200, stockSafety: 15, leadTime: 14, categoryId: catBebidas.id, supplierId: provCoca.id, unit: "PZA", location: "B-03-01", status: "DEAD" },
    { sku: "MUE-002", name: "Galleta Marías marca propia 250g", brand: "MarcaX", cost: 8.0, price: 12.0, stockCurrent: 130, stockMin: 20, stockMax: 200, stockSafety: 15, leadTime: 10, categoryId: catAbarrotes.id, supplierId: provBimbo.id, unit: "PZA", location: "A-04-01", status: "DEAD" },
  ]

  // Insert products
  const productIds: Record<string, string> = {}
  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        brand: p.brand,
        cost: p.cost,
        price: p.price,
        stockCurrent: p.stockCurrent,
        stockMin: p.stockMin,
        stockMax: p.stockMax,
        stockSafety: p.stockSafety,
        leadTime: p.leadTime,
        unit: p.unit,
        location: p.location,
        status: (p.status as any) ?? "ACTIVE",
        warehouseId: almacen.id,
        categoryId: p.categoryId,
        supplierId: p.supplierId,
      },
    })
    productIds[p.sku] = product.id
  }

  // Inventory movements — generate realistic history for the last 90 days
  const now = new Date()
  const getDate = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000)

  const movementsData = [
    // Coca-Cola 600ml — alta rotación
    { productId: productIds["BEB-001"], type: "INITIAL", qty: 800, cost: 9.5, daysAgo: 90, ref: "INV-INICIAL" },
    { productId: productIds["BEB-001"], type: "PURCHASE_IN", qty: 500, cost: 9.5, daysAgo: 75, ref: "OC-2024-001" },
    { productId: productIds["BEB-001"], type: "SALE_OUT", qty: 200, cost: null, daysAgo: 70 },
    { productId: productIds["BEB-001"], type: "SALE_OUT", qty: 180, cost: null, daysAgo: 60 },
    { productId: productIds["BEB-001"], type: "PURCHASE_IN", qty: 600, cost: 9.5, daysAgo: 55, ref: "OC-2024-005" },
    { productId: productIds["BEB-001"], type: "SALE_OUT", qty: 220, cost: null, daysAgo: 45 },
    { productId: productIds["BEB-001"], type: "SALE_OUT", qty: 190, cost: null, daysAgo: 30 },
    { productId: productIds["BEB-001"], type: "PURCHASE_IN", qty: 400, cost: 9.5, daysAgo: 25, ref: "OC-2024-012" },
    { productId: productIds["BEB-001"], type: "SALE_OUT", qty: 210, cost: null, daysAgo: 15 },
    { productId: productIds["BEB-001"], type: "SALE_OUT", qty: 100, cost: null, daysAgo: 5 },

    // Takis Fuego — alta rotación
    { productId: productIds["BOT-003"], type: "INITIAL", qty: 300, cost: 9.5, daysAgo: 90, ref: "INV-INICIAL" },
    { productId: productIds["BOT-003"], type: "SALE_OUT", qty: 120, cost: null, daysAgo: 80 },
    { productId: productIds["BOT-003"], type: "PURCHASE_IN", qty: 500, cost: 9.5, daysAgo: 70, ref: "OC-2024-002" },
    { productId: productIds["BOT-003"], type: "SALE_OUT", qty: 150, cost: null, daysAgo: 60 },
    { productId: productIds["BOT-003"], type: "SALE_OUT", qty: 130, cost: null, daysAgo: 45 },
    { productId: productIds["BOT-003"], type: "PURCHASE_IN", qty: 400, cost: 9.5, daysAgo: 30, ref: "OC-2024-010" },
    { productId: productIds["BOT-003"], type: "SALE_OUT", qty: 180, cost: null, daysAgo: 15 },
    { productId: productIds["BOT-003"], type: "SALE_OUT", qty: 20, cost: null, daysAgo: 3 },

    // Arroz SOS — rotación media
    { productId: productIds["ABR-001"], type: "INITIAL", qty: 200, cost: 18.5, daysAgo: 90, ref: "INV-INICIAL" },
    { productId: productIds["ABR-001"], type: "PURCHASE_IN", qty: 200, cost: 18.5, daysAgo: 60, ref: "OC-2024-003" },
    { productId: productIds["ABR-001"], type: "SALE_OUT", qty: 80, cost: null, daysAgo: 55 },
    { productId: productIds["ABR-002"], type: "INITIAL", qty: 100, cost: 14.0, daysAgo: 90, ref: "INV-INICIAL" },
    { productId: productIds["ABR-002"], type: "SALE_OUT", qty: 88, cost: null, daysAgo: 70 },

    // Sabritas — alta rotación
    { productId: productIds["BOT-001"], type: "INITIAL", qty: 250, cost: 8.5, daysAgo: 90, ref: "INV-INICIAL" },
    { productId: productIds["BOT-001"], type: "PURCHASE_IN", qty: 400, cost: 8.5, daysAgo: 65, ref: "OC-2024-004" },
    { productId: productIds["BOT-001"], type: "SALE_OUT", qty: 150, cost: null, daysAgo: 60 },
    { productId: productIds["BOT-001"], type: "SALE_OUT", qty: 120, cost: null, daysAgo: 40 },
    { productId: productIds["BOT-001"], type: "PURCHASE_IN", qty: 300, cost: 8.5, daysAgo: 30, ref: "OC-2024-011" },
    { productId: productIds["BOT-001"], type: "SALE_OUT", qty: 100, cost: null, daysAgo: 10 },
    { productId: productIds["BOT-001"], type: "SHRINKAGE", qty: 2, cost: null, daysAgo: 5, ref: "MERMA-001" },

    // Ariel — rotación media
    { productId: productIds["LIM-001"], type: "INITIAL", qty: 100, cost: 52.0, daysAgo: 90, ref: "INV-INICIAL" },
    { productId: productIds["LIM-001"], type: "PURCHASE_IN", qty: 100, cost: 52.0, daysAgo: 55, ref: "OC-2024-006" },
    { productId: productIds["LIM-001"], type: "SALE_OUT", qty: 55, cost: null, daysAgo: 45 },

    // Leche Lala — alta rotación
    { productId: productIds["LAC-001"], type: "INITIAL", qty: 150, cost: 17.5, daysAgo: 90, ref: "INV-INICIAL" },
    { productId: productIds["LAC-001"], type: "PURCHASE_IN", qty: 200, cost: 17.5, daysAgo: 75, ref: "OC-2024-007" },
    { productId: productIds["LAC-001"], type: "SALE_OUT", qty: 180, cost: null, daysAgo: 65 },
    { productId: productIds["LAC-001"], type: "PURCHASE_IN", qty: 200, cost: 17.5, daysAgo: 45, ref: "OC-2024-009" },
    { productId: productIds["LAC-001"], type: "SALE_OUT", qty: 90, cost: null, daysAgo: 20 },

    // Detergente PG — Ajuste
    { productId: productIds["LIM-001"], type: "ADJUSTMENT_IN", qty: 3, cost: 52.0, daysAgo: 20, ref: "AJUSTE-001", notes: "Conteo físico encontró diferencia" },

    // Mazapán — producto muerto (0 ventas)
    { productId: productIds["DUL-002"], type: "INITIAL", qty: 500, cost: 4.0, daysAgo: 90, ref: "INV-INICIAL" },
    { productId: productIds["MUE-001"], type: "INITIAL", qty: 280, cost: 10.0, daysAgo: 90, ref: "INV-INICIAL" },
    { productId: productIds["MUE-002"], type: "INITIAL", qty: 130, cost: 8.0, daysAgo: 90, ref: "INV-INICIAL" },

    // Gansito — rotación media
    { productId: productIds["DUL-004"], type: "INITIAL", qty: 100, cost: 11.0, daysAgo: 90, ref: "INV-INICIAL" },
    { productId: productIds["DUL-004"], type: "PURCHASE_IN", qty: 200, cost: 11.0, daysAgo: 60, ref: "OC-2024-008" },
    { productId: productIds["DUL-004"], type: "SALE_OUT", qty: 115, cost: null, daysAgo: 45 },

    // Doritos
    { productId: productIds["BOT-002"], type: "INITIAL", qty: 200, cost: 9.0, daysAgo: 90, ref: "INV-INICIAL" },
    { productId: productIds["BOT-002"], type: "PURCHASE_IN", qty: 300, cost: 9.0, daysAgo: 60, ref: "OC-2024-013" },
    { productId: productIds["BOT-002"], type: "SALE_OUT", qty: 205, cost: null, daysAgo: 45 },
  ]

  // Replay movements to build stock history
  const stockMap: Record<string, number> = {}
  for (const sku of Object.keys(productIds)) {
    stockMap[productIds[sku]] = 0
  }

  for (const m of movementsData) {
    if (!m.productId) continue
    const before = stockMap[m.productId] ?? 0
    let after = before
    if (["PURCHASE_IN", "ADJUSTMENT_IN", "RETURN_IN", "TRANSFER_IN", "INITIAL"].includes(m.type)) {
      after = before + m.qty
    } else {
      after = before - m.qty
    }
    stockMap[m.productId] = after

    await prisma.inventoryMovement.create({
      data: {
        productId: m.productId,
        warehouseId: almacen.id,
        type: m.type as any,
        quantity: m.qty,
        unitCost: m.cost,
        stockBefore: before,
        stockAfter: after,
        reference: m.ref,
        notes: m.notes,
        createdAt: getDate(m.daysAgo),
      },
    })
  }

  // Alerts
  await prisma.alert.deleteMany()
  const alertsToCreate = [
    { productId: productIds["BEB-007"], type: "OUT_OF_STOCK", level: "RED", title: "Sin stock: Jarritos Tamarindo", message: "Stock actual: 0 pzas. Se requiere compra urgente." },
    { productId: productIds["ABR-002"], type: "LOW_STOCK", level: "RED", title: "Stock crítico: Frijol Isadora", message: "Stock: 12 pzas. Mínimo: 40. Punto de reorden alcanzado." },
    { productId: productIds["BOT-005"], type: "OUT_OF_STOCK", level: "RED", title: "Sin stock: Cheetos Bolitas", message: "Stock actual: 8 pzas. Abastecimiento urgente necesario." },
    { productId: productIds["BEB-006"], type: "REORDER_POINT", level: "YELLOW", title: "Revisar: Powerade Azul", message: "Stock 55 pzas, cerca del mínimo de 60. Planear compra." },
    { productId: productIds["MUE-001"], type: "DEAD_PRODUCT", level: "BLACK", title: "Producto muerto: Refresco Boing!", message: "Sin ventas en 90 días. Inventario inmovilizado: $2,800." },
    { productId: productIds["MUE-002"], type: "DEAD_PRODUCT", level: "BLACK", title: "Producto muerto: Galleta Marca Propia", message: "Sin ventas en 90 días. Inventario inmovilizado: $1,040." },
    { productId: productIds["DUL-002"], type: "EXCESS_STOCK", level: "YELLOW", title: "Sobreinventario: Mazapán De La Rosa", message: "Stock 500 pzas vs máximo 1200. Sin rotación en 90 días." },
    { productId: productIds["ABR-004"], type: "EXCESS_STOCK", level: "YELLOW", title: "Sobreinventario: Azúcar Zulka", message: "Stock 450 pzas supera el máximo de 400. Rotación lenta." },
  ]

  for (const alert of alertsToCreate) {
    await prisma.alert.create({ data: alert as any })
  }

  // Purchase Orders
  await prisma.purchaseOrder.deleteMany()
  const oc1 = await prisma.purchaseOrder.create({
    data: {
      supplierId: provCoca.id,
      orderNumber: "OC-2024-015",
      status: "CONFIRMED",
      issuedDate: getDate(5),
      expectedDate: getDate(-2),
      subtotal: 9500,
      tax: 1520,
      total: 11020,
      items: {
        create: [
          { productId: productIds["BEB-001"], quantity: 500, unitCost: 9.5, total: 4750 },
          { productId: productIds["BEB-007"], quantity: 300, unitCost: 8.0, total: 2400 },
          { productId: productIds["BEB-003"], quantity: 300, unitCost: 7.0, total: 2100 },
        ],
      },
    },
  })

  const oc2 = await prisma.purchaseOrder.create({
    data: {
      supplierId: provSabritas.id,
      orderNumber: "OC-2024-016",
      status: "DRAFT",
      issuedDate: getDate(1),
      subtotal: 5850,
      tax: 936,
      total: 6786,
      items: {
        create: [
          { productId: productIds["BOT-003"], quantity: 300, unitCost: 9.5, total: 2850 },
          { productId: productIds["BOT-005"], quantity: 200, unitCost: 7.5, total: 1500 },
          { productId: productIds["BOT-001"], quantity: 200, unitCost: 8.5, total: 1700 },
        ],
      },
    },
  })

  console.log("✅ Seed completado:")
  console.log(`   📦 ${productsData.length} productos`)
  console.log(`   🔄 ${movementsData.length} movimientos`)
  console.log(`   🚨 ${alertsToCreate.length} alertas`)
  console.log(`   🛒 2 órdenes de compra`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
