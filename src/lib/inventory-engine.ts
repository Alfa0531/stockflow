// Motor matemático de inventario

export interface InventoryMetrics {
  rop: number       // Punto de reorden
  eoq: number       // Cantidad económica de pedido
  ss: number        // Stock de seguridad
  daysOfStock: number
  recommendation: "BUY_NOW" | "MONITOR" | "EXCESS" | "DEAD" | "OK"
  urgency: "critical" | "warning" | "normal" | "good"
  suggestedQty: number
}

export function calculateInventoryMetrics(params: {
  stockCurrent: number
  stockMin: number
  stockMax: number
  stockSafety: number
  leadTime: number        // días
  avgDailyDemand: number  // unidades/día
  stdDevDemand: number    // desviación estándar demanda diaria
  annualDemand: number    // unidades/año
  orderCost: number       // costo por orden (asumido)
  holdingCost: number     // costo de almacenamiento por unidad/año
  status: string
}): InventoryMetrics {
  const { stockCurrent, stockMin, stockMax, leadTime, avgDailyDemand, stdDevDemand, annualDemand, status } = params

  const Z = 1.65 // 95% nivel de servicio

  // Stock de seguridad: Z * σ * √(lead time)
  const ss = Math.ceil(Z * stdDevDemand * Math.sqrt(leadTime))

  // Punto de reorden: demanda promedio * lead time + stock seguridad
  const rop = Math.ceil(avgDailyDemand * leadTime + ss)

  // EOQ: √(2DS/H) — con defaults razonables si no se tienen costos
  const D = annualDemand > 0 ? annualDemand : avgDailyDemand * 365
  const S = params.orderCost > 0 ? params.orderCost : 150  // $150 MXN por orden
  const H = params.holdingCost > 0 ? params.holdingCost : 0.25 // 25% del costo anual
  const eoq = Math.ceil(Math.sqrt((2 * D * S) / H))

  // Días de stock disponible
  const daysOfStock = avgDailyDemand > 0 ? Math.floor(stockCurrent / avgDailyDemand) : 999

  // Recomendación
  let recommendation: InventoryMetrics["recommendation"]
  let urgency: InventoryMetrics["urgency"]
  let suggestedQty = 0

  if (status === "DEAD" || (avgDailyDemand < 0.05 && stockCurrent > stockMin * 2)) {
    recommendation = "DEAD"
    urgency = "warning"
    suggestedQty = 0
  } else if (stockCurrent === 0 || stockCurrent < stockMin * 0.5) {
    recommendation = "BUY_NOW"
    urgency = "critical"
    suggestedQty = Math.max(eoq, stockMax - stockCurrent)
  } else if (stockCurrent <= rop) {
    recommendation = "BUY_NOW"
    urgency = "warning"
    suggestedQty = Math.max(eoq, stockMax - stockCurrent)
  } else if (stockCurrent > stockMax * 1.2) {
    recommendation = "EXCESS"
    urgency = "warning"
    suggestedQty = 0
  } else if (daysOfStock < leadTime * 2) {
    recommendation = "MONITOR"
    urgency = "normal"
    suggestedQty = eoq
  } else {
    recommendation = "OK"
    urgency = "good"
    suggestedQty = 0
  }

  return { rop, eoq, ss, daysOfStock, recommendation, urgency, suggestedQty }
}

export function getRecommendationLabel(rec: InventoryMetrics["recommendation"]): string {
  const map = {
    BUY_NOW: "Comprar urgente",
    MONITOR: "Monitorear",
    EXCESS: "Exceso de inventario",
    DEAD: "Producto muerto",
    OK: "Nivel óptimo",
  }
  return map[rec]
}

export function calculateABC(products: { id: string; name: string; annualValue: number }[]) {
  const total = products.reduce((s, p) => s + p.annualValue, 0)
  const sorted = [...products].sort((a, b) => b.annualValue - a.annualValue)

  let cumulative = 0
  return sorted.map((p) => {
    cumulative += p.annualValue
    const cumulativePct = (cumulative / total) * 100
    const category = cumulativePct <= 80 ? "A" : cumulativePct <= 95 ? "B" : "C"
    return { ...p, cumulativePct, category, valuePct: (p.annualValue / total) * 100 }
  })
}
