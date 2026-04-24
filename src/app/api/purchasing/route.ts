import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateInventoryMetrics } from "@/lib/inventory-engine"

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      category: true, supplier: true,
      movements: {
        where: {
          type: "SALE_OUT",
          createdAt: { gte: new Date(Date.now() - 90 * 86400000) },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  const analysis = products.map((p) => {
    const totalSales = p.movements.reduce((s, m) => s + m.quantity, 0)
    const avgDailyDemand = totalSales / 90
    const demandValues = p.movements.map(m => m.quantity)
    const mean = demandValues.length > 0 ? demandValues.reduce((s, v) => s + v, 0) / demandValues.length : 0
    const variance = demandValues.length > 1
      ? demandValues.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (demandValues.length - 1)
      : 0
    const stdDevDemand = Math.sqrt(variance)

    const metrics = calculateInventoryMetrics({
      stockCurrent: p.stockCurrent,
      stockMin: p.stockMin,
      stockMax: p.stockMax,
      stockSafety: p.stockSafety,
      leadTime: p.leadTime,
      avgDailyDemand,
      stdDevDemand,
      annualDemand: avgDailyDemand * 365,
      orderCost: 150,
      holdingCost: p.cost * 0.25,
      status: p.status,
    })

    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      brand: p.brand,
      unit: p.unit,
      cost: p.cost,
      price: p.price,
      stockCurrent: p.stockCurrent,
      stockMin: p.stockMin,
      stockMax: p.stockMax,
      leadTime: p.leadTime,
      status: p.status,
      supplier: p.supplier ? { id: p.supplier.id, name: p.supplier.name } : null,
      category: p.category ? { name: p.category.name } : null,
      totalSales90d: totalSales,
      avgDailyDemand: Math.round(avgDailyDemand * 100) / 100,
      ...metrics,
      investmentNeeded: metrics.suggestedQty * p.cost,
    }
  })

  // Sort by urgency
  const urgencyOrder = { critical: 0, warning: 1, normal: 2, good: 3 }
  analysis.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])

  const summary = {
    buyNow: analysis.filter(a => a.recommendation === "BUY_NOW").length,
    monitor: analysis.filter(a => a.recommendation === "MONITOR").length,
    excess: analysis.filter(a => a.recommendation === "EXCESS").length,
    dead: analysis.filter(a => a.recommendation === "DEAD").length,
    ok: analysis.filter(a => a.recommendation === "OK").length,
    totalInvestment: analysis.filter(a => a.recommendation === "BUY_NOW").reduce((s, a) => s + a.investmentNeeded, 0),
  }

  return NextResponse.json({ products: analysis, summary })
}
