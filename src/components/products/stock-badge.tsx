import { cn } from "@/lib/utils"

interface StockBadgeProps {
  current: number
  min: number
  max: number
  status: string
}

export function StockBadge({ current, min, max, status }: StockBadgeProps) {
  if (status === "DEAD") return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-zinc-800 text-zinc-300">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />Muerto
    </span>
  )
  if (current === 0) return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-destructive/15 text-destructive">
      <span className="h-1.5 w-1.5 rounded-full bg-destructive" />Sin stock
    </span>
  )
  if (current <= min) return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-destructive/15 text-destructive">
      <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />Crítico
    </span>
  )
  if (max > 0 && current > max * 1.1) return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-yellow-500/15 text-yellow-500">
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />Exceso
    </span>
  )
  if (current <= min * 1.3) return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-yellow-500/15 text-yellow-500">
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />Bajo
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-500">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Óptimo
    </span>
  )
}
