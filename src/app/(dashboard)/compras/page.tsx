import { Header } from "@/components/layout/header"
import { PurchasingClient } from "@/components/purchasing/purchasing-client"

export default function ComprasPage() {
  return (
    <>
      <Header title="Compras Inteligentes" description="Motor de recomendaciones basado en ROP, EOQ y Stock de Seguridad" />
      <div className="flex-1 p-6">
        <PurchasingClient />
      </div>
    </>
  )
}
