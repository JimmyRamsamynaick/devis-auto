import { prisma } from "../../../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"
import { NextResponse } from "next/server"
import { sendEmail } from "../../../../../lib/email"
import { renderToStream } from "@react-pdf/renderer"
import QuotePDF from "../../../../../components/pdf/QuotePDF"

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
      include: { 
        client: true,
        items: true
      }
    })

    if (!quote) {
      return new NextResponse("Not Found", { status: 404 })
    }

    // Generate PDF
    const stream = await renderToStream(<QuotePDF quote={quote} />)
    const chunks: Buffer[] = []
    
    for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
      chunks.push(Buffer.from(chunk))
    }
    const pdfBuffer = Buffer.concat(chunks)

    // Send Email
    const publicUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const link = `${publicUrl}/quote/${quote.token}`

    await sendEmail({
      to: quote.client.email,
      subject: `Votre devis ${quote.number}`,
      html: `
        <p>Bonjour ${quote.client.name},</p>
        <p>Veuillez trouver ci-joint votre devis ${quote.number}.</p>
        <p>Vous pouvez consulter et accepter ce devis en ligne en cliquant sur le lien suivant :</p>
        <p><a href="${link}">${link}</a></p>
        <p>Cordialement,<br>JimmyTech</p>
      `,
      attachments: [
        {
          filename: `Dev${quote.client.name.replace(/\s+/g, '')}-${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBuffer,
        }
      ]
    })

    // Update status if it was draft
    if (quote.status === 'DRAFT') {
      await prisma.quote.update({
        where: { id: quote.id },
        data: { status: 'SENT' }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
