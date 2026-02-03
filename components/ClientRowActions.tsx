'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ClientRowActionsProps {
  clientId: string
}

export default function ClientRowActions({ clientId }: ClientRowActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer ce client ? Cela supprimera également tous ses devis et factures associés.')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.refresh()
        window.location.reload()
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
    <div className="flex gap-2 items-center">
      <Link href={`/clients/${clientId}/edit`} className="text-gray-600 hover:text-gray-900" title="Modifier">
        <Edit size={18} />
      </Link>
      
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
