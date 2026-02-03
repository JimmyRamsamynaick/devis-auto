import { prisma } from "../../../../../../lib/prisma"
import { NextResponse } from "next/server"
import { sendEmail } from "../../../../../../lib/email"

export async function POST(
  req: Request,
  props: { params: Promise<{ token: string }> }
) {
  const params = await props.params;
  try {
    const { action } = await req.json()

    if (!['ACCEPTED', 'REJECTED'].includes(action)) {
      return new NextResponse("Invalid action", { status: 400 })
    }

    const quote = await prisma.quote.findUnique({
      where: { token: params.token },
      include: { client: true }
    })

    if (!quote) {
      return new NextResponse("Not Found", { status: 404 })
    }

    if (quote.status !== 'SENT' && quote.status !== 'DRAFT') {
      return new NextResponse("Quote already processed", { status: 400 })
    }

    const updatedQuote = await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: action
      }
    })

    // Send email notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_FROM || 'admin@example.com'
    
    await sendEmail({
      to: adminEmail,
      subject: `Devis ${quote.number} ${action === 'ACCEPTED' ? 'Accepté' : 'Refusé'}`,
      html: `
        <p>Le devis <strong>${quote.number}</strong> a été ${action === 'ACCEPTED' ? 'accepté' : 'refusé'} par le client ${quote.client.name}.</p>
        <p>Montant total : ${quote.total.toFixed(2)} €</p>
        <p><a href="${process.env.NEXTAUTH_URL}/quotes/${quote.id}">Voir le devis</a></p>
      `
    })

    return NextResponse.json(updatedQuote)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
