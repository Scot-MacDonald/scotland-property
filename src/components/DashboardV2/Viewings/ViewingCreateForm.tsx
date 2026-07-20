'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, type FormEvent } from 'react'

type SelectOption = {
  id: string
  label: string
  secondaryLabel?: string
}

type EnquiryOption = SelectOption & {
  propertyId?: string
  propertyLabel?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
}

type ViewingCreateFormProps = {
  properties: SelectOption[]
  agents: SelectOption[]
  buyers: SelectOption[]
  enquiries: EnquiryOption[]
}

type FormState = {
  dateTime: string
  durationMinutes: string
  status: string
  property: string
  agent: string
  enquiry: string
  buyer: string
  contactName: string
  contactEmail: string
  contactPhone: string
  internalNotes: string
}

const initialState: FormState = {
  dateTime: '',
  durationMinutes: '60',
  status: 'requested',
  property: '',
  agent: '',
  enquiry: '',
  buyer: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  internalNotes: '',
}

export function ViewingCreateForm({
  properties,
  agents,
  buyers,
  enquiries,
}: ViewingCreateFormProps) {
  const router = useRouter()

  const [form, setForm] = useState<FormState>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedEnquiry = useMemo(
    () => enquiries.find((enquiry) => enquiry.id === form.enquiry),
    [enquiries, form.enquiry],
  )

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setError(null)
  }

  function handleEnquiryChange(enquiryId: string) {
    const enquiry = enquiries.find((item) => item.id === enquiryId)

    setForm((current) => ({
      ...current,
      enquiry: enquiryId,
      property: enquiry?.propertyId || current.property,
      contactName: enquiry?.contactName || current.contactName,
      contactEmail: enquiry?.contactEmail || current.contactEmail,
      contactPhone: enquiry?.contactPhone || current.contactPhone,
    }))

    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.dateTime) {
      setError('Please select a viewing date and time.')
      return
    }

    if (!form.property) {
      setError('Please select a property.')
      return
    }

    if (!form.agent) {
      setError('Please select an agent.')
      return
    }

    if (!form.contactName.trim()) {
      setError('Please enter the contact name.')
      return
    }

    if (!form.contactEmail.trim()) {
      setError('Please enter the contact email.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/create-viewing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          durationMinutes: Number(form.durationMinutes),
          enquiry: form.enquiry || null,
          buyer: form.buyer || null,
          contactPhone: form.contactPhone.trim() || null,
          internalNotes: form.internalNotes.trim() || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'The viewing could not be created.')
      }

      router.push(`/dashboard/viewings/${result.id}`)
      router.refresh()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'The viewing could not be created.',
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
      {error && (
        <div className="border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="border border-black/10 bg-white">
        <div className="border-b border-black/10 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Schedule</p>
          <h2 className="mt-2 text-xl font-medium">Viewing details</h2>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <label className={labelClasses}>
            Date and time
            <input
              type="datetime-local"
              value={form.dateTime}
              onChange={(event) => updateField('dateTime', event.target.value)}
              className={fieldClasses}
              required
            />
          </label>

          <label className={labelClasses}>
            Duration
            <select
              value={form.durationMinutes}
              onChange={(event) => updateField('durationMinutes', event.target.value)}
              className={fieldClasses}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </label>

          <label className={labelClasses}>
            Status
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
              className={fieldClasses}
            >
              <option value="requested">Requested</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No show</option>
            </select>
          </label>
        </div>
      </section>

      <section className="border border-black/10 bg-white">
        <div className="border-b border-black/10 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Assignment</p>
          <h2 className="mt-2 text-xl font-medium">Property and agent</h2>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <label className={labelClasses}>
            Existing enquiry
            <select
              value={form.enquiry}
              onChange={(event) => handleEnquiryChange(event.target.value)}
              className={fieldClasses}
            >
              <option value="">No linked enquiry</option>

              {enquiries.map((enquiry) => (
                <option key={enquiry.id} value={enquiry.id}>
                  {enquiry.label}
                  {enquiry.propertyLabel ? ` — ${enquiry.propertyLabel}` : ''}
                </option>
              ))}
            </select>
          </label>

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
            Assigned agent
            <select
              value={form.agent}
              onChange={(event) => updateField('agent', event.target.value)}
              className={fieldClasses}
              required
            >
              <option value="">Select agent</option>

              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClasses}>
            Registered buyer
            <select
              value={form.buyer}
              onChange={(event) => updateField('buyer', event.target.value)}
              className={fieldClasses}
            >
              <option value="">No registered buyer</option>

              {buyers.map((buyer) => (
                <option key={buyer.id} value={buyer.id}>
                  {buyer.label}
                  {buyer.secondaryLabel ? ` — ${buyer.secondaryLabel}` : ''}
                </option>
              ))}
            </select>
          </label>

          {selectedEnquiry && (
            <div className="border border-black/10 bg-black/[0.025] px-4 py-3 text-sm md:col-span-2">
              Contact information has been populated from the selected enquiry. You can edit it
              below before booking.
            </div>
          )}
        </div>
      </section>

      <section className="border border-black/10 bg-white">
        <div className="border-b border-black/10 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Visitor</p>
          <h2 className="mt-2 text-xl font-medium">Contact details</h2>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <label className={labelClasses}>
            Contact name
            <input
              type="text"
              value={form.contactName}
              onChange={(event) => updateField('contactName', event.target.value)}
              className={fieldClasses}
              required
            />
          </label>

          <label className={labelClasses}>
            Email address
            <input
              type="email"
              value={form.contactEmail}
              onChange={(event) => updateField('contactEmail', event.target.value)}
              className={fieldClasses}
              required
            />
          </label>

          <label className={labelClasses}>
            Phone number
            <input
              type="tel"
              value={form.contactPhone}
              onChange={(event) => updateField('contactPhone', event.target.value)}
              className={fieldClasses}
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
          href="/dashboard/viewings"
          className="border border-black/15 px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.14em] transition hover:bg-black/5"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Booking…' : 'Book viewing'}
        </button>
      </div>
    </form>
  )
}
