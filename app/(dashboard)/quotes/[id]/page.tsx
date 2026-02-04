import { prisma } from "../../../../lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Edit } from "lucide-react"

export default async function QuoteDetailsPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      items: true
    }
  })

  if (!quote) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/quotes" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Devis {quote.number}</h1>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full 
            ${quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 
              quote.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 
              quote.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
              'bg-gray-100 text-gray-800'}`}>
            {quote.status === 'DRAFT' ? 'Brouillon' :
             quote.status === 'SENT' ? 'Envoyé' :
             quote.status === 'ACCEPTED' ? 'Accepté' :
             quote.status === 'REJECTED' ? 'Refusé' : quote.status}
          </span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {quote.status === 'DRAFT' && (
            <Link
              href={`/quotes/${quote.id}/edit`}
              className="flex-1 sm:flex-none justify-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center gap-2"
            >
              <Edit size={20} />
              <span className="sm:inline">Modifier</span>
            </Link>
          )}
          <a
            href={`/api/quotes/${quote.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none justify-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Download size={20} />
            <span className="sm:inline">PDF</span>
          </a>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-12 gap-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">JimmyTech</h2>
            <div className="text-gray-600">Auterive 31190 France</div>
            <div className="text-gray-600">jimmyramsamynaick@gmail.com</div>
          </div>
          <div className="text-left md:text-right w-full md:w-auto">
            <div className="text-sm text-gray-500 mb-1">DEVIS N°</div>
            <div className="text-xl font-bold text-gray-900 mb-4">{quote.number}</div>
            
            <div className="grid grid-cols-2 md:block gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Date d&apos;émission</div>
                <div className="font-medium mb-2">{new Date(quote.createdAt).toLocaleDateString('fr-FR')}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Valide jusqu&apos;au</div>
                <div className="font-medium">{new Date(quote.validUntil).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 md:mb-12">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Pour</h3>
          <div className="text-gray-900 font-bold text-lg mb-1">{quote.client.name}</div>
          {quote.client.companyName && (
            <div className="text-gray-900 mb-1">{quote.client.companyName}</div>
          )}
          <div className="text-gray-600">{quote.client.address}</div>
          <div className="text-gray-600">{quote.client.email}</div>
          <div className="text-gray-600">{quote.client.phone}</div>
        </div>

        {/* Items */}
        <div className="overflow-x-auto -mx-6 sm:mx-0 mb-8 md:mb-12">
          <div className="inline-block min-w-full align-middle px-6 sm:px-0">
            <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qté</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prix Unit.</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {quote.items.map((item: { description: string; quantity: number; unitPrice: number }, idx: number) => (
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
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-64 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Sous-total HT</span>
              <span>{quote.subtotal.toFixed(2)} €</span>
            </div>
            {quote.discount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Remise</span>
                <span>-{quote.discount.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>TVA ({quote.taxRate}%)</span>
              <span>{quote.taxAmount.toFixed(2)} €</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between text-lg font-bold text-gray-900">
              <span>Total TTC</span>
              <span>{quote.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
