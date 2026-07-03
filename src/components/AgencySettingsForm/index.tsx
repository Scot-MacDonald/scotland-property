'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export function AgencySettingsForm({ agency }: { agency: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(event.currentTarget)

    const res = await fetch('/api/update-agency-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        website: formData.get('website'),
        street: formData.get('street'),
        city: formData.get('city'),
        postcode: formData.get('postcode'),
        country: formData.get('country'),
        crmEnabled: formData.get('crmEnabled') === 'on',
        crmType: formData.get('crmType'),
        crmFeedUrl: formData.get('crmFeedUrl'),
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok || !data.ok) {
      setMessage(data.message || 'Could not save settings.')
      return
    }

    setMessage('Settings saved successfully. Redirecting...')

    setTimeout(() => {
      router.push('/dashboard/settings')
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <section className="border bg-white p-8">
        <h2 className="text-2xl font-medium">Agency Details</h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Agency Name" name="name" defaultValue={agency.name} required />
          <Field label="Email" name="email" type="email" defaultValue={agency.email} />
          <Field label="Phone" name="phone" defaultValue={agency.phone} />
          <Field label="Website" name="website" defaultValue={agency.website} />
        </div>
      </section>

      <section className="border bg-white p-8">
        <h2 className="text-2xl font-medium">Office Address</h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Street" name="street" defaultValue={agency.address?.street} />
          <Field label="City" name="city" defaultValue={agency.address?.city} />
          <Field label="Postcode" name="postcode" defaultValue={agency.address?.postcode} />
          <Field label="Country" name="country" defaultValue={agency.address?.country} />
        </div>
      </section>

      <section className="border bg-white p-8">
        <h2 className="text-2xl font-medium">CRM Feed</h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="flex items-center gap-3">
            <input
              name="crmEnabled"
              type="checkbox"
              defaultChecked={Boolean(agency.crm?.enabled)}
            />
            <span className="text-sm font-medium">CRM Enabled</span>
          </label>

          <Field label="CRM Type" name="crmType" defaultValue={agency.crm?.type || 'generic-xml'} />
          <Field label="Feed URL" name="crmFeedUrl" defaultValue={agency.crm?.feedUrl} />
        </div>
      </section>

      {message && <p className="text-sm">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-black px-5 py-4 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  required = false,
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue || ''}
        required={required}
        className="mt-2 w-full border px-4 py-3"
      />
    </label>
  )
}
