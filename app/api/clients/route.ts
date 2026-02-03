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
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(clients)
  } catch {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, email, companyName, address, phone } = body

    if (!name || !email) {
      return new NextResponse("Name and Email are required", { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        companyName,
        address,
        phone,
      }
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
