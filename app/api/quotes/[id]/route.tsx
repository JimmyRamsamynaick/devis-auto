import { prisma } from "../../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        items: true
      }
    })

    if (!quote) {
      return new NextResponse("Quote not found", { status: 404 })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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

    // Update Quote
    // We use a transaction to ensure items are updated correctly
    const updatedQuote = await prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      await tx.quote.update({
        where: { id: params.id },
        data: {
          clientId,
          validUntil: new Date(validUntil),
          subtotal,
          taxRate,
          taxAmount,
          discount: discount || 0,
          total,
          items: {
            deleteMany: {}, // Remove all existing items
            create: items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice
            }))
          }
        }
      })
      
      // Return the updated quote with relations
      return tx.quote.findUnique({
        where: { id: params.id },
        include: {
          client: true,
          items: true
        }
      })
    })

    return NextResponse.json(updatedQuote)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    await prisma.quote.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
