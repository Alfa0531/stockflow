import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed Dulcería...")

  // Clean up in dependency order
  await prisma.purchaseOrderItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.alert.deleteMany()
  await prisma.inventoryMovement.deleteMany()
  await prisma.product.deleteMany()
  await prisma.warehouse.deleteMany()
  await prisma.category.deleteMany()
  await prisma.supplier.deleteMany()

  // Warehouse
  const almacen = await prisma.warehouse.create({
    data: { name: "Dulcería Central", code: "DUL-01", address: "Calle Morelos 120, Col. Centro, CDMX" },
  })

  // Categories
  const catPicantes = await prisma.category.create({ data: { name: "Picantes y Enchilados", description: "Dulces con chile y sabores picantes" } })
  const catPaletas  = await prisma.category.create({ data: { name: "Paletas y Caramelos",   description: "Paletas, chupetes y caramelos duros" } })
  const catDulces   = await prisma.category.create({ data: { name: "Dulces Suaves",          description: "Malvaviscos, gomitas y dulces blandos" } })
  const catImport   = await prisma.category.create({ data: { name: "Importados",             description: "Dulces de importación" } })

  // Suppliers
  const provDelaRosa = await prisma.supplier.create({ data: { name: "Distribuidora De La Rosa", code: "PROV-001", email: "pedidos@delarosa.com.mx",  phone: "55-5100-2000", contact: "Carlos Fuentes", leadTime: 3,  paymentTerms: 15, rating: 4.8 } })
  const provValentina = await prisma.supplier.create({ data: { name: "Valentina S.A. de C.V.",    code: "PROV-002", email: "ventas@valentina.com.mx",  phone: "55-5200-3000", contact: "Rosa Mendoza",   leadTime: 5,  paymentTerms: 30, rating: 4.6 } })
  const provDistMX   = await prisma.supplier.create({ data: { name: "Distribuidora Dulcería MX",  code: "PROV-003", email: "pedidos@dulceriamx.com",   phone: "55-5300-4000", contact: "Marco Torres",   leadTime: 4,  paymentTerms: 30, rating: 4.5 } })
  const provAsian    = await prisma.supplier.create({ data: { name: "Importadora Asian Sweets",   code: "PROV-004", email: "orders@asiansweets.mx",    phone: "55-5400-5000", contact: "Yuki Tanaka",    leadTime: 14, paymentTerms: 45, rating: 4.2 } })

  // Products
  const productsData = [
    { sku: "VAL-001", name: "Salsa Valentina 34ml",        brand: "Valentina",   cost: 8.50,  price: 15.00, stockCurrent: 420, stockMin: 80,  stockMax: 800, stockSafety: 60,  leadTime: 5,  unit: "PZA", location: "A-01-01", categoryId: catPicantes.id, supplierId: provValentina.id },
    { sku: "MIG-001", name: "Miguelito polvo 6g",           brand: "Miguelito",   cost: 1.50,  price: 3.00,  stockCurrent: 38,  stockMin: 100, stockMax: 1000,stockSafety: 80,  leadTime: 3,  unit: "PZA", location: "A-01-02", categoryId: catPicantes.id, supplierId: provDelaRosa.id },
    { sku: "REB-001", name: "Rebanaditas paleta",           brand: "De La Rosa",  cost: 2.50,  price: 4.50,  stockCurrent: 360, stockMin: 60,  stockMax: 800, stockSafety: 50,  leadTime: 3,  unit: "PZA", location: "A-01-03", categoryId: catPicantes.id, supplierId: provDelaRosa.id },
    { sku: "DVI-001", name: "Dulce Vida tamarindo 15g",     brand: "Dulce Vida",  cost: 3.50,  price: 6.00,  stockCurrent: 185, stockMin: 40,  stockMax: 500, stockSafety: 35,  leadTime: 4,  unit: "PZA", location: "B-01-01", categoryId: catDulces.id,   supplierId: provDistMX.id },
    { sku: "MAL-001", name: "Paleta de Malvavisco 20g",     brand: "Ricolino",    cost: 4.00,  price: 7.00,  stockCurrent: 560, stockMin: 50,  stockMax: 400, stockSafety: 40,  leadTime: 4,  unit: "PZA", location: "C-01-01", categoryId: catPaletas.id,  supplierId: provDistMX.id },
    { sku: "TAM-001", name: "Tama-Roca pieza",              brand: "Tama-Roca",   cost: 2.00,  price: 4.00,  stockCurrent: 0,   stockMin: 80,  stockMax: 600, stockSafety: 60,  leadTime: 4,  unit: "PZA", location: "A-02-01", categoryId: catPicantes.id, supplierId: provDistMX.id,   status: "OUT_OF_STOCK" },
    { sku: "NIS-001", name: "Nishikawa japonés paquete",    brand: "Nishikawa",   cost: 12.00, price: 22.00, stockCurrent: 75,  stockMin: 15,  stockMax: 150, stockSafety: 12,  leadTime: 14, unit: "PZA", location: "D-01-01", categoryId: catImport.id,   supplierId: provAsian.id },
    { sku: "CHO-001", name: "Dulces Chompys bolsa 50g",     brand: "Chompys",     cost: 5.00,  price: 9.00,  stockCurrent: 155, stockMin: 30,  stockMax: 400, stockSafety: 25,  leadTime: 4,  unit: "PZA", location: "B-01-02", categoryId: catDulces.id,   supplierId: provDistMX.id },
    { sku: "BOL-001", name: "Bolitochas caja 24 pzas",      brand: "De La Rosa",  cost: 28.00, price: 50.00, stockCurrent: 18,  stockMin: 30,  stockMax: 300, stockSafety: 25,  leadTime: 3,  unit: "CJA", location: "C-01-02", categoryId: catPaletas.id,  supplierId: provDelaRosa.id },
    { sku: "COS-001", name: "Costa Brava malvavisco 25g",   brand: "Costa Brava", cost: 3.00,  price: 5.50,  stockCurrent: 320, stockMin: 20,  stockMax: 200, stockSafety: 15,  leadTime: 5,  unit: "PZA", location: "B-02-01", categoryId: catDulces.id,   supplierId: provDistMX.id,   status: "DEAD" },
  ]

  const productIds: Record<string, string> = {}
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        sku: p.sku, name: p.name, brand: p.brand,
        cost: p.cost, price: p.price,
        stockCurrent: p.stockCurrent, stockMin: p.stockMin, stockMax: p.stockMax, stockSafety: p.stockSafety,
        leadTime: p.leadTime, unit: p.unit, location: p.location,
        status: (p.status as any) ?? "ACTIVE",
        warehouseId: almacen.id, categoryId: p.categoryId, supplierId: p.supplierId,
      },
    })
    productIds[p.sku] = product.id
  }

  const now = new Date()
  const d = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000)

  // Movements — history consistent with stockCurrent above
  const movementsData = [
    // Salsa Valentina: 300 + 400 - 150 - 120 + 200 - 130 - 80 = 420
    { sku: "VAL-001", type: "INITIAL",     qty: 300, cost: 8.50, daysAgo: 90, ref: "INV-INICIAL" },
    { sku: "VAL-001", type: "PURCHASE_IN", qty: 400, cost: 8.50, daysAgo: 60, ref: "OC-001" },
    { sku: "VAL-001", type: "SALE_OUT",    qty: 150, cost: null, daysAgo: 55 },
    { sku: "VAL-001", type: "SALE_OUT",    qty: 120, cost: null, daysAgo: 40 },
    { sku: "VAL-001", type: "PURCHASE_IN", qty: 200, cost: 8.50, daysAgo: 25, ref: "OC-006" },
    { sku: "VAL-001", type: "SALE_OUT",    qty: 130, cost: null, daysAgo: 20 },
    { sku: "VAL-001", type: "SALE_OUT",    qty:  80, cost: null, daysAgo:  5 },

    // Miguelito: 500 - 200 - 150 + 200 - 180 - 132 = 38 ← stock bajo, urgente
    { sku: "MIG-001", type: "INITIAL",     qty: 500, cost: 1.50, daysAgo: 90, ref: "INV-INICIAL" },
    { sku: "MIG-001", type: "SALE_OUT",    qty: 200, cost: null, daysAgo: 75 },
    { sku: "MIG-001", type: "SALE_OUT",    qty: 150, cost: null, daysAgo: 55 },
    { sku: "MIG-001", type: "PURCHASE_IN", qty: 200, cost: 1.50, daysAgo: 45, ref: "OC-002" },
    { sku: "MIG-001", type: "SALE_OUT",    qty: 180, cost: null, daysAgo: 30 },
    { sku: "MIG-001", type: "SALE_OUT",    qty: 132, cost: null, daysAgo:  8 },

    // Rebanaditas: 200 + 400 - 100 - 80 + 300 - 120 - 240 = 360
    { sku: "REB-001", type: "INITIAL",     qty: 200, cost: 2.50, daysAgo: 90, ref: "INV-INICIAL" },
    { sku: "REB-001", type: "PURCHASE_IN", qty: 400, cost: 2.50, daysAgo: 65, ref: "OC-003" },
    { sku: "REB-001", type: "SALE_OUT",    qty: 100, cost: null, daysAgo: 60 },
    { sku: "REB-001", type: "SALE_OUT",    qty:  80, cost: null, daysAgo: 45 },
    { sku: "REB-001", type: "PURCHASE_IN", qty: 300, cost: 2.50, daysAgo: 30, ref: "OC-007" },
    { sku: "REB-001", type: "SALE_OUT",    qty: 120, cost: null, daysAgo: 20 },
    { sku: "REB-001", type: "SALE_OUT",    qty: 240, cost: null, daysAgo:  3 },

    // Dulce Vida: 150 + 200 - 80 - 85 = 185
    { sku: "DVI-001", type: "INITIAL",     qty: 150, cost: 3.50, daysAgo: 90, ref: "INV-INICIAL" },
    { sku: "DVI-001", type: "PURCHASE_IN", qty: 200, cost: 3.50, daysAgo: 60, ref: "OC-004" },
    { sku: "DVI-001", type: "SALE_OUT",    qty:  80, cost: null, daysAgo: 50 },
    { sku: "DVI-001", type: "SALE_OUT",    qty:  85, cost: null, daysAgo: 22 },

    // Paleta Malvavisco: 300 + 350 - 60 - 30 = 560 ← sobre el máximo de 400
    { sku: "MAL-001", type: "INITIAL",     qty: 300, cost: 4.00, daysAgo: 90, ref: "INV-INICIAL" },
    { sku: "MAL-001", type: "PURCHASE_IN", qty: 350, cost: 4.00, daysAgo: 60, ref: "OC-005" },
    { sku: "MAL-001", type: "SALE_OUT",    qty:  60, cost: null, daysAgo: 55 },
    { sku: "MAL-001", type: "SALE_OUT",    qty:  30, cost: null, daysAgo: 28 },

    // Tama-Roca: 200 + 300 - 250 - 200 - 50 = 0 ← agotado
    { sku: "TAM-001", type: "INITIAL",     qty: 200, cost: 2.00, daysAgo: 90, ref: "INV-INICIAL" },
    { sku: "TAM-001", type: "PURCHASE_IN", qty: 300, cost: 2.00, daysAgo: 65, ref: "OC-008" },
    { sku: "TAM-001", type: "SALE_OUT",    qty: 250, cost: null, daysAgo: 50 },
    { sku: "TAM-001", type: "SALE_OUT",    qty: 200, cost: null, daysAgo: 25 },
    { sku: "TAM-001", type: "SALE_OUT",    qty:  50, cost: null, daysAgo:  9 },

    // Nishikawa: 50 + 80 - 30 - 25 = 75
    { sku: "NIS-001", type: "INITIAL",     qty:  50, cost: 12.00, daysAgo: 90, ref: "INV-INICIAL" },
    { sku: "NIS-001", type: "PURCHASE_IN", qty:  80, cost: 12.00, daysAgo: 55, ref: "OC-009" },
    { sku: "NIS-001", type: "SALE_OUT",    qty:  30, cost: null,  daysAgo: 40 },
    { sku: "NIS-001", type: "SALE_OUT",    qty:  25, cost: null,  daysAgo: 15 },

    // Chompys: 100 + 200 - 75 - 70 = 155
    { sku: "CHO-001", type: "INITIAL",     qty: 100, cost: 5.00, daysAgo: 90, ref: "INV-INICIAL" },
    { sku: "CHO-001", type: "PURCHASE_IN", qty: 200, cost: 5.00, daysAgo: 60, ref: "OC-010" },
    { sku: "CHO-001", type: "SALE_OUT",    qty:  75, cost: null, daysAgo: 50 },
    { sku: "CHO-001", type: "SALE_OUT",    qty:  70, cost: null, daysAgo: 22 },

    // Bolitochas: 80 + 200 - 120 + 150 - 180 - 112 = 18 ← stock bajo
    { sku: "BOL-001", type: "INITIAL",     qty:  80, cost: 28.00, daysAgo: 90, ref: "INV-INICIAL" },
    { sku: "BOL-001", type: "PURCHASE_IN", qty: 200, cost: 28.00, daysAgo: 65, ref: "OC-011" },
    { sku: "BOL-001", type: "SALE_OUT",    qty: 120, cost: null,  daysAgo: 55 },
    { sku: "BOL-001", type: "PURCHASE_IN", qty: 150, cost: 28.00, daysAgo: 35, ref: "OC-013" },
    { sku: "BOL-001", type: "SALE_OUT",    qty: 180, cost: null,  daysAgo: 18 },
    { sku: "BOL-001", type: "SALE_OUT",    qty: 112, cost: null,  daysAgo:  4 },

    // Costa Brava: 320 inicial, sin ventas ← producto muerto
    { sku: "COS-001", type: "INITIAL",     qty: 320, cost: 3.00, daysAgo: 90, ref: "INV-INICIAL" },
  ]

  const stockMap: Record<string, number> = {}
  for (const id of Object.values(productIds)) stockMap[id] = 0

  for (const m of movementsData) {
    const productId = productIds[m.sku]
    if (!productId) continue
    const before = stockMap[productId]
    const isIn = ["PURCHASE_IN", "ADJUSTMENT_IN", "RETURN_IN", "TRANSFER_IN", "INITIAL"].includes(m.type)
    const after = isIn ? before + m.qty : before - m.qty
    stockMap[productId] = after
    await prisma.inventoryMovement.create({
      data: {
        productId,
        warehouseId: almacen.id,
        type: m.type as any,
        quantity: m.qty,
        unitCost: m.cost,
        stockBefore: before,
        stockAfter: after,
        reference: m.ref ?? null,
        createdAt: d(m.daysAgo),
      },
    })
  }

  // Alerts
  const alertsData = [
    { sku: "TAM-001", type: "OUT_OF_STOCK",  level: "RED",    title: "Sin stock: Tama-Roca",              message: "Stock: 0 pzas. Se agotó hace 9 días. Compra urgente." },
    { sku: "MIG-001", type: "LOW_STOCK",     level: "RED",    title: "Stock crítico: Miguelito polvo",    message: "Stock: 38 pzas. Mínimo: 100. Alta rotación — se agotará en ~3 días." },
    { sku: "BOL-001", type: "LOW_STOCK",     level: "RED",    title: "Stock bajo: Bolitochas caja",       message: "Stock: 18 cajas. Mínimo: 30. Planear reorden inmediato." },
    { sku: "MAL-001", type: "EXCESS_STOCK",  level: "YELLOW", title: "Sobreinventario: Paleta Malvavisco","message": "Stock: 560 pzas vs máximo de 400. Rotación lenta. Considerar promoción." },
    { sku: "COS-001", type: "DEAD_PRODUCT",  level: "BLACK",  title: "Producto muerto: Costa Brava",      message: "Sin ventas en 90 días. Inventario inmovilizado: $960. Liquidar o devolver." },
    { sku: "COS-001", type: "EXCESS_STOCK",  level: "BLACK",  title: "Exceso severo: Costa Brava",        message: "320 pzas vs máximo de 200. Sin rotación. Acción requerida." },
  ]

  for (const a of alertsData) {
    await prisma.alert.create({
      data: { productId: productIds[a.sku], type: a.type as any, level: a.level as any, title: a.title, message: a.message },
    })
  }

  // Purchase Orders
  const oc1 = await prisma.purchaseOrder.create({
    data: {
      supplierId: provDelaRosa.id,
      orderNumber: "OC-2024-020",
      status: "SENT",
      issuedDate: d(2),
      expectedDate: d(-3),
      subtotal: 1588,
      tax: 254,
      total: 1842,
      notes: "Urgente por Tama-Roca agotado y Miguelito en mínimo crítico",
      items: {
        create: [
          { productId: productIds["MIG-001"], quantity: 600, unitCost: 1.50, total: 900  },
          { productId: productIds["BOL-001"], quantity: 100, unitCost: 28.00, total: 2800 },
        ],
      },
    },
  })

  const oc2 = await prisma.purchaseOrder.create({
    data: {
      supplierId: provDistMX.id,
      orderNumber: "OC-2024-021",
      status: "DRAFT",
      issuedDate: d(1),
      subtotal: 1800,
      tax: 288,
      total: 2088,
      items: {
        create: [
          { productId: productIds["TAM-001"], quantity: 500, unitCost: 2.00,  total: 1000 },
          { productId: productIds["REB-001"], quantity: 200, unitCost: 2.50,  total: 500  },
          { productId: productIds["CHO-001"], quantity: 100, unitCost: 5.00,  total: 500  },
        ],
      },
    },
  })

  console.log("✅ Seed completado:")
  console.log(`   📦 ${productsData.length} productos`)
  console.log(`   🔄 ${movementsData.length} movimientos`)
  console.log(`   🚨 ${alertsData.length} alertas`)
  console.log(`   🛒 2 órdenes de compra`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
