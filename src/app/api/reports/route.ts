import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateABC } from "@/lib/inventory-engine"

export async function GET() {
  const [products, movements] = await Promise.all([
    prisma.product.findMany({ include: { category: true, supplier: true } }),
    prisma.inventoryMovement.findMany({
      where: { type: "SALE_OUT", createdAt: { gte: new Date(Date.now() - 90 * 86400000) } },
      include: { product: true },
    }),
  ])

  // ABC Analysis
  const salesByProduct: Record<string, number> = {}
  for (const m of movements) {
    salesByProduct[m.productId] = (salesByProduct[m.productId] ?? 0) + m.quantity * m.product.price
  }
  const abcInput = products.map(p => ({
    id: p.id, name: p.name, sku: p.sku,
    annualValue: (salesByProduct[p.id] ?? 0) * 4, // 90 days → annual
  }))
  const abc = calculateABC(abcInput)

  // Rotation rate
  const rotation = products.map(p => {
    const sales = movements.filter(m => m.productId === p.id).reduce((s, m) => s + m.quantity, 0)
    const avgStock = p.stockCurrent
    const rotationRate = avgStock > 0 ? (sales / avgStock) : 0
    const daysToTurn = rotationRate > 0 ? Math.round(90 / rotationRate) : 999
    return { id: p.id, sku: p.sku, name: p.name, category: p.category?.name, stockCurrent: p.stockCurrent, sales90d: sales, rotationRate: Math.round(rotationRate * 100) / 100, daysToTurn, inventoryValue: p.stockCurrent * p.cost }
  }).sort((a, b) => b.rotationRate - a.rotationRate)

  // Aging inventory
  const now = Date.now()
  const lastMovement: Record<string, number> = {}
  for (const m of await prisma.inventoryMovement.findMany({ orderBy: { createdAt: "desc" } })) {
    if (!lastMovement[m.productId]) lastMovement[m.productId] = m.createdAt.getTime()
  }
  const aging = products.map(p => {
    const last = lastMovement[p.id] ?? p.createdAt.getTime()
    const days = Math.floor((now - last) / 86400000)
    const bucket = days <= 30 ? "0-30" : days <= 60 ? "31-60" : days <= 90 ? "61-90" : "90+"
    return { id: p.id, sku: p.sku, name: p.name, stockCurrent: p.stockCurrent, inventoryValue: p.stockCurrent * p.cost, daysSinceMovement: days, bucket, status: p.status }
  }).sort((a, b) => b.daysSinceMovement - a.daysSinceMovement)

  const agingBuckets = ["0-30", "31-60", "61-90", "90+"].map(bucket => ({
    bucket,
    count: aging.filter(a => a.bucket === bucket).length,
    value: aging.filter(a => a.bucket === bucket).reduce((s, a) => s + a.inventoryValue, 0),
  }))

  // Dead products
  const dead = products.filter(p => p.status === "DEAD" || (p.stockCurrent > 0 && !salesByProduct[p.id]))
    .map(p => ({ ...p, inventoryValue: p.stockCurrent * p.cost, daysSinceMovement: Math.floor((now - (lastMovement[p.id] ?? p.createdAt.getTime())) / 86400000) }))

  return NextResponse.json({ abc, rotation, aging, agingBuckets, dead })
}
