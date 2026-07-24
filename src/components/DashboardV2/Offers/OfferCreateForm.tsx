'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

type SelectOption = {
  id: string
  label: string
  secondaryLabel?: string
}

type OfferCreateFormProps = {
  properties: SelectOption[]
  buyers: SelectOption[]
  agents: SelectOption[]
  initialPropertyId?: string
}

type FormState = {
  property: string
  buyer: string
  agent: string
  amount: string
  status: string
  confidence: string
  submittedAt: string
  expiresAt: string
  conditions: string
  internalNotes: string
}

function getInitialState(initialPropertyId?: string): FormState {
  return {
    property: initialPropertyId || '',
    buyer: '',
    agent: '',
    amount: '',
    status: 'draft',
    confidence: 'medium',
    submittedAt: '',
    expiresAt: '',
    conditions: '',
    internalNotes: '',
  }
}

export function OfferCreateForm({
  properties,
  buyers,
  agents,
  initialPropertyId,
}: OfferCreateFormProps) {
  const router = useRouter()

  const [form, setForm] = useState<FormState>(() => getInitialState(initialPropertyId))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.property) {
      setError('Please select a property.')
      return
    }

    if (!form.buyer) {
      setError('Please select a buyer.')
      return
    }

    const amount = Number(form.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Please enter a valid offer amount.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/create-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property: form.property,
          buyer: form.buyer,
          agent: form.agent || null,
          amount,
          status: form.status,
          confidence: form.confidence,
          submittedAt: form.submittedAt || null,
          expiresAt: form.expiresAt || null,
          conditions: form.conditions.trim() || null,
          internalNotes: form.internalNotes.trim() || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'The offer could not be created.')
      }

      router.push(`/dashboard/offers/${result.id}`)
      router.refresh()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'The offer could not be created.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldClasses =
    'mt-2 w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black'

  const labelClasses = 'block text-xs font-medium uppercase tracking-[0.16em] text-black/60'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? (
        <div className="border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <section className="border border-black/10 bg-white">
        <div className="border-b border-black/10 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Offer</p>
          <h2 className="mt-2 text-xl font-medium">Property and buyer</h2>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <label className={labelClasses}>
            Property
            <select
              value={form.property}
              onChange={(event) => updateField('property', event.target.value)}
              className={fieldClasses}
              required
            >
              <option value="">Select property</option>

              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.label}
                  {property.secondaryLabel ? ` — ${property.secondaryLabel}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClasses}>
            Buyer
            <select
              value={form.buyer}
              onChange={(event) => updateField('buyer', event.target.value)}
              className={fieldClasses}
              required
            >
              <option value="">Select buyer</option>

              {buyers.map((buyer) => (
                <option key={buyer.id} value={buyer.id}>
                  {buyer.label}
                  {buyer.secondaryLabel ? ` — ${buyer.secondaryLabel}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClasses}>
            Assigned agent
            <select
              value={form.agent}
              onChange={(event) => updateField('agent', event.target.value)}
              className={fieldClasses}
            >
              <option value="">No assigned agent</option>

              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.label}
                  {agent.secondaryLabel ? ` — ${agent.secondaryLabel}` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="border border-black/10 bg-white">
        <div className="border-b border-black/10 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Financial</p>
          <h2 className="mt-2 text-xl font-medium">Offer details</h2>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <label className={labelClasses}>
            Offer amount
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sm text-black/50">
                £
              </span>

              <input
                type="number"
                min="1"
                step="1"
                value={form.amount}
                onChange={(event) => updateField('amount', event.target.value)}
                className="w-full border border-black/15 bg-white py-3 pl-8 pr-4 text-sm outline-none transition focus:border-black"
                placeholder="950000"
                required
              />
            </div>
          </label>

          <label className={labelClasses}>
            Status
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
              className={fieldClasses}
            >
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="negotiating">Negotiating</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </label>

          <label className={labelClasses}>
            Confidence
            <select
              value={form.confidence}
              onChange={(event) => updateField('confidence', event.target.value)}
              className={fieldClasses}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className={labelClasses}>
            Submitted date
            <input
              type="datetime-local"
              value={form.submittedAt}
              onChange={(event) => updateField('submittedAt', event.target.value)}
              className={fieldClasses}
            />
          </label>

          <label className={labelClasses}>
            Expiry date
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) => updateField('expiresAt', event.target.value)}
              className={fieldClasses}
            />
          </label>
        </div>
      </section>

      <section className="border border-black/10 bg-white">
        <div className="border-b border-black/10 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Terms</p>
          <h2 className="mt-2 text-xl font-medium">Conditions</h2>
        </div>

        <div className="p-6">
          <label className={labelClasses}>
            Offer conditions
            <textarea
              value={form.conditions}
              onChange={(event) => updateField('conditions', event.target.value)}
              className={`${fieldClasses} min-h-40 resize-y`}
              placeholder="Subject to survey, mortgage approval, preferred entry date…"
            />
          </label>
        </div>
      </section>

      <section className="border border-black/10 bg-white">
        <div className="border-b border-black/10 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Private</p>
          <h2 className="mt-2 text-xl font-medium">Internal notes</h2>
        </div>

        <div className="p-6">
          <label className={labelClasses}>
            Notes for the agency
            <textarea
              value={form.internalNotes}
              onChange={(event) => updateField('internalNotes', event.target.value)}
              className={`${fieldClasses} min-h-36 resize-y`}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/offers"
          className="border border-black/15 px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.14em] transition hover:bg-black/5"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Creating…' : 'Create offer'}
        </button>
      </div>
    </form>
  )
}
