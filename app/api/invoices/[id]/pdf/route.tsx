import { prisma } from "../../../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"
import { NextResponse } from "next/server"
import { renderToStream } from "@react-pdf/renderer"
import InvoicePDF from "../../../../../components/pdf/InvoicePDF"

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

    const stream = await renderToStream(<InvoicePDF invoice={invoice} />)

    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      }
    });

    return new NextResponse(webStream as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.client.name.replace(/\s+/g, '')}-${new Date().toISOString().split('T')[0]}-${invoice.number}.pdf"`,
      },
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
