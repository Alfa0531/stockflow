import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const [products, movements, alerts] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, supplier: true },
    }),
    prisma.inventoryMovement.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 90 * 86400000) } },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.alert.findMany({ where: { resolved: false }, include: { product: true } }),
  ])

  const totalInventoryValue = products.reduce((s, p) => s + p.stockCurrent * p.cost, 0)
  const activeProducts = products.filter((p) => p.status === "ACTIVE").length
  const deadProducts = products.filter((p) => p.status === "DEAD").length
  const lowStockProducts = products.filter((p) => p.stockCurrent > 0 && p.stockCurrent <= p.stockMin).length
  const outOfStockProducts = products.filter((p) => p.stockCurrent === 0).length
  const excessProducts = products.filter((p) => p.stockCurrent > p.stockMax && p.stockMax > 0).length

  // Sales by product (SALE_OUT movements)
  const salesMap: Record<string, { name: string; sku: string; units: number; revenue: number }> = {}
  for (const m of movements) {
    if (m.type !== "SALE_OUT") continue
    if (!salesMap[m.productId]) {
      salesMap[m.productId] = { name: m.product.name, sku: m.product.sku, units: 0, revenue: 0 }
    }
    salesMap[m.productId].units += m.quantity
    salesMap[m.productId].revenue += m.quantity * m.product.price
  }
  const topProducts = Object.values(salesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Monthly movement chart (last 6 months)
  const monthlyData: Record<string, { month: string; entradas: number; salidas: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleString("es-MX", { month: "short", year: "2-digit" })
    monthlyData[key] = { month: label, entradas: 0, salidas: 0 }
  }
  for (const m of movements) {
    const key = `${m.createdAt.getFullYear()}-${String(m.createdAt.getMonth() + 1).padStart(2, "0")}`
    if (!monthlyData[key]) continue
    if (["PURCHASE_IN", "ADJUSTMENT_IN", "RETURN_IN", "INITIAL"].includes(m.type)) {
      monthlyData[key].entradas += m.quantity
    } else {
      monthlyData[key].salidas += m.quantity
    }
  }

  // Category distribution
  const catMap: Record<string, { name: string; value: number }> = {}
  for (const p of products) {
    const cat = p.category?.name ?? "Sin categoría"
    if (!catMap[cat]) catMap[cat] = { name: cat, value: 0 }
    catMap[cat].value += p.stockCurrent * p.cost
  }
  const categoryData = Object.values(catMap).sort((a, b) => b.value - a.value)

  return NextResponse.json({
    kpis: {
      totalInventoryValue,
      activeProducts,
      deadProducts,
      lowStockProducts,
      outOfStockProducts,
      excessProducts,
      totalProducts: products.length,
      criticalAlerts: alerts.filter((a) => a.level === "RED" || a.level === "BLACK").length,
    },
    topProducts,
    monthlyChart: Object.values(monthlyData),
    categoryData,
    recentAlerts: alerts.slice(0, 5),
  })
}
