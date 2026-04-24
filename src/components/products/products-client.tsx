"use client"

import { useEffect, useState, useMemo } from "react"
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, flexRender, type ColumnDef, type SortingState } from "@tanstack/react-table"
import { Plus, Search, ArrowUpDown, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StockBadge } from "./stock-badge"
import { ProductForm } from "./product-form"
import { formatCurrency, formatNumber, calculateMargin } from "@/lib/utils"

type Product = {
  id: string; sku: string; name: string; brand: string | null
  cost: number; price: number; stockCurrent: number; stockMin: number; stockMax: number
  leadTime: number; location: string | null; status: string; unit: string
  category: { name: string } | null; supplier: { name: string } | null
}

export function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadProducts = () => {
    setLoading(true)
    fetch(`/api/products?search=${encodeURIComponent(search)}`)
      .then(r => r.json())
      .then(d => { setProducts(d); setLoading(false) })
  }

  useEffect(() => { loadProducts() }, [search])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Descontinuar "${name}"?`)) return
    setDeleting(id)
    await fetch(`/api/products/${id}`, { method: "DELETE" })
    toast.success("Producto descontinuado")
    loadProducts()
    setDeleting(null)
  }

  const columns = useMemo<ColumnDef<Product>[]>(() => [
    {
      accessorKey: "sku",
      header: ({ column }) => (
        <button className="flex items-center gap-1 text-xs font-medium" onClick={() => column.toggleSorting()}>
          SKU <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.sku}</span>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button className="flex items-center gap-1 text-xs font-medium" onClick={() => column.toggleSorting()}>
          Producto <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-foreground">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.brand ?? "—"} · {row.original.unit}</p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: () => <span className="text-xs font-medium">Categoría</span>,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.category?.name ?? "—"}</span>,
    },
    {
      accessorKey: "cost",
      header: () => <span className="text-xs font-medium">Costo</span>,
      cell: ({ row }) => <span className="text-xs">{formatCurrency(row.original.cost)}</span>,
    },
    {
      accessorKey: "price",
      header: () => <span className="text-xs font-medium">Precio</span>,
      cell: ({ row }) => (
        <div>
          <span className="text-xs font-medium">{formatCurrency(row.original.price)}</span>
          <p className="text-[10px] text-muted-foreground">{calculateMargin(row.original.cost, row.original.price).toFixed(1)}% margen</p>
        </div>
      ),
    },
    {
      accessorKey: "stockCurrent",
      header: ({ column }) => (
        <button className="flex items-center gap-1 text-xs font-medium" onClick={() => column.toggleSorting()}>
          Stock <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-semibold">{formatNumber(row.original.stockCurrent)}</p>
          <p className="text-[10px] text-muted-foreground">Mín: {row.original.stockMin} · Máx: {row.original.stockMax}</p>
        </div>
      ),
    },
    {
      id: "stockStatus",
      header: () => <span className="text-xs font-medium">Estado</span>,
      cell: ({ row }) => (
        <StockBadge
          current={row.original.stockCurrent}
          min={row.original.stockMin}
          max={row.original.stockMax}
          status={row.original.status}
        />
      ),
    },
    {
      accessorKey: "supplier",
      header: () => <span className="text-xs font-medium">Proveedor</span>,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.supplier?.name ?? "—"}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditProduct(row.original); setFormOpen(true) }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => handleDelete(row.original.id, row.original.name)}
            disabled={deleting === row.original.id}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ], [deleting])

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, SKU, marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{products.length} productos</span>
          <Button size="sm" className="h-8 gap-1.5" onClick={() => { setEditProduct(null); setFormOpen(true) }}>
            <Plus className="h-3.5 w-3.5" />Nuevo producto
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="border-border hover:bg-transparent">
                {hg.headers.map(h => (
                  <TableHead key={h.id} className="h-9 px-4 bg-muted/30 text-muted-foreground">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j} className="px-4 py-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-muted-foreground">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="border-border hover:bg-muted/20 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="px-4 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <ProductForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditProduct(null) }}
        onSaved={loadProducts}
        product={editProduct}
      />
    </div>
  )
}
