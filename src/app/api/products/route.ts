import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().optional(),
  description: z.string().optional(),
  unit: z.string().default("PZA"),
  cost: z.number().positive(),
  price: z.number().positive(),
  stockCurrent: z.number().min(0).default(0),
  stockMin: z.number().min(0).default(0),
  stockMax: z.number().min(0).default(0),
  stockSafety: z.number().min(0).default(0),
  leadTime: z.number().int().min(1).default(7),
  location: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  warehouseId: z.string(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") ?? ""
  const categoryId = searchParams.get("categoryId")
  const status = searchParams.get("status")

  const products = await prisma.product.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { name: { contains: search } },
            { sku: { contains: search } },
            { brand: { contains: search } },
          ],
        } : {},
        categoryId ? { categoryId } : {},
        status ? { status: status as any } : {},
      ],
    },
    include: { category: true, supplier: true, warehouse: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = productSchema.parse(body)

  const product = await prisma.product.create({
    data: {
      ...data,
      status: "ACTIVE",
    },
    include: { category: true, supplier: true },
  })

  // Create initial inventory movement
  if (data.stockCurrent > 0) {
    await prisma.inventoryMovement.create({
      data: {
        productId: product.id,
        warehouseId: data.warehouseId,
        type: "INITIAL",
        quantity: data.stockCurrent,
        unitCost: data.cost,
        stockBefore: 0,
        stockAfter: data.stockCurrent,
        notes: "Stock inicial al crear producto",
      },
    })
  }

  return NextResponse.json(product, { status: 201 })
}
