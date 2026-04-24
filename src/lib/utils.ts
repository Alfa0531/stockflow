import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-MX").format(value)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(new Date(date))
}

export function getMovementLabel(type: string): string {
  const map: Record<string, string> = {
    PURCHASE_IN: "Entrada compra",
    SALE_OUT: "Salida venta",
    ADJUSTMENT_IN: "Ajuste +",
    ADJUSTMENT_OUT: "Ajuste -",
    RETURN_IN: "Devolución entrada",
    RETURN_OUT: "Devolución salida",
    SHRINKAGE: "Merma",
    TRANSFER_IN: "Transferencia entrada",
    TRANSFER_OUT: "Transferencia salida",
    INITIAL: "Inventario inicial",
  }
  return map[type] ?? type
}

export function calculateMargin(cost: number, price: number): number {
  if (price === 0) return 0
  return ((price - cost) / price) * 100
}
