import { Header } from "@/components/layout/header"
import { InventoryClient } from "@/components/inventory/inventory-client"

export default function InventarioPage() {
  return (
    <>
      <Header title="Inventario / Kardex" description="Registro de todos los movimientos de inventario" />
      <div className="flex-1 p-6">
        <InventoryClient />
      </div>
    </>
  )
}
