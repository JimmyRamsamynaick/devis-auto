import { prisma } from "../../../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"
import { NextResponse } from "next/server"
import { sendEmail } from "../../../../../lib/email"
import { renderToStream } from "@react-pdf/renderer"
import PurchaseOrderPDF from "../../../../../components/pdf/PurchaseOrderPDF"

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
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
      include: { 
        client: true,
        items: true
      }
    })

    if (!purchaseOrder) {
      return new NextResponse("Not Found", { status: 404 })
    }

    // Generate PDF
    const stream = await renderToStream(<PurchaseOrderPDF purchaseOrder={purchaseOrder} />)
    const chunks: Buffer[] = []
    
    for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
      chunks.push(Buffer.from(chunk))
    }
    const pdfBuffer = Buffer.concat(chunks)

    // Send Email
    // Note: Purchase orders don't typically have a public "view and accept" link like quotes do, 
    // but if you want one, you'd need to create a page for it (e.g. /purchase-order/[token]).
    // For now, I'll just send the PDF attachment.
    
    await sendEmail({
      to: purchaseOrder.client.email,
      subject: `Votre Bon de Commande ${purchaseOrder.number}`,
      html: `
        <p>Bonjour ${purchaseOrder.client.name},</p>
        <p>Veuillez trouver ci-joint votre bon de commande ${purchaseOrder.number}.</p>
        <p>Cordialement,<br>JimmyTech</p>
      `,
      attachments: [
        {
          filename: `BC-${purchaseOrder.client.name.replace(/\s+/g, '')}-${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBuffer,
        }
      ]
    })

    // Update status if it was draft
    if (purchaseOrder.status === 'DRAFT') {
      await prisma.purchaseOrder.update({
        where: { id: purchaseOrder.id },
        data: { status: 'SENT' }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
