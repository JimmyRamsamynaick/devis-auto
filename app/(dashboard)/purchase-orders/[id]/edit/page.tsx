'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PurchaseOrderForm from '@/components/PurchaseOrderForm'
import { Loader2 } from 'lucide-react'

export default function EditPurchaseOrderPage() {
  const params = useParams()
  const [purchaseOrder, setPurchaseOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        const res = await fetch(`/api/purchase-orders/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setPurchaseOrder(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPurchaseOrder()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    )
  }

  if (!purchaseOrder) {
    return <div className="text-center py-10">Bon de commande non trouvé</div>
  }

  return <PurchaseOrderForm initialData={purchaseOrder} isEditing={true} />
}
