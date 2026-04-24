import { Header } from "@/components/layout/header"
import { ScanTerminal } from "@/components/scan/scan-terminal"

export default function EscaneoPage() {
  return (
    <>
      <Header
        title="Terminal de Escaneo"
        description="Escanea las cajas para registrar entradas y salidas"
      />
      <div className="flex-1 p-6">
        <ScanTerminal />
      </div>
    </>
  )
}
