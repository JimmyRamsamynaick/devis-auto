import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: true
      }
    })
    return NextResponse.json(quotes)
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
    const { clientId, items, validUntil, taxRate, discount } = body as {
      clientId: string
      items: { description: string; quantity: number; unitPrice: number }[]
      validUntil: string
      taxRate: number
      discount?: number
    }

    if (!clientId || !items || items.length === 0) {
      return new NextResponse("Client and items are required", { status: 400 })
    }

    // Calculate totals
    const subtotal = items.reduce((acc: number, item) => {
      return acc + (item.quantity * item.unitPrice)
    }, 0)

    const taxAmount = (subtotal - (discount || 0)) * (taxRate / 100)
    const total = (subtotal - (discount || 0)) + taxAmount

    // Generate Quote Number
    const year = new Date().getFullYear()
    const count = await prisma.quote.count({
      where: {
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1)
        }
      }
    })
    const number = `DEV-${year}-${(count + 1).toString().padStart(4, '0')}`

    const quote = await prisma.quote.create({
      data: {
        number,
        clientId,
        validUntil: new Date(validUntil),
        subtotal,
        taxRate,
        taxAmount,
        discount: discount || 0,
        total,
        status: 'DRAFT',
        items: {
          create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        }
      }
    })

    return NextResponse.json(quote)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
