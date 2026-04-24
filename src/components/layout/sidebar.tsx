"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Package, ArrowLeftRight, ShoppingCart,
  BarChart3, Bell, Settings, Boxes, ChevronRight, ScanBarcode
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const nav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Productos", href: "/productos", icon: Package },
  { label: "Inventario", href: "/inventario", icon: ArrowLeftRight },
  { label: "Compras", href: "/compras", icon: ShoppingCart },
  { label: "Reportes", href: "/reportes", icon: BarChart3 },
  { label: "Alertas", href: "/alertas", icon: Bell, badge: "8" },
  { label: "Escaneo", href: "/escaneo", icon: ScanBarcode },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-60 border-r border-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Boxes className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground tracking-tight">StockFlow</p>
          <p className="text-[10px] text-muted-foreground">Inventario Inteligente</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Principal
        </p>
        {nav.map(({ label, href, icon: Icon, badge }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors group",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
              <span className="flex-1">{label}</span>
              {badge && (
                <Badge className="h-4 px-1.5 text-[10px] bg-destructive/20 text-destructive border-0">
                  {badge}
                </Badge>
              )}
              {active && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-3">
        <Link
          href="/configuracion"
          className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Configuración
        </Link>
        <div className="mt-3 px-2.5 flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
            AD
          </div>
          <div>
            <p className="text-xs font-medium text-sidebar-foreground">Administrador</p>
            <p className="text-[10px] text-muted-foreground">admin@empresa.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
