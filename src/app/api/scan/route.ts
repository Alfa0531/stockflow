import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET /api/scan?code=7501234567890
// Busca primero por barcode (EAN del fabricante), luego por SKU interno
export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get("code")?.trim()
  if (!code) return NextResponse.json({ error: "Código requerido" }, { status: 400 })

  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { barcode: code },
        { sku: code },
      ],
      active: true,
    },
    include: { category: true, supplier: true, warehouse: true },
  })

  if (!product) {
    return NextResponse.json({ found: false, code }, { status: 404 })
  }

  return NextResponse.json({ found: true, product })
}

// PATCH /api/scan — registrar barcode a un producto existente
const linkSchema = z.object({
  productId: z.string(),
  barcode: z.string().min(1),
})

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { productId, barcode } = linkSchema.parse(body)

  // Verificar que el barcode no esté ya asignado a otro producto
  const existing = await prisma.product.findFirst({
    where: { barcode, NOT: { id: productId } },
  })
  if (existing) {
    return NextResponse.json(
      { error: `Barcode ya asignado a: ${existing.name}` },
      { status: 409 }
    )
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: { barcode },
  })

  return NextResponse.json(product)
}

// POST /api/scan — registrar movimiento desde escáner (entrada o salida)
const scanMoveSchema = z.object({
  productId: z.string(),
  warehouseId: z.string(),
  type: z.enum(["PURCHASE_IN", "SALE_OUT"]),
  quantity: z.number().positive(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = scanMoveSchema.parse(body)

  const product = await prisma.product.findUniqueOrThrow({ where: { id: data.productId } })

  const isIncoming = data.type === "PURCHASE_IN"
  const stockBefore = product.stockCurrent
  const stockAfter = isIncoming ? stockBefore + data.quantity : stockBefore - data.quantity

  if (stockAfter < 0) {
    return NextResponse.json(
      { error: `Stock insuficiente. Disponible: ${stockBefore} cajas` },
      { status: 400 }
    )
  }

  const [movement] = await prisma.$transaction([
    prisma.inventoryMovement.create({
      data: {
        productId: data.productId,
        warehouseId: data.warehouseId,
        type: data.type,
        quantity: data.quantity,
        unitCost: product.cost,
        stockBefore,
        stockAfter,
        reference: data.reference,
        notes: data.notes,
      },
    }),
    prisma.product.update({
      where: { id: data.productId },
      data: {
        stockCurrent: stockAfter,
        status: stockAfter === 0 ? "OUT_OF_STOCK" : "ACTIVE",
      },
    }),
  ])

  return NextResponse.json({
    ok: true,
    movement,
    stockBefore,
    stockAfter,
    productName: product.name,
  }, { status: 201 })
}
