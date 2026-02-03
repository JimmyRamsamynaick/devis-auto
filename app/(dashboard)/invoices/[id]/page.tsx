import { prisma } from "../../../../lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"

export default async function InvoiceDetailsPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      items: true
    }
  })

  if (!invoice) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Facture {invoice.number}</h1>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full 
            ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 
              invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'}`}>
            {invoice.status}
          </span>
        </div>
        <div className="flex gap-2">
          <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Download size={20} />
            Télécharger PDF
          </a>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">JimmyTech</h2>
            <div className="text-gray-600">Auterive 31190 France</div>
            <div className="text-gray-600">jimmyramsamynaick@gmail.com</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">FACTURE N°</div>
            <div className="text-xl font-bold text-gray-900 mb-4">{invoice.number}</div>
            
            <div className="text-sm text-gray-500 mb-1">Date d&apos;émission</div>
            <div className="font-medium mb-2">{new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</div>
            
            <div className="text-sm text-gray-500 mb-1">Date d&apos;échéance</div>
            <div className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</div>
          </div>
        </div>

        {/* Client */}
        <div className="bg-gray-50 p-6 rounded-lg mb-12">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Facturé à</h3>
          <div className="text-gray-900 font-bold text-lg mb-1">{invoice.client.name}</div>
          {invoice.client.companyName && (
            <div className="text-gray-900 mb-1">{invoice.client.companyName}</div>
          )}
          <div className="text-gray-600">{invoice.client.address}</div>
          <div className="text-gray-600">{invoice.client.email}</div>
          <div className="text-gray-600">{invoice.client.phone}</div>
        </div>

        {/* Items */}
        <table className="min-w-full divide-y divide-gray-200 mb-12">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qté</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prix Unit.</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice.items.map((item: { description: string; quantity: number; unitPrice: number }, idx: number) => (
              <tr key={idx}>
                <td className="px-3 py-4 text-sm text-gray-900">{item.description}</td>
                <td className="px-3 py-4 text-sm text-gray-900 text-center">{item.quantity}</td>
                <td className="px-3 py-4 text-sm text-gray-900 text-right">{item.unitPrice.toFixed(2)} €</td>
                <td className="px-3 py-4 text-sm text-gray-900 text-right">
                  {(item.quantity * item.unitPrice).toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Sous-total HT</span>
              <span>{invoice.subtotal.toFixed(2)} €</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Remise</span>
                <span>-{invoice.discount.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>TVA ({invoice.taxRate}%)</span>
              <span>{invoice.taxAmount.toFixed(2)} €</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between text-lg font-bold text-gray-900">
              <span>Total TTC</span>
              <span>{invoice.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
