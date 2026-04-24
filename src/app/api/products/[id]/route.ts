import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  cost: z.number().positive().optional(),
  price: z.number().positive().optional(),
  stockMin: z.number().min(0).optional(),
  stockMax: z.number().min(0).optional(),
  stockSafety: z.number().min(0).optional(),
  leadTime: z.number().int().min(1).optional(),
  location: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  active: z.boolean().optional(),
  status: z.enum(["ACTIVE", "SLOW_MOVING", "DEAD", "OUT_OF_STOCK", "DISCONTINUED"]).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: true,
      warehouse: true,
      movements: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  })
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data = updateSchema.parse(body)
  const product = await prisma.product.update({ where: { id }, data, include: { category: true, supplier: true } })
  return NextResponse.json(product)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.product.update({ where: { id }, data: { active: false, status: "DISCONTINUED" } })
  return NextResponse.json({ ok: true })
}
