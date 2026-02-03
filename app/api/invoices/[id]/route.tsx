import { prisma } from "../../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

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
    const { status } = body

    if (!status) {
      return new NextResponse("Missing status", { status: 400 })
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json(invoice)
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
    // Delete invoice items first (cascade should handle this but explicit is safer if not configured)
    // Actually prisma schema usually handles cascade delete if relations are set up right.
    // Assuming cascade delete is enabled in schema or we delete the invoice and items go with it.
    // If not, we might need a transaction.
    
    // We will try to delete the invoice directly.
    await prisma.invoice.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
