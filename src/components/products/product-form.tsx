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
  sku: z.string().min(1, "SKU requerido"),
  name: z.string().min(1, "Nombre requerido"),
  brand: z.string().optional(),
  unit: z.string(),
  cost: z.number().positive("Costo debe ser mayor a 0"),
  price: z.number().positive("Precio debe ser mayor a 0"),
  stockCurrent: z.number().min(0),
  stockMin: z.number().min(0),
  stockMax: z.number().min(0),
  stockSafety: z.number().min(0),
  leadTime: z.number().int().min(1),
  location: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  warehouseId: z.string(),
})

type FormData = z.infer<typeof schema>

interface ProductFormProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  product?: any
}

const UNITS = ["PZA", "KG", "LT", "MT", "CJA", "PAQ", "DOC", "PAR", "CAJA"]

export function ProductForm({ open, onClose, onSaved, product }: ProductFormProps) {
  const [meta, setMeta] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { unit: "PZA", stockCurrent: 0, stockMin: 0, stockMax: 0, stockSafety: 0, leadTime: 7, warehouseId: "" },
  })

  useEffect(() => {
    fetch("/api/products/meta").then(r => r.json()).then(d => {
      setMeta(d)
      if (!product && d.warehouses[0]) setValue("warehouseId", d.warehouses[0].id)
    })
  }, [])

  useEffect(() => {
    if (product) {
      reset({
        sku: product.sku,
        name: product.name,
        brand: product.brand ?? "",
        unit: product.unit,
        cost: product.cost,
        price: product.price,
        stockCurrent: product.stockCurrent,
        stockMin: product.stockMin,
        stockMax: product.stockMax,
        stockSafety: product.stockSafety,
        leadTime: product.leadTime,
        location: product.location ?? "",
        categoryId: product.categoryId ?? "",
        supplierId: product.supplierId ?? "",
        warehouseId: product.warehouseId,
      })
    } else {
      reset({ unit: "PZA", stockCurrent: 0, stockMin: 0, stockMax: 0, stockSafety: 0, leadTime: 7, warehouseId: meta?.warehouses[0]?.id ?? "", categoryId: "", supplierId: "" })
    }
  }, [product, open])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        categoryId: data.categoryId || undefined,
        supplierId: data.supplierId || undefined,
      }
      const url = product ? `/api/products/${product.id}` : "/api/products"
      const method = product ? "PATCH" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error("Error al guardar")
      toast.success(product ? "Producto actualizado" : "Producto creado")
      onSaved()
      onClose()
    } catch {
      toast.error("Error al guardar el producto")
    } finally {
      setSaving(false)
    }
  }

  const cost = watch("cost") || 0
  const price = watch("price") || 0
  const margin = price > 0 ? ((price - cost) / price * 100).toFixed(1) : "0"

  const unitVal = watch("unit")
  const categoryVal = watch("categoryId") ?? ""
  const supplierVal = watch("supplierId") ?? ""

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Basic */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>SKU *</Label>
              <Input {...register("sku")} placeholder="VAL-C12" className={errors.sku ? "border-destructive" : ""} />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Unidad</Label>
              <Select value={unitVal} onValueChange={(v) => setValue("unit", v ?? "PZA")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Nombre *</Label>
            <Input {...register("name")} placeholder="Salsa Valentina — Caja 12 pz" className={errors.name ? "border-destructive" : ""} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Marca</Label>
              <Input {...register("brand")} placeholder="Valentina" />
            </div>
            <div className="space-y-1.5">
              <Label>Ubicación almacén</Label>
              <Input {...register("location")} placeholder="A-01-01" />
            </div>
          </div>

          {/* Precio */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Precios</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Costo (MXN) *</Label>
                <Input {...register("cost", { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" className={errors.cost ? "border-destructive" : ""} />
                {errors.cost && <p className="text-xs text-destructive">{errors.cost.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Precio (MXN) *</Label>
                <Input {...register("price", { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" className={errors.price ? "border-destructive" : ""} />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Margen</Label>
                <div className={`h-9 flex items-center px-3 rounded-md border text-sm font-semibold ${parseFloat(margin) >= 20 ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5" : "text-yellow-500 border-yellow-500/30 bg-yellow-500/5"}`}>
                  {margin}%
                </div>
              </div>
            </div>
          </div>

          {/* Stock */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Niveles de Stock</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Stock actual</Label>
                <Input {...register("stockCurrent", { valueAsNumber: true })} type="number" step="0.01" />
              </div>
              <div className="space-y-1.5">
                <Label>Lead time (días)</Label>
                <Input {...register("leadTime", { valueAsNumber: true })} type="number" min={1} />
              </div>
              <div className="space-y-1.5">
                <Label>Stock mínimo</Label>
                <Input {...register("stockMin", { valueAsNumber: true })} type="number" step="0.01" />
              </div>
              <div className="space-y-1.5">
                <Label>Stock máximo</Label>
                <Input {...register("stockMax", { valueAsNumber: true })} type="number" step="0.01" />
              </div>
            </div>
          </div>

          {/* Relations */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select value={categoryVal} onValueChange={(v) => setValue("categoryId", v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar...">
                    {meta?.categories.find((c: any) => c.id === categoryVal)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent side="top" className="max-h-60">
                  {meta?.categories.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Proveedor</Label>
              <Select value={supplierVal} onValueChange={(v) => setValue("supplierId", v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar...">
                    {meta?.suppliers.find((s: any) => s.id === supplierVal)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent side="top" className="max-h-60">
                  {meta?.suppliers.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
