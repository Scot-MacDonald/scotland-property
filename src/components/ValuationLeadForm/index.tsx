'use client'

import { useState } from 'react'

export function ValuationLeadForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/valuation-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          postcode: formData.get('postcode'),
          propertyType: formData.get('propertyType'),
          estimatedValue: formData.get('estimatedValue')
            ? Number(formData.get('estimatedValue'))
            : undefined,
          message: formData.get('message'),
        }),
      })

      if (!res.ok) {
        throw new Error('Your valuation request could not be sent.')
      }

      setSuccess(true)
      event.currentTarget.reset()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="border bg-white p-8">
        <h2 className="text-2xl font-medium">Thank you</h2>
        <p className="mt-3 text-muted-foreground">
          Your valuation request has been received. We’ll be in touch soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border bg-white p-8">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Valuation</p>
        <h2 className="mt-2 text-3xl font-medium">Request a free valuation</h2>
      </div>

      {error ? (
        <p className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : null}

      <input name="name" placeholder="Your name" required className="w-full border px-4 py-3" />

      <input
        name="email"
        type="email"
        placeholder="Your email"
        required
        className="w-full border px-4 py-3"
      />

      <input name="phone" placeholder="Phone number" className="w-full border px-4 py-3" />

      <input
        name="postcode"
        placeholder="Property postcode"
        required
        className="w-full border px-4 py-3"
      />

      <select name="propertyType" className="w-full border px-4 py-3" defaultValue="">
        <option value="" disabled>
          Property type
        </option>
        <option value="house">House</option>
        <option value="flat">Flat / Apartment</option>
        <option value="estate">Estate</option>
        <option value="land">Land</option>
        <option value="commercial">Commercial</option>
        <option value="other">Other</option>
      </select>

      <input
        name="estimatedValue"
        type="number"
        placeholder="Estimated value, optional"
        className="w-full border px-4 py-3"
      />

      <textarea
        name="message"
        placeholder="Tell us briefly about the property"
        rows={5}
        className="w-full border px-4 py-3"
      />

      <button type="submit" disabled={loading} className="w-full bg-black px-6 py-4 text-white">
        {loading ? 'Sending...' : 'Request Valuation'}
      </button>
    </form>
  )
}
