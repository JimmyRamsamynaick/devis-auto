'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Download, Loader2, Send, Trash2, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PurchaseOrderRowActionsProps {
  purchaseOrderId: string
  status: string
  clientEmail?: string
}

export default function PurchaseOrderRowActions({ purchaseOrderId, status, clientEmail }: PurchaseOrderRowActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSend = async () => {
    if (!confirm(`Envoyer le bon de commande à ${clientEmail || 'client'} ?`)) return

    setSending(true)
    try {
      const res = await fetch(`/api/purchase-orders/${purchaseOrderId}/send`, {
        method: 'POST'
      })

      if (res.ok) {
        alert('Bon de commande envoyé avec succès')
        router.refresh()
      } else {
        alert('Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error(error)
      alert('Une erreur est survenue')
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer ce bon de commande ?')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/purchase-orders/${purchaseOrderId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error(error)
      alert('Une erreur est survenue')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex justify-end gap-2 items-center">
      {(status === 'DRAFT' || status === 'SENT') && (
        <button 
          onClick={handleSend} 
          disabled={sending}
          className="text-green-600 hover:text-green-900"
          title="Envoyer par email"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      )}

      {status === 'DRAFT' && (
        <Link href={`/purchase-orders/${purchaseOrderId}/edit`} className="text-gray-600 hover:text-gray-900" title="Modifier">
          <Edit size={18} />
        </Link>
      )}

      <Link 
        href={`/purchase-orders/${purchaseOrderId}`}
        className="text-blue-600 hover:text-blue-900"
        title="Voir"
      >
        <Eye size={18} />
      </Link>
      
      <a 
        href={`/api/purchase-orders/${purchaseOrderId}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 hover:text-gray-900"
        title="Télécharger PDF"
      >
        <Download size={18} />
      </a>

      <button 
        onClick={handleDelete}
        disabled={deleting}
        className="text-red-600 hover:text-red-900"
        title="Supprimer"
      >
        {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
      </button>
    </div>
  )
}
