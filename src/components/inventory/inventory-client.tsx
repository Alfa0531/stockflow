"use client"

import { useEffect, useState } from "react"
import { Plus, ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MovementForm } from "./movement-form"
import { formatDateTime, formatNumber, formatCurrency, getMovementLabel } from "@/lib/utils"
import { cn } from "@/lib/utils"

const INCOMING_TYPES = ["PURCHASE_IN", "ADJUSTMENT_IN", "RETURN_IN", "TRANSFER_IN", "INITIAL"]

type Movement = {
  id: string; type: string; quantity: number; unitCost: number | null
  stockBefore: number; stockAfter: number; reference: string | null
  notes: string | null; createdAt: string
  product: { name: string; sku: string; unit: string; category: { name: string } | null }
  warehouse: { name: string }
}

export function InventoryClient() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [formOpen, setFormOpen] = useState(false)

  const load = () => {
    setLoading(true)
    const params = typeFilter !== "ALL" ? `?type=${typeFilter}` : "?limit=100"
    fetch(`/api/inventory${params}`)
      .then(r => r.json())
      .then(d => { setMovements(d); setLoading(false) })
  }

  useEffect(() => { load() }, [typeFilter])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "ALL")}>
            <SelectTrigger className="h-8 w-52 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los movimientos</SelectItem>
              <SelectItem value="PURCHASE_IN">Entradas por compra</SelectItem>
              <SelectItem value="SALE_OUT">Salidas por venta</SelectItem>
              <SelectItem value="ADJUSTMENT_IN">Ajustes positivos</SelectItem>
              <SelectItem value="ADJUSTMENT_OUT">Ajustes negativos</SelectItem>
              <SelectItem value="SHRINKAGE">Mermas</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{movements.length} registros</span>
          <Button size="sm" className="h-8 gap-1.5" onClick={() => setFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" />Nuevo movimiento
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total entradas", value: movements.filter(m => INCOMING_TYPES.includes(m.type)).reduce((s, m) => s + m.quantity, 0), icon: ArrowDownCircle, color: "text-emerald-500" },
          { label: "Total salidas", value: movements.filter(m => !INCOMING_TYPES.includes(m.type)).reduce((s, m) => s + m.quantity, 0), icon: ArrowUpCircle, color: "text-blue-500" },
          { label: "Movimientos", value: movements.length, icon: RefreshCw, color: "text-primary" },
        ].map(c => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <c.icon className={cn("h-5 w-5 shrink-0", c.color)} />
            <div>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-lg font-bold">{formatNumber(c.value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {["Fecha", "Tipo", "Producto", "Categoría", "Cantidad", "Costo Unit.", "Stock Antes", "Stock Después", "Referencia"].map(h => (
                <TableHead key={h} className="h-9 px-4 bg-muted/30 text-xs text-muted-foreground">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-sm text-muted-foreground">Sin movimientos</TableCell>
              </TableRow>
            ) : (
              movements.map((m) => {
                const isIn = INCOMING_TYPES.includes(m.type)
                return (
                  <TableRow key={m.id} className="border-border hover:bg-muted/20 transition-colors">
                    <TableCell className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(m.createdAt)}</TableCell>
                    <TableCell className="px-4 py-2.5">
                      <span className={cn("inline-flex items-center gap-1 text-xs font-medium", isIn ? "text-emerald-500" : "text-blue-400")}>
                        {isIn ? <ArrowDownCircle className="h-3 w-3" /> : <ArrowUpCircle className="h-3 w-3" />}
                        {getMovementLabel(m.type)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <p className="text-xs font-medium">{m.product.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{m.product.sku}</p>
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-muted-foreground">{m.product.category?.name ?? "—"}</TableCell>
                    <TableCell className="px-4 py-2.5">
                      <span className={cn("text-sm font-semibold", isIn ? "text-emerald-500" : "text-blue-400")}>
                        {isIn ? "+" : "-"}{formatNumber(m.quantity)} {m.product.unit}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-xs">{m.unitCost ? formatCurrency(m.unitCost) : "—"}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-muted-foreground">{formatNumber(m.stockBefore)}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs font-medium">{formatNumber(m.stockAfter)}</TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-muted-foreground">{m.reference ?? "—"}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <MovementForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} />
    </div>
  )
}
