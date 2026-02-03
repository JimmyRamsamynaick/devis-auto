import { prisma } from "../../../../../lib/prisma"
import { notFound } from "next/navigation"
import ClientForm from "./ClientForm"

export default async function EditClientPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const client = await prisma.client.findUnique({
    where: { id: params.id }
  })

  if (!client) {
    notFound()
  }

  return <ClientForm client={client} />
}
