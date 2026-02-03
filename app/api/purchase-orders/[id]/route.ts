import { prisma } from "../../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

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
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        items: true
      }
    })

    if (!purchaseOrder) {
      return new NextResponse("Purchase Order not found", { status: 404 })
    }

    return NextResponse.json(purchaseOrder)
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

    // Update Purchase Order
    const updatedPurchaseOrder = await prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      await tx.purchaseOrder.update({
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
      
      // Return the updated purchase order with relations
      return tx.purchaseOrder.findUnique({
        where: { id: params.id },
        include: {
          client: true,
          items: true
        }
      })
    })

    return NextResponse.json(updatedPurchaseOrder)
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
    await prisma.purchaseOrder.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
