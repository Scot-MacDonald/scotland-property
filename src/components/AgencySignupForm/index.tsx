'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export function AgencySignupForm() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError('')
    setSuccess(false)

    const formData = new FormData(event.currentTarget)

    const res = await fetch('/api/agency-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agencyName: formData.get('agencyName'),
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        website: formData.get('website'),
      }),
    })

    const data = await res.json()

    setLoading(false)

    if (!res.ok || !data.ok) {
      setError(data.message || 'Something went wrong.')
      return
    }

    setSuccess(true)

    setTimeout(() => {
      router.push('/admin/login')
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="border p-8">
      <div className="grid gap-5">
        <Field label="Agency Name" name="agencyName" required />
        <Field label="Your Name" name="name" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <Field label="Phone" name="phone" />
        <Field label="Website" name="website" />

        {error && <p className="text-sm text-red-600">{error}</p>}

        {success && (
          <p className="text-sm text-green-700">Agency trial created. Redirecting to login...</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-black px-5 py-4 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Start Free Trial'}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>

      <input name={name} type={type} required={required} className="mt-2 w-full border px-4 py-3" />
    </label>
  )
}
