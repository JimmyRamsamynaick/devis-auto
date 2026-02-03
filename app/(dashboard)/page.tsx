import { prisma } from "../../lib/prisma"
import Link from "next/link"
import { FileText, Users, DollarSign } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [
    quotesCount,
    invoicesCount,
    clientsCount,
    recentQuotes,
    recentInvoices
  ] = await Promise.all([
    prisma.quote.count(),
    prisma.invoice.count(),
    prisma.client.count(),
    prisma.quote.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true }
    }),
    prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true }
    })
  ])

  // Calculate total revenue from paid invoices (current year only)
  const currentYear = new Date().getFullYear()
  const paidInvoices = await prisma.invoice.aggregate({
    where: { 
      status: 'PAID',
      createdAt: {
        gte: new Date(currentYear, 0, 1),
        lt: new Date(currentYear + 1, 0, 1)
      }
    },
    _sum: { total: true }
  })
  
  const totalRevenue = paidInvoices._sum.total || 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Chiffre d&apos;affaires ({currentYear})</p>
            <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-full text-purple-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Devis</p>
            <p className="text-2xl font-bold text-gray-900">{quotesCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Factures</p>
            <p className="text-2xl font-bold text-gray-900">{invoicesCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-full text-orange-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Clients</p>
            <p className="text-2xl font-bold text-gray-900">{clientsCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Devis récents</h2>
            <Link href="/quotes" className="text-sm text-blue-600 hover:text-blue-800">Voir tout</Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentQuotes.length === 0 ? (
              <p className="p-6 text-center text-gray-500">Aucun devis récent</p>
            ) : (
              recentQuotes.map((quote: { id: string; number: string; client: { name: string }; total: number; status: string }) => (
                <div key={quote.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{quote.number}</div>
                    <div className="text-sm text-gray-500">{quote.client.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{quote.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 
                      quote.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Factures récentes</h2>
            <Link href="/invoices" className="text-sm text-blue-600 hover:text-blue-800">Voir tout</Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentInvoices.length === 0 ? (
              <p className="p-6 text-center text-gray-500">Aucune facture récente</p>
            ) : (
              recentInvoices.map((invoice: { id: string; number: string; client: { name: string }; total: number; status: string }) => (
                <div key={invoice.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{invoice.number}</div>
                    <div className="text-sm text-gray-500">{invoice.client.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{invoice.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                      invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
