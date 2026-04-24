import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  variant?: "default" | "danger" | "warning" | "success"
}

const variantStyles = {
  default: "text-primary bg-primary/10",
  danger: "text-destructive bg-destructive/10",
  warning: "text-yellow-500 bg-yellow-500/10",
  success: "text-emerald-500 bg-emerald-500/10",
}

export function KpiCard({ title, value, subtitle, icon: Icon, variant = "default" }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:border-border/60 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground tracking-tight">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg shrink-0", variantStyles[variant])}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </div>
  )
}
