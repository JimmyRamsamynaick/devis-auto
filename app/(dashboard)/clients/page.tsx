import { prisma } from "../../../lib/prisma"
import Link from "next/link"
import { Plus, Search, Building, Mail, Phone, MapPin } from "lucide-react"
import { Client } from "@prisma/client"

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <Link 
          href="/clients/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nouveau Client
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un client..."
              className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 border"
            />
          </div>
        </div>

        <ul className="divide-y divide-gray-200">
          {clients.length === 0 ? (
            <li className="p-6 text-center text-gray-500">Aucun client trouvé</li>
          ) : (
            clients.map((client: Client) => (
              <li key={client.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        {client.companyName && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Building size={14} />
                            {client.companyName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail size={14} />
                        {client.email}
                      </div>
                      {client.phone && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone size={14} />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  {client.address && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center gap-1 ml-14">
                      <MapPin size={14} />
                      {client.address}
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
