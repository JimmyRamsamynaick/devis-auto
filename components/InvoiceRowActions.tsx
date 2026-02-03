'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Download, Loader2, Send, CheckCircle, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InvoiceRowActionsProps {
  invoiceId: string
  status: string
  clientEmail?: string
}

export default function InvoiceRowActions({ invoiceId, status, clientEmail }: InvoiceRowActionsProps) {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [markingPaid, setMarkingPaid] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSend = async () => {
    if (!confirm(`Envoyer la facture à ${clientEmail || 'client'} ?`)) return


    setSending(true)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST'
      })

      if (res.ok) {
        alert('Facture envoyée avec succès')
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

  const handleMarkAsPaid = async () => {
    if (!confirm('Voulez-vous marquer cette facture comme payée ?')) return
    setMarkingPaid(true)
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
      setMarkingPaid(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer cette facture ? Attention, cela affectera le chiffre d\'affaires si elle est payée.')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
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
      {status !== 'PAID' && (
        <button
          onClick={handleMarkAsPaid}
          disabled={markingPaid}
          className="text-green-600 hover:text-green-900"
          title="Marquer comme payée"
        >
          {markingPaid ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
        </button>
      )}

      <button 
        onClick={handleSend} 
        disabled={sending}
        className="text-green-600 hover:text-green-900"
        title="Envoyer par email"
      >
        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
      </button>

      <Link href={`/invoices/${invoiceId}`} className="text-blue-600 hover:text-blue-900" title="Voir">
        <Eye size={18} />
      </Link>
      
      <a 
        href={`/api/invoices/${invoiceId}/pdf`} 
        className="text-gray-600 hover:text-gray-900"
        target="_blank"
        rel="noopener noreferrer"
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
