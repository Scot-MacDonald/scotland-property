'use client'

import { useEffect, useState } from 'react'

type Props = {
  propertyId: string
}

export function PropertyEnquiryForm({ propertyId }: Props) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        setStatus('idle')
      }
    }

    if (open) {
      window.addEventListener('keydown', handleEscape)
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')

    const form = event.currentTarget
    const formData = new FormData(form)

    const enquiry = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      message: String(formData.get('message') || ''),
      property: propertyId,
      status: 'new',
    }

    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
    })

    if (!res.ok) {
      setStatus('error')
      return
    }

    form.reset()
    setStatus('success')

    setTimeout(() => {
      setOpen(false)
      setStatus('idle')
    }, 2500)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStatus('idle')
          setOpen(true)
        }}
        className="w-full border border-gray-300 px-4 py-3  tracking-wide transition hover:bg-black hover:text-white"
      >
        Make Enquiry
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => {
            setOpen(false)
            setStatus('idle')
          }}
        >
          <div
            className="relative w-full max-w-lg rounded-xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setStatus('idle')
              }}
              className="absolute right-4 top-4 text-2xl"
            >
              ×
            </button>

            {status !== 'success' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-semibold">Make an enquiry</h3>

                <input
                  name="name"
                  required
                  placeholder="Your name"
                  className="w-full rounded-md border px-4 py-3"
                />

                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Your email"
                  className="w-full rounded-md border px-4 py-3"
                />

                <input
                  name="phone"
                  placeholder="Your phone"
                  className="w-full rounded-md border px-4 py-3"
                />

                <textarea
                  name="message"
                  required
                  placeholder="Your message"
                  rows={5}
                  className="w-full rounded-md border px-4 py-3"
                />

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full rounded-md bg-black px-5 py-3 text-white disabled:opacity-60"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Enquiry'}
                </button>

                {status === 'error' && (
                  <p className="text-sm text-red-700">Something went wrong. Please try again.</p>
                )}
              </form>
            ) : (
              <div className="rounded-md border border-green-200 bg-green-50 p-6 text-center">
                <h4 className="text-lg font-semibold text-green-800">✓ Enquiry Sent</h4>

                <p className="mt-2 text-sm text-green-700">
                  Thank you for your interest. The agent will contact you shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
