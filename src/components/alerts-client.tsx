"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

type Alert = {
  id: string; type: string; level: string; title: string; message: string
  resolved: boolean; createdAt: string
  product: { name: string; sku: string; category: { name: string } | null } | null
}

const levelConfig = {
  RED: { dot: "bg-destructive", bg: "border-destructive/30 bg-destructive/5", badge: "bg-destructive/20 text-destructive", label: "Crítico" },
  BLACK: { dot: "bg-zinc-500", bg: "border-zinc-700/50 bg-zinc-900/30", badge: "bg-zinc-800 text-zinc-300", label: "Muerto" },
  YELLOW: { dot: "bg-yellow-500", bg: "border-yellow-500/30 bg-yellow-500/5", badge: "bg-yellow-500/20 text-yellow-500", label: "Revisar" },
  GREEN: { dot: "bg-emerald-500", bg: "border-emerald-500/30 bg-emerald-500/5", badge: "bg-emerald-500/20 text-emerald-500", label: "OK" },
}

const ORDER = ["RED", "BLACK", "YELLOW", "GREEN"]

export function AlertsClient() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch("/api/alerts").then(r => r.json()).then(d => { setAlerts(d); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const resolve = async (id: string) => {
    setResolving(id)
    await fetch("/api/alerts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    toast.success("Alerta resuelta")
    load()
    setResolving(null)
  }

  const active = alerts.filter(a => !a.resolved).sort((a, b) => ORDER.indexOf(a.level) - ORDER.indexOf(b.level))
  const resolved = alerts.filter(a => a.resolved)

  if (loading) return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Semáforo legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Semáforo:</span>
        {Object.entries(levelConfig).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", cfg.dot)} />
            {cfg.label}
          </span>
        ))}
      </div>

      {/* Active alerts */}
      <div className="space-y-2">
        <p className="text-sm font-semibold">{active.length} alertas activas</p>
        {active.length === 0 && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
            <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-emerald-500">Sin alertas activas</p>
          </div>
        )}
        {active.map((a) => {
          const cfg = levelConfig[a.level as keyof typeof levelConfig] ?? levelConfig.GREEN
          return (
            <div key={a.id} className={cn("rounded-xl border p-4 flex items-start justify-between gap-4", cfg.bg)}>
              <div className="flex items-start gap-3 min-w-0">
                <span className={cn("h-2.5 w-2.5 rounded-full mt-1.5 shrink-0", cfg.dot)} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", cfg.badge)}>{cfg.label}</span>
                    {a.product && <span className="text-[10px] text-muted-foreground font-mono">{a.product.sku}</span>}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatDate(a.createdAt)}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => resolve(a.id)} disabled={resolving === a.id}>
                {resolving === a.id ? "..." : "Resolver"}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Resolved */}
      {resolved.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">{resolved.length} resueltas</p>
          {resolved.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-card/50 p-3 flex items-center gap-3 opacity-50">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-medium line-through text-muted-foreground">{a.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
