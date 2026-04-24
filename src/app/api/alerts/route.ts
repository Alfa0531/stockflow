import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const alerts = await prisma.alert.findMany({
    include: { product: { include: { category: true } } },
    orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
  })
  return NextResponse.json(alerts)
}

export async function PATCH(req: NextRequest) {
  const { id } = await req.json()
  const alert = await prisma.alert.update({ where: { id }, data: { resolved: true } })
  return NextResponse.json(alert)
}
