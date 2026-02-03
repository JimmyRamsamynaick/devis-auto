'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Download, FileText, Loader2, Send, Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface QuoteRowActionsProps {
  quoteId: string
  status: string
  clientEmail?: string
}

export default function QuoteRowActions({ quoteId, status, clientEmail }: QuoteRowActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleConvert = async () => {
    if (!confirm('Voulez-vous convertir ce devis en facture ?')) return


    setLoading(true)
    try {
      const res = await fetch(`/api/quotes/${quoteId}/convert`, {
        method: 'POST'
      })

      if (res.ok) {
        router.push('/invoices')
        router.refresh()
      } else {
        alert('Erreur lors de la conversion')
      }
    } catch (error) {
      console.error(error)
      alert('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!confirm(`Envoyer le devis à ${clientEmail || 'client'} ?`)) return

    setSending(true)
    try {
      const res = await fetch(`/api/quotes/${quoteId}/send`, {
        method: 'POST'
      })

      if (res.ok) {
        alert('Devis envoyé avec succès')
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
    if (!confirm('Voulez-vous vraiment supprimer ce devis ?')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
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
      {status === 'ACCEPTED' && (
        <button 
          onClick={handleConvert} 
          disabled={loading}
          className="text-purple-600 hover:text-purple-900"
          title="Convertir en facture"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
        </button>
      )}

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
        <Link href={`/quotes/${quoteId}/edit`} className="text-gray-600 hover:text-gray-900" title="Modifier">
          <Edit size={18} />
        </Link>
      )}
      
      <Link href={`/quotes/${quoteId}`} className="text-blue-600 hover:text-blue-900" title="Voir">
        <Eye size={18} />
      </Link>
      
      <a 
        href={`/api/quotes/${quoteId}/pdf`} 
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
