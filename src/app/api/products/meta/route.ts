import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const [categories, suppliers, warehouses] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.warehouse.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ])
  return NextResponse.json({ categories, suppliers, warehouses })
}
