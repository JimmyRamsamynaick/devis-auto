import { prisma } from "../../../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"
import { NextResponse } from "next/server"
import { QuoteItem } from "@prisma/client"

export async function POST(
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
      include: { items: true }
    })

    if (!quote) {
      return new NextResponse("Quote not found", { status: 404 })
    }

    if (quote.status !== 'ACCEPTED') {
      return new NextResponse("Quote must be accepted before conversion", { status: 400 })
    }

    // Check if already converted (optional check, or relies on unique constraint if we had one)
    const existingInvoice = await prisma.invoice.findUnique({
      where: { quoteId: quote.id }
    })

    if (existingInvoice) {
      return new NextResponse("Invoice already exists for this quote", { status: 400 })
    }

    // Generate Invoice Number
    const year = new Date().getFullYear()
    const count = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1)
        }
      }
    })
    const number = `FAC-${year}-${(count + 1).toString().padStart(4, '0')}`

    // Create Invoice
    const invoice = await prisma.invoice.create({
      data: {
        number,
        clientId: quote.clientId,
        quoteId: quote.id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        subtotal: quote.subtotal,
        taxRate: quote.taxRate,
        taxAmount: quote.taxAmount,
        discount: quote.discount,
        total: quote.total,
        depositPaid: quote.deposit,
        balanceDue: quote.total - quote.deposit,
        status: 'SENT', // Assuming we send it immediately or mark as sent
        items: {
          create: quote.items.map((item: QuoteItem) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          }))
        }
      }
    })

    // Update Quote status
    await prisma.quote.update({
      where: { id: quote.id },
      data: { status: 'CONVERTED' }
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
