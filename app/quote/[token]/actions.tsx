'use client'

import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function QuoteActions({ token, status }: { token: string, status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (status !== 'SENT' && status !== 'DRAFT') {
    return (
      <div className={`p-4 rounded-md text-center font-medium ${
        status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
        status === 'REJECTED' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        Ce devis a été {
          status === 'ACCEPTED' ? 'accepté' :
          status === 'REJECTED' ? 'refusé' :
          status
        }.
      </div>
    )
  }

  const handleResponse = async (action: 'ACCEPTED' | 'REJECTED') => {
    if (!confirm(action === 'ACCEPTED' ? 'Confirmer l\'acceptation du devis ?' : 'Confirmer le refus du devis ?')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/public/quotes/${token}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Une erreur est survenue.')
      }
    } catch (error) {
      console.error(error)
      alert('Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-4 justify-center">
      <button
        onClick={() => handleResponse('ACCEPTED')}
        disabled={loading}
        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 font-bold disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Check />}
        Accepter le devis
      </button>
      <button
        onClick={() => handleResponse('REJECTED')}
        disabled={loading}
        className="flex-1 bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 flex items-center justify-center gap-2 font-bold disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : <X />}
        Refuser
      </button>
    </div>
  )
}
