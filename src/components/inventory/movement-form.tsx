"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const schema = z.object({
  productId: z.string().min(1, "Selecciona un producto"),
  warehouseId: z.string().min(1),
  type: z.enum(["PURCHASE_IN", "SALE_OUT", "ADJUSTMENT_IN", "ADJUSTMENT_OUT", "RETURN_IN", "RETURN_OUT", "SHRINKAGE", "TRANSFER_IN", "TRANSFER_OUT"]),
  quantity: z.number().positive("Cantidad mayor a 0"),
  unitCost: z.number().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const MOVEMENT_TYPES = [
  { value: "PURCHASE_IN", label: "Entrada — Compra", color: "text-emerald-500" },
  { value: "SALE_OUT", label: "Salida — Venta", color: "text-blue-500" },
  { value: "ADJUSTMENT_IN", label: "Ajuste positivo (+)", color: "text-emerald-400" },
  { value: "ADJUSTMENT_OUT", label: "Ajuste negativo (-)", color: "text-red-400" },
  { value: "RETURN_IN", label: "Devolución entrada", color: "text-emerald-400" },
  { value: "RETURN_OUT", label: "Devolución a proveedor", color: "text-orange-400" },
  { value: "SHRINKAGE", label: "Merma", color: "text-destructive" },
  { value: "TRANSFER_IN", label: "Transferencia entrada", color: "text-purple-400" },
  { value: "TRANSFER_OUT", label: "Transferencia salida", color: "text-purple-400" },
]

interface MovementFormProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  defaultProductId?: string
}

export function MovementForm({ open, onClose, onSaved, defaultProductId }: MovementFormProps) {
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts)
    fetch("/api/products/meta").then(r => r.json()).then(d => {
      setWarehouses(d.warehouses)
      if (d.warehouses[0]) setValue("warehouseId", d.warehouses[0].id)
    })
  }, [])

  useEffect(() => {
    if (defaultProductId) setValue("productId", defaultProductId)
  }, [defaultProductId])

  const productId = watch("productId")
  useEffect(() => {
    if (productId) setSelectedProduct(products.find(p => p.id === productId) ?? null)
  }, [productId, products])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const res = await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Error")
      toast.success("Movimiento registrado correctamente")
      reset()
      onSaved()
      onClose()
    } catch (e: any) {
      toast.error(e.message ?? "Error al registrar movimiento")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tipo de movimiento *</Label>
            <Select onValueChange={(v) => { if (v) setValue("type", v as any) }}>
              <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                {MOVEMENT_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    <span className={t.color}>{t.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Producto *</Label>
            <Select onValueChange={(v) => setValue("productId", v ?? "")} defaultValue={defaultProductId}>
              <SelectTrigger className={errors.productId ? "border-destructive" : ""}>
                <SelectValue placeholder="Buscar producto..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="font-mono text-xs text-muted-foreground mr-2">{p.sku}</span>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productId && <p className="text-xs text-destructive">{errors.productId.message}</p>}
          </div>

          {selectedProduct && (
            <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs">
              <span className="text-muted-foreground">Stock actual: </span>
              <span className="font-semibold text-foreground">{selectedProduct.stockCurrent} {selectedProduct.unit}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cantidad *</Label>
              <Input {...register("quantity", { valueAsNumber: true })} type="number" step="0.01" placeholder="0" className={errors.quantity ? "border-destructive" : ""} />
              {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Costo unitario</Label>
              <Input {...register("unitCost", { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Referencia (doc, folio)</Label>
            <Input {...register("reference")} placeholder="OC-2024-001, FACT-123..." />
          </div>

          <div className="space-y-1.5">
            <Label>Observaciones</Label>
            <Input {...register("notes")} placeholder="Notas adicionales..." />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Registrando..." : "Registrar movimiento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
