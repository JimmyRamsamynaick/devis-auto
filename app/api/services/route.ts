import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const services = await prisma.service.findMany({
      orderBy: { category: 'asc' }
    })
    return NextResponse.json(services)
  } catch {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
