import { Header } from "@/components/layout/header"
import { AlertsClient } from "@/components/alerts-client"

export default function AlertasPage() {
  return (
    <>
      <Header title="Centro de Alertas" description="Semáforo de inventario — Verde · Amarillo · Rojo · Negro" />
      <div className="flex-1 p-6">
        <AlertsClient />
      </div>
    </>
  )
}
