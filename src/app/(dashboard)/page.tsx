import { Header } from "@/components/layout/header"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard Ejecutivo" description="Resumen operativo en tiempo real" />
      <div className="flex-1 p-6">
        <DashboardClient />
      </div>
    </>
  )
}
