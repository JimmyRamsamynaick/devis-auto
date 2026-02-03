'use client'

import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InvoiceActionsProps {
  invoiceId: string
  status: string
}

export function InvoiceActions({ invoiceId, status }: InvoiceActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleMarkAsPaid = async () => {
    if (!confirm('Voulez-vous marquer cette facture comme payée ?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' })
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error(error)
      alert('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'PAID') return null

  return (
    <button
      onClick={handleMarkAsPaid}
      disabled={loading}
      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
    >
      {loading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
      Marquer comme payée
    </button>
  )
}
