'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'

type Service = {
  id: string
  name: string
  description: string
  price: number
  category: string
}

type Client = {
  id: string
  name: string
  companyName?: string
}

type PurchaseOrderItem = {
  id?: string
  description: string
  quantity: number
  unitPrice: number
}

type PurchaseOrderFormValues = {
  clientId: string
  validUntil: string
  items: PurchaseOrderItem[]
  discount: number
  taxRate: number
}

interface PurchaseOrderFormProps {
  initialData?: any
  isEditing?: boolean
}

export default function PurchaseOrderForm({ initialData, isEditing = false }: PurchaseOrderFormProps) {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(!initialData)
  const [submitting, setSubmitting] = useState(false)

  const defaultValues = {
    clientId: initialData?.clientId || '',
    validUntil: initialData?.validUntil 
      ? new Date(initialData.validUntil).toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: initialData?.items?.map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })) || [{ description: '', quantity: 1, unitPrice: 0 }],
    discount: initialData?.discount || 0,
    taxRate: initialData?.taxRate || 20,
  }

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<PurchaseOrderFormValues>({
    defaultValues
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  const watchItems = watch("items")
  const watchDiscount = watch("discount")
  const watchTaxRate = watch("taxRate")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, servicesRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/services')
        ])
        
        if (clientsRes.ok) setClients(await clientsRes.json())
        if (servicesRes.ok) setServices(await servicesRes.json())
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const calculateTotals = () => {
    const subtotal = watchItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
    const discount = Number(watchDiscount) || 0
    const taxRate = Number(watchTaxRate) || 0
    
    const taxableAmount = Math.max(0, subtotal - discount)
    const taxAmount = taxableAmount * (taxRate / 100)
    const total = taxableAmount + taxAmount

    return { subtotal, discount, taxAmount, total }
  }

  const totals = calculateTotals()

  const handleServiceSelect = (index: number, value: string) => {
    if (value === 'livraison') {
      setValue(`items.${index}.description`, 'Livraison')
      setValue(`items.${index}.unitPrice`, 0)
    } else if (value === 'autre') {
      setValue(`items.${index}.description`, '')
      setValue(`items.${index}.unitPrice`, 0)
    } else {
      const service = services.find(s => s.id === value)
      if (service) {
        setValue(`items.${index}.description`, service.name)
        setValue(`items.${index}.unitPrice`, service.price)
      }
    }
  }

  const onSubmit = async (data: PurchaseOrderFormValues) => {
    setSubmitting(true)
    try {
      const url = isEditing ? `/api/purchase-orders/${initialData.id}` : '/api/purchase-orders'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        router.push('/purchase-orders')
        router.refresh()
      } else {
        alert(`Erreur lors de la ${isEditing ? 'modification' : 'création'} du bon de commande`)
      }
    } catch (error) {
      console.error(error)
      alert('Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/purchase-orders" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Modifier le Bon de Commande' : 'Nouveau Bon de Commande'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Client & Dates */}
        <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select
              {...register('clientId', { required: 'Le client est requis' })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Sélectionner un client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.companyName ? `(${client.companyName})` : ''}
                </option>
              ))}
            </select>
            {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valide jusqu'au</label>
            <input
              type="date"
              {...register('validUntil', { required: 'La date de validité est requise' })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.validUntil && <p className="mt-1 text-sm text-red-600">{errors.validUntil.message}</p>}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Articles</h2>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start bg-gray-50 p-4 rounded-md">
                <div className="flex-1 space-y-4">
                  <div>
                    <select
                      onChange={(e) => handleServiceSelect(index, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm mb-2"
                    >
                      <option value="">Sélectionner une prestation pré-définie...</option>
                      <optgroup label="Options manuelles">
                        <option value="livraison">Livraison (saisissez les détails)</option>
                        <option value="autre">Autre (saisissez les détails)</option>
                      </optgroup>
                      <optgroup label="Prestations">
                        {services.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {service.price}€
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <input
                      type="text"
                      placeholder="Description"
                      {...register(`items.${index}.description`, { required: 'La description est requise' })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-32">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Quantité</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true, min: 0.01 })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-40">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Prix unitaire</label>
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.unitPrice`, { valueAsNumber: true, min: 0 })}
                          className="block w-full rounded-md border-gray-300 pl-3 pr-8 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">€</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-40">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Total</label>
                      <div className="py-2 text-right font-medium text-gray-900">
                        {((watchItems[index]?.quantity || 0) * (watchItems[index]?.unitPrice || 0)).toFixed(2)} €
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                  disabled={fields.length === 1}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
            className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <Plus size={20} />
            Ajouter une ligne
          </button>
        </div>

        {/* Totals */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="w-full md:w-1/2 ml-auto space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sous-total</span>
              <span className="font-medium">{totals.subtotal.toFixed(2)} €</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Remise (€)</span>
              <input
                type="number"
                step="0.01"
                {...register('discount', { valueAsNumber: true, min: 0 })}
                className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">TVA (%)</span>
              <input
                type="number"
                step="0.1"
                {...register('taxRate', { valueAsNumber: true, min: 0 })}
                className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-right"
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-lg font-bold text-gray-900">Total TTC</span>
              <span className="text-xl font-bold text-blue-600">{totals.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/purchase-orders"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {isEditing ? 'Enregistrer les modifications' : 'Créer le bon de commande'}
          </button>
        </div>
      </form>
    </div>
  )
}
