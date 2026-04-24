"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Scan, PackageCheck, PackageMinus, Trash2, CheckCircle, AlertTriangle, Link, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"

type Mode = "SALE_OUT" | "PURCHASE_IN"

type ScannedItem = {
  productId: string
  name: string
  sku: string
  barcode: string | null
  stockCurrent: number
  warehouseId: string
  cost: number
  price: number
  quantity: number
}

type ScanState =
  | { status: "idle" }
  | { status: "found"; product: any }
  | { status: "not_found"; code: string }
  | { status: "confirming" }

// Vinculador de barcode desconocido
function BarcodeLinker({
  code,
  onLinked,
  onCancel,
}: {
  code: string
  onLinked: () => void
  onCancel: () => void
}) {
  const [products, setProducts] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts)
  }, [])

  const link = async () => {
    if (!selectedId) return
    setSaving(true)
    const res = await fetch("/api/scan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: selectedId, barcode: code }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error)
    } else {
      toast.success(`Barcode vinculado a: ${json.name}`)
      onLinked()
    }
    setSaving(false)
  }

  return (
    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-foreground">Barcode no registrado</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Código <span className="font-mono text-foreground">{code}</span> no está en el sistema.
            ¿A qué producto corresponde?
          </p>
        </div>
      </div>
      <Select value={selectedId} onValueChange={(v) => setSelectedId(v ?? "")}>
        <SelectTrigger className="bg-background w-full">
          <SelectValue placeholder="Seleccionar producto..." />
        </SelectTrigger>
        <SelectContent side="top" className="max-h-72">
          {products.map((p: any) => (
            <SelectItem key={p.id} value={p.id}>
              <span className="font-mono text-xs text-muted-foreground mr-2">{p.sku}</span>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-3">
        <Button className="flex-1 gap-2" onClick={link} disabled={!selectedId || saving}>
          <Link className="h-4 w-4" />
          {saving ? "Vinculando..." : "Vincular barcode"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function ScanTerminal() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<Mode>("SALE_OUT")
  const [scanCode, setScanCode] = useState("")
  const [scanState, setScanState] = useState<ScanState>({ status: "idle" })
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState<ScannedItem[]>([])
  const [confirming, setConfirming] = useState(false)
  const [reference, setReference] = useState("")
  const [warehouse, setWarehouse] = useState<{ id: string; name: string } | null>(null)

  // Cargar warehouse por defecto
  useEffect(() => {
    fetch("/api/products/meta")
      .then(r => r.json())
      .then(d => { if (d.warehouses[0]) setWarehouse(d.warehouses[0]) })
  }, [])

  // Mantener el foco en el input siempre
  useEffect(() => {
    const refocus = () => {
      if (scanState.status !== "not_found") inputRef.current?.focus()
    }
    document.addEventListener("click", refocus)
    inputRef.current?.focus()
    return () => document.removeEventListener("click", refocus)
  }, [scanState.status])

  const handleScan = useCallback(async (code: string) => {
    if (!code.trim()) return
    setScanCode("")

    const res = await fetch(`/api/scan?code=${encodeURIComponent(code.trim())}`)
    const json = await res.json()

    if (!res.ok || !json.found) {
      setScanState({ status: "not_found", code: code.trim() })
      return
    }

    setScanState({ status: "found", product: json.product })
    setQuantity(1)
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && scanCode.trim()) {
      handleScan(scanCode.trim())
    }
  }

  const addToCart = () => {
    if (scanState.status !== "found") return
    const { product } = scanState

    const existing = cart.find(i => i.productId === product.id)
    if (existing) {
      setCart(prev => prev.map(i =>
        i.productId === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      ))
      toast.success(`+${quantity} agregado a ${product.name}`)
    } else {
      setCart(prev => [...prev, {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        stockCurrent: product.stockCurrent,
        warehouseId: product.warehouseId,
        cost: product.cost,
        price: product.price,
        quantity,
      }])
    }

    setScanState({ status: "idle" })
    setQuantity(1)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId))
  }

  const confirmAll = async () => {
    if (cart.length === 0 || !warehouse) return
    setConfirming(true)

    let errors = 0
    for (const item of cart) {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          warehouseId: warehouse.id,
          type: mode,
          quantity: item.quantity,
          reference: reference || undefined,
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        toast.error(`Error en ${item.name}: ${json.error}`)
        errors++
      }
    }

    if (errors === 0) {
      const label = mode === "SALE_OUT" ? "salida" : "entrada"
      toast.success(`${cart.length} movimientos de ${label} registrados`)
      setCart([])
      setReference("")
      setScanState({ status: "idle" })
    }
    setConfirming(false)
    inputRef.current?.focus()
  }

  const totalCajas = cart.reduce((s, i) => s + i.quantity, 0)
  const totalValor = cart.reduce((s, i) => s + i.quantity * (mode === "SALE_OUT" ? i.price : i.cost), 0)

  const isSale = mode === "SALE_OUT"

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => { setMode("SALE_OUT"); setScanState({ status: "idle" }); setCart([]) }}
          className={cn(
            "flex items-center justify-center gap-3 rounded-xl border-2 py-5 font-semibold text-lg transition-all",
            isSale
              ? "border-blue-500 bg-blue-500/10 text-blue-400"
              : "border-border bg-card text-muted-foreground hover:border-border/60"
          )}
        >
          <PackageMinus className={cn("h-6 w-6", isSale ? "text-blue-400" : "text-muted-foreground")} />
          SALIDA — Venta
        </button>
        <button
          onClick={() => { setMode("PURCHASE_IN"); setScanState({ status: "idle" }); setCart([]) }}
          className={cn(
            "flex items-center justify-center gap-3 rounded-xl border-2 py-5 font-semibold text-lg transition-all",
            !isSale
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
              : "border-border bg-card text-muted-foreground hover:border-border/60"
          )}
        >
          <PackageCheck className={cn("h-6 w-6", !isSale ? "text-emerald-400" : "text-muted-foreground")} />
          ENTRADA — Compra
        </button>
      </div>

      {/* Scanner input */}
      <div className={cn(
        "rounded-xl border-2 p-5 transition-all",
        isSale ? "border-blue-500/40 bg-blue-500/5" : "border-emerald-500/40 bg-emerald-500/5"
      )}>
        <div className="flex items-center gap-2 mb-3">
          <Scan className={cn("h-4 w-4", isSale ? "text-blue-400" : "text-emerald-400")} />
          <span className="text-sm font-medium text-muted-foreground">
            Escanea el barcode de la caja o escríbelo manualmente
          </span>
        </div>
        <Input
          ref={inputRef}
          value={scanCode}
          onChange={e => setScanCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Apunta el escáner aquí y presiona el gatillo..."
          className="h-12 text-base font-mono bg-background border-border"
          autoFocus
          autoComplete="off"
        />
        <p className="text-[11px] text-muted-foreground mt-2">
          El escáner USB funciona automáticamente. También puedes escribir el SKU (ej: VAL-C12) y presionar Enter.
        </p>
      </div>

      {/* Producto encontrado */}
      {scanState.status === "found" && (
        <div className={cn(
          "rounded-xl border-2 p-5 space-y-4 animate-in fade-in duration-200",
          isSale ? "border-blue-500/50 bg-blue-500/5" : "border-emerald-500/50 bg-emerald-500/5"
        )}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-foreground">{scanState.product.name}</p>
              <p className="text-sm text-muted-foreground font-mono">{scanState.product.sku}</p>
              {scanState.product.barcode && (
                <p className="text-xs text-muted-foreground mt-0.5">EAN: {scanState.product.barcode}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold">{scanState.product.stockCurrent}</p>
              <p className="text-xs text-muted-foreground">cajas en stock</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Cantidad de cajas</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="icon" className="h-10 w-10 text-lg shrink-0"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >−</Button>
                <Input
                  type="number" min={1}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-10 text-center text-xl font-bold w-24"
                />
                <Button
                  variant="outline" size="icon" className="h-10 w-10 text-lg shrink-0"
                  onClick={() => setQuantity(q => q + 1)}
                >+</Button>
                <div className="text-sm text-muted-foreground ml-2">
                  = {formatCurrency(quantity * (isSale ? scanState.product.price : scanState.product.cost))}
                </div>
              </div>
            </div>
            <Button
              className={cn("h-10 px-6 gap-2 shrink-0", isSale ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700")}
              onClick={addToCart}
            >
              {isSale ? <PackageMinus className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
              Agregar
            </Button>
          </div>

          {isSale && scanState.product.stockCurrent < quantity && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Stock insuficiente: solo hay {scanState.product.stockCurrent} cajas
            </p>
          )}
        </div>
      )}

      {/* Barcode no encontrado — vinculador */}
      {scanState.status === "not_found" && (
        <BarcodeLinker
          code={scanState.code}
          onLinked={() => {
            setScanState({ status: "idle" })
            setTimeout(() => inputRef.current?.focus(), 100)
          }}
          onCancel={() => {
            setScanState({ status: "idle" })
            setTimeout(() => inputRef.current?.focus(), 100)
          }}
        />
      )}

      {/* Carrito / Lista de movimientos */}
      {cart.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <p className="text-sm font-semibold">
              Lista de {isSale ? "salidas" : "entradas"} — {cart.length} productos
            </p>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => setCart([])}>
              Limpiar todo
            </Button>
          </div>

          <div className="divide-y divide-border">
            {cart.map(item => (
              <div key={item.productId} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{item.quantity} <span className="text-muted-foreground font-normal text-xs">cajas</span></p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.quantity * (isSale ? item.price : item.cost))}</p>
                </div>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => removeFromCart(item.productId)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          {/* Totales + Referencia + Confirmar */}
          <div className="border-t border-border px-4 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total cajas</span>
              <span className="font-bold">{totalCajas} cajas</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Valor total ({isSale ? "venta" : "costo"})</span>
              <span className="font-bold text-foreground">{formatCurrency(totalValor)}</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Referencia / Folio (opcional)</Label>
              <Input
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder={isSale ? "VTA-0044, Nota de remisión..." : "ENT-0015, Orden de compra..."}
                className="h-9 text-sm"
              />
            </div>

            <Button
              className={cn(
                "w-full h-11 text-base font-semibold gap-2",
                isSale ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
              )}
              onClick={confirmAll}
              disabled={confirming}
            >
              <CheckCircle className="h-5 w-5" />
              {confirming
                ? "Registrando..."
                : `Confirmar ${isSale ? "SALIDA" : "ENTRADA"} de ${totalCajas} cajas`}
            </Button>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {cart.length === 0 && scanState.status === "idle" && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Scan className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Escanea la primera caja para comenzar
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Modo actual: <span className={cn("font-semibold", isSale ? "text-blue-400" : "text-emerald-400")}>
              {isSale ? "SALIDA / Venta" : "ENTRADA / Compra"}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
