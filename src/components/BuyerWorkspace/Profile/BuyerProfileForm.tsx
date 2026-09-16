'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type BuyerProfileFormProps = {
  buyer: {
    name?: string | null
    email: string
    alertsEnabled?: boolean | null
  }
}

type FormValues = {
  name: string
  email: string
  alertsEnabled: boolean
}

function valuesMatch(first: FormValues, second: FormValues) {
  return (
    first.name === second.name &&
    first.email === second.email &&
    first.alertsEnabled === second.alertsEnabled
  )
}

export function BuyerProfileForm({ buyer }: BuyerProfileFormProps) {
  const router = useRouter()

  const initialValues: FormValues = {
    name: buyer.name || '',
    email: buyer.email,
    alertsEnabled: buyer.alertsEnabled ?? true,
  }

  const [values, setValues] = useState<FormValues>(initialValues)
  const [savedValues, setSavedValues] = useState<FormValues>(initialValues)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isDirty = !valuesMatch(values, savedValues)

  function updateField<Key extends keyof FormValues>(field: Key, value: FormValues[Key]) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))

    setMessage('')
    setError('')
  }

  function discardChanges() {
    setValues(savedValues)
    setMessage('')
    setError('')
  }

  async function saveProfile() {
    if (!isDirty || isSaving) return

    setIsSaving(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/update-buyer-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
        buyer?: {
          name?: string | null
          email?: string
          alertsEnabled?: boolean | null
        }
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Could not update your profile.')
      }

      const nextValues: FormValues = {
        name: result.buyer?.name || values.name,
        email: result.buyer?.email || values.email,
        alertsEnabled: result.buyer?.alertsEnabled ?? values.alertsEnabled,
      }

      setValues(nextValues)
      setSavedValues(nextValues)
      setMessage('Your profile has been updated.')
      router.refresh()
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error ? caughtError.message : 'Could not update your profile.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="border border-black/10 bg-white">
        <div className="border-b border-black/10 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.22em] text-black/40">Personal information</p>

          <h2 className="mt-2 text-2xl font-medium">Account details</h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
            Keep your contact information accurate so agencies can reach you about properties,
            viewings and offers.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Name</span>

            <input
              type="text"
              value={values.name}
              onChange={(event) => {
                updateField('name', event.target.value)
              }}
              className="min-h-12 w-full border border-black/15 bg-white px-4 text-sm outline-none transition focus:border-black"
              placeholder="Your full name"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">Email address</span>

            <input
              type="email"
              required
              value={values.email}
              onChange={(event) => {
                updateField('email', event.target.value)
              }}
              className="min-h-12 w-full border border-black/15 bg-white px-4 text-sm outline-none transition focus:border-black"
              placeholder="you@example.com"
            />
          </label>
        </div>
      </section>

      <section className="border border-black/10 bg-white">
        <div className="border-b border-black/10 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.22em] text-black/40">Notifications</p>

          <h2 className="mt-2 text-2xl font-medium">Property alerts</h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
            Choose whether to receive notifications when new properties match your saved searches.
          </p>
        </div>

        <div className="p-6">
          <label className="flex cursor-pointer items-start justify-between gap-6 border border-black/10 p-5">
            <div>
              <span className="block text-sm font-medium">Saved-search alerts</span>

              <span className="mt-1 block max-w-2xl text-sm leading-6 text-black/50">
                Email me when matching homes are added to Scotland Luxury Estates.
              </span>
            </div>

            <input
              type="checkbox"
              checked={values.alertsEnabled}
              onChange={(event) => {
                updateField('alertsEnabled', event.target.checked)
              }}
              className="mt-1 h-5 w-5 accent-black"
            />
          </label>
        </div>
      </section>

      <section className="border border-black/10 bg-white">
        <div className="border-b border-black/10 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.22em] text-black/40">Security</p>

          <h2 className="mt-2 text-2xl font-medium">Password</h2>
        </div>

        <div className="p-6">
          <p className="max-w-2xl text-sm leading-6 text-black/55">
            Secure password management will be added through a dedicated verification and reset
            flow. Your password cannot be viewed from this workspace.
          </p>
        </div>
      </section>

      <div className="sticky bottom-4 flex flex-col gap-4 border border-black/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          {error ? (
            <p className="text-sm text-red-700">{error}</p>
          ) : message ? (
            <p className="text-sm text-emerald-700">{message}</p>
          ) : (
            <p className="text-sm text-black/45">
              {isDirty ? 'You have unsaved changes.' : 'All changes are saved.'}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={discardChanges}
            disabled={!isDirty || isSaving}
            className="min-h-11 border border-black/15 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Discard
          </button>

          <button
            type="button"
            onClick={saveProfile}
            disabled={!isDirty || isSaving}
            className="min-h-11 bg-black px-5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
