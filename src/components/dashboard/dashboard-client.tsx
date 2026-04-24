"use client"

import { useEffect, useState } from "react"
import {
  Package, AlertTriangle, TrendingDown, TrendingUp,
  DollarSign, ShoppingCart, Skull, Zap
} from "lucide-react"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { KpiCard } from "./kpi-card"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"]

const alertLevelConfig = {
  RED: { label: "Crítico", className: "bg-destructive/20 text-destructive border-0" },
  BLACK: { label: "Muerto", className: "bg-zinc-800 text-zinc-300 border-0" },
  YELLOW: { label: "Revisar", className: "bg-yellow-500/20 text-yellow-500 border-0" },
  GREEN: { label: "OK", className: "bg-emerald-500/20 text-emerald-500 border-0" },
}

export function DashboardClient() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 rounded-xl border border-border bg-card animate-pulse" />
          <div className="h-72 rounded-xl border border-border bg-card animate-pulse" />
        </div>
      </div>
    )
  }

  const { kpis, topProducts, monthlyChart, categoryData, recentAlerts } = data

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Valor Inventario"
          value={formatCurrency(kpis.totalInventoryValue)}
          subtitle={`${formatNumber(kpis.totalProducts)} productos`}
          icon={DollarSign}
          variant="default"
        />
        <KpiCard
          title="Productos Activos"
          value={formatNumber(kpis.activeProducts)}
          subtitle={`de ${formatNumber(kpis.totalProducts)} total`}
          icon={Package}
          variant="success"
        />
        <KpiCard
          title="Sin Stock"
          value={formatNumber(kpis.outOfStockProducts)}
          subtitle="requieren compra urgente"
          icon={AlertTriangle}
          variant="danger"
        />
        <KpiCard
          title="Stock Bajo"
          value={formatNumber(kpis.lowStockProducts)}
          subtitle="bajo punto de reorden"
          icon={TrendingDown}
          variant="warning"
        />
        <KpiCard
          title="Exceso Inventario"
          value={formatNumber(kpis.excessProducts)}
          subtitle="sobre el máximo"
          icon={TrendingUp}
          variant="warning"
        />
        <KpiCard
          title="Productos Muertos"
          value={formatNumber(kpis.deadProducts)}
          subtitle="sin rotación 90+ días"
          icon={Skull}
          variant="danger"
        />
        <KpiCard
          title="Alertas Críticas"
          value={formatNumber(kpis.criticalAlerts)}
          subtitle="requieren acción"
          icon={Zap}
          variant="danger"
        />
        <KpiCard
          title="Órdenes Activas"
          value="2"
          subtitle="en proceso"
          icon={ShoppingCart}
          variant="default"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Movimientos Últimos 6 Meses</h3>
          <p className="text-xs text-muted-foreground mb-5">Entradas vs Salidas en unidades</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyChart} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "oklch(0.62 0.02 264)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.62 0.02 264)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "oklch(0.14 0.008 264)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "oklch(0.97 0 0)", fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="entradas" name="Entradas" fill="#6366f1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="salidas" name="Salidas" fill="#22c55e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Valor por Categoría</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribución del inventario</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData.slice(0, 6)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {categoryData.slice(0, 6).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => formatCurrency(Number(v))}
                contentStyle={{ background: "oklch(0.14 0.008 264)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData.slice(0, 5).map((c: any, i: number) => (
              <div key={c.name} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                <span className="text-muted-foreground truncate flex-1">{c.name}</span>
                <span className="font-medium text-foreground">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Top 5 Productos por Venta</h3>
          <p className="text-xs text-muted-foreground mb-4">Últimos 90 días</p>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos de ventas</p>
            ) : (
              topProducts.map((p: any, i: number) => {
                const maxRevenue = topProducts[0]?.revenue || 1
                return (
                  <div key={p.sku} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                      <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-foreground">{formatCurrency(p.revenue)}</p>
                      <p className="text-[10px] text-muted-foreground">{formatNumber(p.units)} uds</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Alertas Recientes</h3>
          <p className="text-xs text-muted-foreground mb-4">Requieren atención</p>
          <div className="space-y-2">
            {recentAlerts.map((a: any) => {
              const cfg = alertLevelConfig[a.level as keyof typeof alertLevelConfig] || alertLevelConfig.GREEN
              return (
                <div key={a.id} className="flex items-start gap-3 rounded-lg bg-muted/40 p-2.5">
                  <Badge className={`text-[10px] px-1.5 h-4 mt-0.5 shrink-0 ${cfg.className}`}>
                    {cfg.label}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{a.message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
