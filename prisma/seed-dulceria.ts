import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🍬 Iniciando seed de dulcería...")

  // Warehouse
  const almacen = await prisma.warehouse.upsert({
    where: { code: "ALM-01" },
    update: {},
    create: { name: "Almacén Principal", code: "ALM-01", address: "Bodega Principal" },
  })

  // Category
  const catDulces = await prisma.category.upsert({
    where: { name: "Dulces y Botanas" },
    update: {},
    create: { name: "Dulces y Botanas", description: "Dulces, paletas y botanas mexicanas" },
  })

  // Supplier (la fábrica)
  const fabrica = await prisma.supplier.upsert({
    where: { code: "FAB-001" },
    update: {},
    create: {
      name: "Fábrica Principal",
      code: "FAB-001",
      contact: "Producción",
      leadTime: 3,
      paymentTerms: 30,
      rating: 5.0,
    },
  })

  // ─────────────────────────────────────────────────
  // PRODUCTOS — cada presentación es su propio SKU
  // Barcode = EAN-13 del fabricante (placeholder por ahora)
  // En la operación real: escanear la caja para registrarlo
  // ─────────────────────────────────────────────────
  const products = [
    // SALSA VALENTINA
    { sku: "VAL-C12",  name: "Salsa Valentina — Caja 12 pz",       barcode: "", cost: 85,  price: 120, stockCurrent: 80,  stockMin: 20, stockMax: 200, leadTime: 3 },
    { sku: "VAL-C24",  name: "Salsa Valentina — Caja 24 pz",       barcode: "", cost: 160, price: 220, stockCurrent: 45,  stockMin: 10, stockMax: 100, leadTime: 3 },

    // MIGUELITO
    { sku: "MIG-C50",  name: "Miguelito — Caja 50 sobres",         barcode: "", cost: 55,  price: 80,  stockCurrent: 120, stockMin: 30, stockMax: 300, leadTime: 3 },
    { sku: "MIG-C100", name: "Miguelito — Caja 100 sobres",        barcode: "", cost: 100, price: 150, stockCurrent: 65,  stockMin: 15, stockMax: 150, leadTime: 3 },

    // REBANADITAS
    { sku: "REB-C40",  name: "Rebanaditas Paleta — Caja 40 pz",    barcode: "", cost: 70,  price: 100, stockCurrent: 90,  stockMin: 20, stockMax: 200, leadTime: 3 },
    { sku: "REB-C80",  name: "Rebanaditas Paleta — Caja 80 pz",    barcode: "", cost: 130, price: 185, stockCurrent: 40,  stockMin: 10, stockMax: 100, leadTime: 3 },

    // DULCE VIDA
    { sku: "DVI-C24",  name: "Dulce Vida — Caja 24 pz",            barcode: "", cost: 60,  price: 90,  stockCurrent: 55,  stockMin: 15, stockMax: 150, leadTime: 3 },
    { sku: "DVI-C48",  name: "Dulce Vida — Caja 48 pz",            barcode: "", cost: 110, price: 165, stockCurrent: 30,  stockMin: 10, stockMax: 100, leadTime: 3 },

    // PALETAS DE MALVAVISCO
    { sku: "MAL-C30",  name: "Paletas Malvavisco — Caja 30 pz",    barcode: "", cost: 90,  price: 130, stockCurrent: 70,  stockMin: 20, stockMax: 200, leadTime: 3 },
    { sku: "MAL-C60",  name: "Paletas Malvavisco — Caja 60 pz",    barcode: "", cost: 170, price: 240, stockCurrent: 25,  stockMin: 8,  stockMax: 80,  leadTime: 3 },

    // TAMA-ROCA
    { sku: "TAM-C50",  name: "Tama-Roca — Caja 50 pz",             barcode: "", cost: 65,  price: 95,  stockCurrent: 110, stockMin: 25, stockMax: 250, leadTime: 3 },
    { sku: "TAM-C100", name: "Tama-Roca — Caja 100 pz",            barcode: "", cost: 120, price: 175, stockCurrent: 50,  stockMin: 12, stockMax: 120, leadTime: 3 },

    // NISHIKAWA JAPONÉS
    { sku: "NIS-C24",  name: "Nishikawa Japonés — Caja 24 pz",     barcode: "", cost: 95,  price: 140, stockCurrent: 35,  stockMin: 10, stockMax: 100, leadTime: 5 },
    { sku: "NIS-C48",  name: "Nishikawa Japonés — Caja 48 pz",     barcode: "", cost: 180, price: 260, stockCurrent: 15,  stockMin: 5,  stockMax: 60,  leadTime: 5 },

    // DULCES CHOMPYS
    { sku: "CHO-C50",  name: "Dulces Chompys — Caja 50 pz",        barcode: "", cost: 50,  price: 75,  stockCurrent: 140, stockMin: 30, stockMax: 300, leadTime: 3 },
    { sku: "CHO-C100", name: "Dulces Chompys — Caja 100 pz",       barcode: "", cost: 95,  price: 140, stockCurrent: 60,  stockMin: 15, stockMax: 150, leadTime: 3 },

    // BOLITOCHAS
    { sku: "BOL-C50",  name: "Bolitochas — Caja 50 pz",            barcode: "", cost: 45,  price: 68,  stockCurrent: 200, stockMin: 40, stockMax: 400, leadTime: 3 },
    { sku: "BOL-C100", name: "Bolitochas — Caja 100 pz",           barcode: "", cost: 85,  price: 125, stockCurrent: 80,  stockMin: 20, stockMax: 200, leadTime: 3 },

    // COSTA BRAVA
    { sku: "COB-C24",  name: "Costa Brava — Caja 24 pz",           barcode: "", cost: 75,  price: 110, stockCurrent: 45,  stockMin: 12, stockMax: 120, leadTime: 3 },
    { sku: "COB-C48",  name: "Costa Brava — Caja 48 pz",           barcode: "", cost: 140, price: 200, stockCurrent: 20,  stockMin: 6,  stockMax: 60,  leadTime: 3 },
  ]

  const savedIds: Record<string, string> = {}

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } })
    if (existing) {
      savedIds[p.sku] = existing.id
      continue
    }
    const prod = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        barcode: p.barcode || null,
        unit: "CAJA",
        cost: p.cost,
        price: p.price,
        stockCurrent: p.stockCurrent,
        stockMin: p.stockMin,
        stockMax: p.stockMax,
        stockSafety: Math.ceil(p.stockMin * 0.5),
        leadTime: p.leadTime,
        status: "ACTIVE",
        warehouseId: almacen.id,
        categoryId: catDulces.id,
        supplierId: fabrica.id,
      },
    })
    savedIds[p.sku] = prod.id

    // Movimiento inicial
    await prisma.inventoryMovement.create({
      data: {
        productId: prod.id,
        warehouseId: almacen.id,
        type: "INITIAL",
        quantity: p.stockCurrent,
        unitCost: p.cost,
        stockBefore: 0,
        stockAfter: p.stockCurrent,
        notes: "Stock inicial",
      },
    })
  }

  // Movimientos de ejemplo (ventas y entradas recientes)
  const getDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000)

  const movements = [
    { sku: "VAL-C12",  type: "SALE_OUT",    qty: 15, daysAgo: 2,  ref: "VTA-0041" },
    { sku: "VAL-C12",  type: "SALE_OUT",    qty: 10, daysAgo: 5,  ref: "VTA-0038" },
    { sku: "MIG-C100", type: "SALE_OUT",    qty: 20, daysAgo: 1,  ref: "VTA-0042" },
    { sku: "MIG-C50",  type: "SALE_OUT",    qty: 30, daysAgo: 3,  ref: "VTA-0040" },
    { sku: "BOL-C100", type: "SALE_OUT",    qty: 25, daysAgo: 1,  ref: "VTA-0043" },
    { sku: "BOL-C50",  type: "SALE_OUT",    qty: 40, daysAgo: 4,  ref: "VTA-0039" },
    { sku: "TAM-C50",  type: "SALE_OUT",    qty: 20, daysAgo: 2,  ref: "VTA-0041" },
    { sku: "CHO-C50",  type: "SALE_OUT",    qty: 35, daysAgo: 6,  ref: "VTA-0037" },
    { sku: "REB-C40",  type: "SALE_OUT",    qty: 18, daysAgo: 3,  ref: "VTA-0040" },
    { sku: "NIS-C24",  type: "SALE_OUT",    qty: 8,  daysAgo: 7,  ref: "VTA-0036" },
    { sku: "MAL-C30",  type: "PURCHASE_IN", qty: 50, daysAgo: 5,  ref: "ENT-0012", cost: 90 },
    { sku: "VAL-C24",  type: "PURCHASE_IN", qty: 30, daysAgo: 4,  ref: "ENT-0013", cost: 160 },
    { sku: "BOL-C100", type: "PURCHASE_IN", qty: 60, daysAgo: 8,  ref: "ENT-0011", cost: 85 },
  ]

  for (const m of movements) {
    const productId = savedIds[m.sku]
    if (!productId) continue
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) continue
    const isIn = m.type === "PURCHASE_IN"
    const stockBefore = product.stockCurrent
    const stockAfter = isIn ? stockBefore + m.qty : Math.max(0, stockBefore - m.qty)
    await prisma.inventoryMovement.create({
      data: {
        productId,
        warehouseId: almacen.id,
        type: m.type as any,
        quantity: m.qty,
        unitCost: (m as any).cost ?? null,
        stockBefore,
        stockAfter,
        reference: m.ref,
        createdAt: getDate(m.daysAgo),
      },
    })
    await prisma.product.update({ where: { id: productId }, data: { stockCurrent: stockAfter } })
  }

  console.log(`✅ ${products.length} presentaciones de productos creadas`)
  console.log(`✅ ${movements.length} movimientos de ejemplo`)
  console.log(`\n📌 Siguiente paso: escanear cada caja real para registrar su barcode`)
  console.log(`   Ve a /productos → editar producto → campo Barcode EAN`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
