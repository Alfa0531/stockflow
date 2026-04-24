import { Header } from "@/components/layout/header"
import { ProductsClient } from "@/components/products/products-client"

export default function ProductosPage() {
  return (
    <>
      <Header title="Catálogo de Productos" description="Gestión completa de SKUs, precios y niveles de stock" />
      <div className="flex-1 p-6">
        <ProductsClient />
      </div>
    </>
  )
}
