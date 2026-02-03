import { prisma } from "../../../lib/prisma"
import { notFound } from "next/navigation"
import QuoteActions from "./actions"

export default async function PublicQuotePage(
  props: { params: Promise<{ token: string }> }
) {
  const params = await props.params;
  const quote = await prisma.quote.findUnique({
    where: { token: params.token },
    include: { 
      client: true,
      items: true
    }
  })

  if (!quote) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">DEVIS</h1>
            <p className="text-gray-400">#{quote.number}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Date d&apos;émission</div>
            <div className="font-medium">{new Date(quote.createdAt).toLocaleDateString('fr-FR')}</div>
          </div>
        </div>

        <div className="p-8">
          {/* Client & Vendor Info */}
          <div className="flex flex-col md:flex-row justify-between mb-12 gap-8">
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">De</h3>
              <div className="text-gray-900 font-medium">Auto Devis</div>
              <div className="text-gray-600">123 Rue de l&apos;Innovation</div>
              <div className="text-gray-600">75001 Paris, France</div>
              <div className="text-gray-600">contact@autodevis.com</div>
            </div>
            <div className="md:text-right">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Pour</h3>
              <div className="text-gray-900 font-medium">{quote.client.name}</div>
              {quote.client.companyName && (
                <div className="text-gray-600">{quote.client.companyName}</div>
              )}
              <div className="text-gray-600">{quote.client.address}</div>
              <div className="text-gray-600">{quote.client.email}</div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-12">
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

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-64 space-y-3">
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

          {/* Actions */}
          <div className="border-t border-gray-200 pt-8">
             <QuoteActions token={params.token} status={quote.status} />
          </div>
        </div>
      </div>
    </div>
  )
}
