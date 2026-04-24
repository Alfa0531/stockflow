import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get("productId")
  const type = searchParams.get("type")
  const limit = parseInt(searchParams.get("limit") ?? "50")

  const movements = await prisma.inventoryMovement.findMany({
    where: {
      ...(productId ? { productId } : {}),
      ...(type ? { type: type as any } : {}),
    },
    include: { product: { include: { category: true } }, warehouse: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return NextResponse.json(movements)
}

const movementSchema = z.object({
  productId: z.string(),
  warehouseId: z.string(),
  type: z.enum(["PURCHASE_IN", "SALE_OUT", "ADJUSTMENT_IN", "ADJUSTMENT_OUT", "RETURN_IN", "RETURN_OUT", "SHRINKAGE", "TRANSFER_IN", "TRANSFER_OUT"]),
  quantity: z.number().positive("Cantidad debe ser mayor a 0"),
  unitCost: z.number().optional(),
  reference: z.string().optional(),
  lot: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = movementSchema.parse(body)

  const product = await prisma.product.findUniqueOrThrow({ where: { id: data.productId } })

  const isIncoming = ["PURCHASE_IN", "ADJUSTMENT_IN", "RETURN_IN", "TRANSFER_IN"].includes(data.type)
  const stockBefore = product.stockCurrent
  const stockAfter = isIncoming ? stockBefore + data.quantity : stockBefore - data.quantity

  if (stockAfter < 0) {
    return NextResponse.json({ error: "Stock insuficiente para esta operación" }, { status: 400 })
  }

  const [movement] = await prisma.$transaction([
    prisma.inventoryMovement.create({
      data: {
        productId: data.productId,
        warehouseId: data.warehouseId,
        type: data.type,
        quantity: data.quantity,
        unitCost: data.unitCost,
        stockBefore,
        stockAfter,
        reference: data.reference,
        lot: data.lot,
        notes: data.notes,
      },
      include: { product: true },
    }),
    prisma.product.update({
      where: { id: data.productId },
      data: {
        stockCurrent: stockAfter,
        status: stockAfter === 0 ? "OUT_OF_STOCK" : product.status === "OUT_OF_STOCK" ? "ACTIVE" : product.status,
      },
    }),
  ])

  return NextResponse.json(movement, { status: 201 })
}
