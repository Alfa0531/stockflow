"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, AlertTriangle, TrendingUp, Skull, CheckCircle, DollarSign } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { getRecommendationLabel } from "@/lib/inventory-engine"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type ProductAnalysis = {
  id: string; sku: string; name: string; brand: string | null; unit: string
  cost: number; price: number; stockCurrent: number; stockMin: number; stockMax: number
  leadTime: number; status: string
  supplier: { name: string } | null
  category: { name: string } | null
  totalSales90d: number; avgDailyDemand: number
  rop: number; eoq: number; ss: number; daysOfStock: number
  recommendation: "BUY_NOW" | "MONITOR" | "EXCESS" | "DEAD" | "OK"
  urgency: "critical" | "warning" | "normal" | "good"
  suggestedQty: number; investmentNeeded: number
}

const recConfig = {
  BUY_NOW: { label: "Comprar ahora", icon: ShoppingCart, badge: "bg-destructive/20 text-destructive border-0", row: "bg-destructive/5 hover:bg-destructive/10" },
  MONITOR: { label: "Monitorear", icon: AlertTriangle, badge: "bg-yellow-500/20 text-yellow-500 border-0", row: "bg-yellow-500/5 hover:bg-yellow-500/10" },
  EXCESS: { label: "Exceso", icon: TrendingUp, badge: "bg-orange-500/20 text-orange-500 border-0", row: "hover:bg-muted/20" },
  DEAD: { label: "Producto muerto", icon: Skull, badge: "bg-zinc-700 text-zinc-300 border-0", row: "opacity-60 hover:bg-muted/20" },
  OK: { label: "Óptimo", icon: CheckCircle, badge: "bg-emerald-500/20 text-emerald-500 border-0", row: "hover:bg-muted/20" },
}

export function PurchasingClient() {
  const [data, setData] = useState<{ products: ProductAnalysis[]; summary: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("ALL")

  useEffect(() => {
    fetch("/api/purchasing").then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />)}
      </div>
      <div className="h-96 bg-card border border-border rounded-xl animate-pulse" />
    </div>
  )

  const { products, summary } = data!
  const filtered = filter === "ALL" ? products : products.filter(p => p.recommendation === filter)

  return (
    <div className="space-y-5">
      {/* Formula callout */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs font-semibold text-primary mb-2">Motor matemático activo</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-muted-foreground font-mono">
          <span><span className="text-foreground font-semibold">ROP</span> = Demanda promedio × Lead time + Stock seguridad</span>
          <span><span className="text-foreground font-semibold">SS</span> = Z × σ × √(Lead time) &nbsp;[Z=1.65, 95% nivel servicio]</span>
          <span><span className="text-foreground font-semibold">EOQ</span> = √(2DS/H)</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: "ALL", label: "Todos", value: products.length, icon: CheckCircle, color: "text-muted-foreground", active: "bg-muted" },
          { key: "BUY_NOW", label: "Comprar ya", value: summary.buyNow, icon: ShoppingCart, color: "text-destructive", active: "bg-destructive/10" },
          { key: "MONITOR", label: "Monitorear", value: summary.monitor, icon: AlertTriangle, color: "text-yellow-500", active: "bg-yellow-500/10" },
          { key: "EXCESS", label: "Exceso", value: summary.excess, icon: TrendingUp, color: "text-orange-500", active: "bg-orange-500/10" },
          { key: "DEAD", label: "Muertos", value: summary.dead, icon: Skull, color: "text-zinc-400", active: "bg-zinc-700/30" },
          { key: "OK", label: "Óptimo", value: summary.ok, icon: CheckCircle, color: "text-emerald-500", active: "bg-emerald-500/10" },
        ].map(c => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={cn(
              "rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/30",
              filter === c.key && cn(c.active, "border-primary/30")
            )}
          >
            <c.icon className={cn("h-4 w-4 mb-1.5", c.color)} />
            <p className="text-lg font-bold">{c.value}</p>
            <p className="text-[10px] text-muted-foreground">{c.label}</p>
          </button>
        ))}
      </div>

      {/* Investment needed */}
      {summary.buyNow > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <DollarSign className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm">
            <span className="font-semibold text-destructive">{summary.buyNow} productos</span>
            <span className="text-muted-foreground"> necesitan recompra urgente. Inversión estimada: </span>
            <span className="font-bold text-foreground">{formatCurrency(summary.totalInvestment)}</span>
          </p>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {["Producto", "Proveedor", "Recomendación", "Stock Actual", "ROP", "EOQ", "SS", "Días Stock", "Demanda/día", "Comprar", "Inversión"].map(h => (
                <TableHead key={h} className="h-9 px-3 bg-muted/30 text-xs text-muted-foreground whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const cfg = recConfig[p.recommendation]
              return (
                <TableRow key={p.id} className={cn("border-border transition-colors text-sm", cfg.row)}>
                  <TableCell className="px-3 py-2.5">
                    <p className="font-medium text-foreground text-xs">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{p.sku} · {p.unit}</p>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-xs text-muted-foreground">{p.supplier?.name ?? "—"}</TableCell>
                  <TableCell className="px-3 py-2.5">
                    <Badge className={`text-[10px] px-2 h-4.5 ${cfg.badge}`}>{getRecommendationLabel(p.recommendation)}</Badge>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-xs font-semibold">{formatNumber(p.stockCurrent)}</TableCell>
                  <TableCell className="px-3 py-2.5 text-xs">{formatNumber(p.rop)}</TableCell>
                  <TableCell className="px-3 py-2.5 text-xs">{formatNumber(p.eoq)}</TableCell>
                  <TableCell className="px-3 py-2.5 text-xs">{formatNumber(p.ss)}</TableCell>
                  <TableCell className="px-3 py-2.5">
                    <span className={cn("text-xs font-medium",
                      p.daysOfStock < 7 ? "text-destructive" : p.daysOfStock < 14 ? "text-yellow-500" : "text-emerald-500"
                    )}>
                      {p.daysOfStock === 999 ? "∞" : `${p.daysOfStock}d`}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-xs">{p.avgDailyDemand.toFixed(1)}</TableCell>
                  <TableCell className="px-3 py-2.5">
                    {p.suggestedQty > 0
                      ? <span className="text-xs font-bold text-primary">{formatNumber(p.suggestedQty)}</span>
                      : <span className="text-xs text-muted-foreground">—</span>
                    }
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-xs font-semibold">
                    {p.investmentNeeded > 0 ? formatCurrency(p.investmentNeeded) : "—"}
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="py-12 text-center text-sm text-muted-foreground">Sin productos en esta categoría</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
