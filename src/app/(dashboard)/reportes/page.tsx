import { Header } from "@/components/layout/header"
import { ReportsClient } from "@/components/reports/reports-client"

export default function ReportesPage() {
  return (
    <>
      <Header title="Reportes Avanzados" description="Análisis ABC, rotación de inventario, aging y productos muertos" />
      <div className="flex-1 p-6">
        <ReportsClient />
      </div>
    </>
  )
}
