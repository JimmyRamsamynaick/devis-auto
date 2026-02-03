'use client'

import { useState, useEffect, use } from 'react'
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

type QuoteItem = {
  description: string
  quantity: number
  unitPrice: number
}

type QuoteFormValues = {
  clientId: string
  validUntil: string
  items: QuoteItem[]
  discount: number
  taxRate: number
}

export default function EditQuotePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<QuoteFormValues>({
    defaultValues: {
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      discount: 0,
      taxRate: 20,
    }
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
        const [clientsRes, servicesRes, quoteRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/services'),
          fetch(`/api/quotes/${params.id}`)
        ])
        
        if (clientsRes.ok) setClients(await clientsRes.json())
        if (servicesRes.ok) setServices(await servicesRes.json())
        
        if (quoteRes.ok) {
          const quote = await quoteRes.json()
          reset({
            clientId: quote.clientId,
            validUntil: new Date(quote.validUntil).toISOString().split('T')[0],
            items: quote.items.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice
            })),
            discount: quote.discount,
            taxRate: quote.taxRate
          })
        } else {
          router.push('/quotes')
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id, reset, router])

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

  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      setValue(`items.${index}.description`, service.name)
      setValue(`items.${index}.unitPrice`, service.price)
    }
  }

  const onSubmit = async (data: QuoteFormValues) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/quotes/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        router.push(`/quotes/${params.id}`)
        router.refresh()
      } else {
        alert('Erreur lors de la modification du devis')
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
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/quotes/${params.id}`} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifier le Devis</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Client & Date Section */}
        <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select
              {...register("clientId", { required: "Veuillez sélectionner un client" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.companyName ? `(${client.companyName})` : ''}
                </option>
              ))}
            </select>
            {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId.message}</p>}
            <div className="mt-2 text-right">
              <Link href="/clients/new" className="text-sm text-blue-600 hover:underline">
                + Créer un nouveau client
              </Link>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valide jusqu&apos;au *</label>
            <input
              type="date"
              {...register("validUntil", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Prestations</h2>
          
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start bg-gray-50 p-4 rounded-md">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md mb-2"
                        onChange={(e) => handleServiceSelect(index, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Choisir une prestation prédéfinie...</option>
                        <option value="custom">-- Personnalisé (Saisie manuelle) --</option>
                        {services.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Description"
                        {...register(`items.${index}.description` as const, { required: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="w-24">
                        <label className="text-xs text-gray-500">Qté</label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="w-32">
                        <label className="text-xs text-gray-500">Prix Unitaire (€)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex-1 text-right pt-6 font-medium">
                        {(watchItems[index]?.quantity * watchItems[index]?.unitPrice || 0).toFixed(2)} €
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700 mt-8"
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
            className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus size={20} />
            Ajouter une ligne
          </button>
        </div>

        {/* Totals Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-end gap-8">
            <div className="w-full md:w-64 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">{totals.subtotal.toFixed(2)} €</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Remise (€)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("discount", { valueAsNumber: true })}
                  className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">TVA (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  {...register("taxRate", { valueAsNumber: true })}
                  className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-between items-center text-gray-600 text-sm">
                <span>Montant TVA</span>
                <span>{totals.taxAmount.toFixed(2)} €</span>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Total TTC</span>
                <span>{totals.total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href={`/quotes/${params.id}`}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  )
}
