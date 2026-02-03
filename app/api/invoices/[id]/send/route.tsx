import { prisma } from "../../../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"
import { NextResponse } from "next/server"
import { sendEmail } from "../../../../../lib/email"
import { renderToStream } from "@react-pdf/renderer"
import InvoicePDF from "../../../../../components/pdf/InvoicePDF"

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
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { 
        client: true,
        items: true
      }
    })

    if (!invoice) {
      return new NextResponse("Not Found", { status: 404 })
    }

    // Generate PDF
    const stream = await renderToStream(<InvoicePDF invoice={invoice} />)
    const chunks: Buffer[] = []
    
    for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
      chunks.push(Buffer.from(chunk))
    }
    const pdfBuffer = Buffer.concat(chunks)

    await sendEmail({
      to: invoice.client.email,
      subject: `Votre facture ${invoice.number}`,
      html: `
        <p>Bonjour ${invoice.client.name},</p>
        <p>Veuillez trouver ci-joint votre facture ${invoice.number}.</p>
        <p>Merci de procéder au règlement avant le ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}.</p>
        <p>Cordialement,<br>JimmyTech</p>
      `,
      attachments: [
        {
          filename: `Fact${invoice.client.name.replace(/\s+/g, '')}-${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBuffer,
        }
      ]
    })

    if (invoice.status === 'DRAFT') {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'SENT' }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
