"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"

const ABC_COLORS = { A: "#6366f1", B: "#f59e0b", C: "#6b7280" }

export function ReportsClient() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/reports").then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="space-y-4">
      <div className="h-10 w-80 bg-card border border-border rounded-lg animate-pulse" />
      <div className="h-96 bg-card border border-border rounded-xl animate-pulse" />
    </div>
  )

  const { abc, rotation, aging, agingBuckets, dead } = data

  return (
    <Tabs defaultValue="abc" className="space-y-5">
      <TabsList className="bg-card border border-border h-9">
        <TabsTrigger value="abc" className="text-xs">Análisis ABC</TabsTrigger>
        <TabsTrigger value="rotation" className="text-xs">Rotación</TabsTrigger>
        <TabsTrigger value="aging" className="text-xs">Aging</TabsTrigger>
        <TabsTrigger value="dead" className="text-xs">Productos Muertos</TabsTrigger>
      </TabsList>

      {/* ABC Analysis */}
      <TabsContent value="abc" className="space-y-5 mt-0">
        <div className="grid grid-cols-3 gap-4">
          {["A", "B", "C"].map(cat => {
            const items = abc.filter((p: any) => p.category === cat)
            return (
              <div key={cat} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold" style={{ color: ABC_COLORS[cat as keyof typeof ABC_COLORS] }}>Clase {cat}</span>
                  <Badge variant="outline" className="text-xs">{items.length} productos</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {cat === "A" ? "80% del valor. Alta prioridad." : cat === "B" ? "15% del valor. Prioridad media." : "5% del valor. Baja prioridad."}
                </p>
                <p className="text-xl font-bold">{formatCurrency(items.reduce((s: number, p: any) => s + p.annualValue, 0))}</p>
              </div>
            )
          })}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Pareto ABC — Valor Anual de Ventas</h3>
          <p className="text-xs text-muted-foreground mb-4">Top 20 productos por valor. A=80%, B=95%, C=100%</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={abc.slice(0, 20)} margin={{ left: 0, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
              <XAxis dataKey="sku" tick={{ fontSize: 9, fill: "oklch(0.62 0.02 264)" }} angle={-45} textAnchor="end" height={40} />
              <YAxis tick={{ fontSize: 10, fill: "oklch(0.62 0.02 264)" }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ background: "oklch(0.14 0.008 264)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="annualValue" radius={[3, 3, 0, 0]}>
                {abc.slice(0, 20).map((p: any, i: number) => <Cell key={i} fill={ABC_COLORS[p.category as keyof typeof ABC_COLORS]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {["Clase", "Rank", "SKU", "Producto", "Valor Anual", "% Acumulado"].map(h => (
                  <TableHead key={h} className="h-9 px-4 bg-muted/30 text-xs text-muted-foreground">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {abc.slice(0, 25).map((p: any, i: number) => (
                <TableRow key={p.id} className="border-border hover:bg-muted/20">
                  <TableCell className="px-4 py-2">
                    <span className="font-bold text-sm" style={{ color: ABC_COLORS[p.category as keyof typeof ABC_COLORS] }}>{p.category}</span>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-xs text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="px-4 py-2 text-xs font-mono text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="px-4 py-2 text-xs font-medium">{p.name}</TableCell>
                  <TableCell className="px-4 py-2 text-xs font-semibold">{formatCurrency(p.annualValue)}</TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(p.cumulativePct, 100)}%`, background: ABC_COLORS[p.category as keyof typeof ABC_COLORS] }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{p.cumulativePct.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* Rotation */}
      <TabsContent value="rotation" className="space-y-4 mt-0">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {["SKU", "Producto", "Categoría", "Stock Actual", "Ventas 90d", "Rotación", "Días Turn", "Valor Inv."].map(h => (
                  <TableHead key={h} className="h-9 px-4 bg-muted/30 text-xs text-muted-foreground">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rotation.map((p: any) => (
                <TableRow key={p.id} className="border-border hover:bg-muted/20">
                  <TableCell className="px-4 py-2.5 text-xs font-mono text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="px-4 py-2.5 text-xs font-medium">{p.name}</TableCell>
                  <TableCell className="px-4 py-2.5 text-xs text-muted-foreground">{p.category ?? "—"}</TableCell>
                  <TableCell className="px-4 py-2.5 text-xs">{formatNumber(p.stockCurrent)}</TableCell>
                  <TableCell className="px-4 py-2.5 text-xs">{formatNumber(p.sales90d)}</TableCell>
                  <TableCell className="px-4 py-2.5">
                    <span className={cn("text-xs font-bold", p.rotationRate >= 2 ? "text-emerald-500" : p.rotationRate >= 0.5 ? "text-yellow-500" : "text-destructive")}>
                      {p.rotationRate.toFixed(2)}x
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-xs">
                    {p.daysToTurn === 999 ? <span className="text-destructive">Sin ventas</span> : `${p.daysToTurn} días`}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-xs font-medium">{formatCurrency(p.inventoryValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* Aging */}
      <TabsContent value="aging" className="space-y-5 mt-0">
        <div className="grid grid-cols-4 gap-4">
          {agingBuckets.map((b: any) => (
            <div key={b.bucket} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">{b.bucket} días</p>
              <p className="text-xl font-bold">{b.count} <span className="text-sm font-normal text-muted-foreground">prods</span></p>
              <p className="text-xs font-semibold text-primary mt-1">{formatCurrency(b.value)}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Valor del inventario por antigüedad</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={agingBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
              <XAxis dataKey="bucket" tick={{ fontSize: 12, fill: "oklch(0.62 0.02 264)" }} />
              <YAxis tick={{ fontSize: 10, fill: "oklch(0.62 0.02 264)" }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ background: "oklch(0.14 0.008 264)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {["SKU", "Producto", "Stock", "Bucket", "Días sin movimiento", "Valor"].map(h => (
                  <TableHead key={h} className="h-9 px-4 bg-muted/30 text-xs text-muted-foreground">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {aging.filter((a: any) => a.stockCurrent > 0).slice(0, 20).map((a: any) => (
                <TableRow key={a.id} className="border-border hover:bg-muted/20">
                  <TableCell className="px-4 py-2.5 text-xs font-mono text-muted-foreground">{a.sku}</TableCell>
                  <TableCell className="px-4 py-2.5 text-xs font-medium">{a.name}</TableCell>
                  <TableCell className="px-4 py-2.5 text-xs">{formatNumber(a.stockCurrent)}</TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Badge variant="outline" className={cn("text-[10px]", a.bucket === "90+" ? "border-destructive text-destructive" : a.bucket === "61-90" ? "border-orange-500 text-orange-500" : "")}>{a.bucket} días</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-xs">{a.daysSinceMovement}d</TableCell>
                  <TableCell className="px-4 py-2.5 text-xs font-medium">{formatCurrency(a.inventoryValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* Dead Products */}
      <TabsContent value="dead" className="space-y-4 mt-0">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-semibold text-destructive">{dead.length} productos</span> sin rotación detectados.
          Valor inmovilizado: <span className="font-bold text-foreground">{formatCurrency(dead.reduce((s: number, p: any) => s + (p.inventoryValue ?? 0), 0))}</span>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {["SKU", "Producto", "Stock", "Costo unit.", "Valor inmovilizado", "Días sin movimiento"].map(h => (
                  <TableHead key={h} className="h-9 px-4 bg-muted/30 text-xs text-muted-foreground">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dead.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">Sin productos muertos detectados ✓</TableCell></TableRow>
              ) : dead.map((p: any) => (
                <TableRow key={p.id} className="border-border hover:bg-muted/20 opacity-75">
                  <TableCell className="px-4 py-2.5 text-xs font-mono text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="px-4 py-2.5 text-xs font-medium">{p.name}</TableCell>
                  <TableCell className="px-4 py-2.5 text-xs">{formatNumber(p.stockCurrent)}</TableCell>
                  <TableCell className="px-4 py-2.5 text-xs">{formatCurrency(p.cost)}</TableCell>
                  <TableCell className="px-4 py-2.5 text-xs font-bold text-destructive">{formatCurrency(p.inventoryValue ?? 0)}</TableCell>
                  <TableCell className="px-4 py-2.5">
                    <Badge variant="outline" className="text-[10px] border-destructive/50 text-destructive">{p.daysSinceMovement}d</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  )
}
