'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import { TextField } from '@/components/DashboardV2/Fields'
import {
  WorkspaceForm,
  WorkspacePanel,
  WorkspaceUploadField,
} from '@/components/DashboardV2/Workspace'

type MediaValue =
  | string
  | {
      id: string
      filename?: string | null
      url?: string | null
    }
  | null

type Agency = {
  id: string
  name: string
  description?: string | null
  logo?: MediaValue
  email?: string | null
  phone?: string | null
  website?: string | null
  address?: {
    street?: string | null
    city?: string | null
    postcode?: string | null
    country?: string | null
  } | null
  crm?: {
    enabled?: boolean | null
    type?: 'generic-xml' | 'manual' | null
    feedUrl?: string | null
  } | null
}

type FormStatus = 'idle' | 'saving' | 'success' | 'error'

type FormState = {
  status: FormStatus
  error: string
}

function useFormState() {
  const [formState, setFormState] = useState<FormState>({
    status: 'idle',
    error: '',
  })

  function clearFeedback() {
    setFormState({
      status: 'idle',
      error: '',
    })
  }

  function saving() {
    setFormState({
      status: 'saving',
      error: '',
    })
  }

  function success() {
    setFormState({
      status: 'success',
      error: '',
    })

    window.setTimeout(() => {
      setFormState({
        status: 'idle',
        error: '',
      })
    }, 2500)
  }

  function error(message: string) {
    setFormState({
      status: 'error',
      error: message,
    })
  }

  return {
    formState,
    clearFeedback,
    saving,
    success,
    error,
  }
}

async function updateAgency(formData: FormData) {
  const response = await fetch('/api/update-agency-settings', {
    method: 'PATCH',
    body: formData,
  })

  const result = (await response.json()) as {
    ok?: boolean
    message?: string
    agency?: Agency
  }

  if (!response.ok || !result.ok) {
    throw new Error(result.message || 'Could not update agency.')
  }

  return result
}

function getLogo(logo: MediaValue) {
  if (!logo) {
    return {
      id: '',
      filename: '',
      url: '',
    }
  }

  if (typeof logo === 'string') {
    return {
      id: logo,
      filename: '',
      url: '',
    }
  }

  return {
    id: logo.id,
    filename: logo.filename || '',
    url: logo.url || '',
  }
}

export function AgencyOverviewForm({ agency }: { agency: Agency }) {
  const router = useRouter()
  const form = useFormState()

  const initialName = agency.name || ''
  const initialDescription = agency.description || ''

  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)

  const [savedName, setSavedName] = useState(initialName)
  const [savedDescription, setSavedDescription] = useState(initialDescription)

  const hasChanges = name !== savedName || description !== savedDescription

  function discard() {
    setName(savedName)
    setDescription(savedDescription)
    form.clearFeedback()
  }

  async function save() {
    const cleanName = name.trim()
    const cleanDescription = description.trim()

    if (!cleanName) {
      form.error('Agency name is required.')
      return
    }

    form.saving()

    const formData = new FormData()
    formData.set('id', agency.id)
    formData.set('name', cleanName)
    formData.set('description', cleanDescription)

    try {
      const result = await updateAgency(formData)

      const nextName = result.agency?.name || cleanName
      const nextDescription = result.agency?.description || ''

      setName(nextName)
      setDescription(nextDescription)
      setSavedName(nextName)
      setSavedDescription(nextDescription)

      form.success()
      router.refresh()
    } catch (error) {
      form.error(error instanceof Error ? error.message : 'Could not update agency.')
    }
  }

  return (
    <WorkspaceForm
      hasChanges={hasChanges}
      saving={form.formState.status === 'saving'}
      saved={form.formState.status === 'success'}
      error={form.formState.status === 'error' ? form.formState.error : null}
      onSave={save}
      onDiscard={discard}
    >
      <WorkspacePanel
        title="Agency overview"
        description="The primary information used throughout the dashboard and public agency profile."
      >
        <div className="grid gap-6">
          <TextField
            label="Agency name"
            name="name"
            value={name}
            required
            onChange={(event) => {
              setName(event.target.value)
              form.clearFeedback()
            }}
          />

          <label className="block">
            <span className="text-sm font-medium text-neutral-900">Description</span>

            <textarea
              className="mt-2 min-h-48 w-full resize-y border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
              name="description"
              value={description}
              placeholder="Describe the agency, its expertise and the areas it serves."
              onChange={(event) => {
                setDescription(event.target.value)
                form.clearFeedback()
              }}
            />
          </label>
        </div>
      </WorkspacePanel>
    </WorkspaceForm>
  )
}

export function AgencyBrandingForm({ agency }: { agency: Agency }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const form = useFormState()

  const initialLogo = getLogo(agency.logo || null)

  const [logoId, setLogoId] = useState(initialLogo.id)
  const [logoFilename, setLogoFilename] = useState(initialLogo.filename)
  const [logoUrl, setLogoUrl] = useState(initialLogo.url)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [savedLogo, setSavedLogo] = useState(initialLogo)

  const hasChanges = logoId !== savedLogo.id || logoFile !== null

  function selectLogo(file: File | null) {
    setLogoFile(file)

    if (file) {
      setLogoId('')
      setLogoFilename(file.name)
    }

    form.clearFeedback()
  }

  function removeLogo() {
    setLogoFile(null)
    setLogoId('')
    setLogoFilename('')
    setLogoUrl('')
    form.clearFeedback()
  }

  function discard() {
    setLogoId(savedLogo.id)
    setLogoFilename(savedLogo.filename)
    setLogoUrl(savedLogo.url)
    setLogoFile(null)
    form.clearFeedback()
  }

  async function save() {
    form.saving()

    const formData = new FormData()
    formData.set('id', agency.id)
    formData.set('logoManaged', 'true')
    formData.set('logoId', logoId)

    if (logoFile) {
      formData.set('logo', logoFile)
    }

    try {
      const result = await updateAgency(formData)
      const nextLogo = getLogo(result.agency?.logo || null)

      setLogoId(nextLogo.id)
      setLogoFilename(nextLogo.filename)
      setLogoUrl(nextLogo.url)
      setLogoFile(null)
      setSavedLogo(nextLogo)

      form.success()
      router.refresh()
    } catch (error) {
      form.error(error instanceof Error ? error.message : 'Could not update agency branding.')
    }
  }

  return (
    <WorkspaceForm
      hasChanges={hasChanges}
      saving={form.formState.status === 'saving'}
      saved={form.formState.status === 'success'}
      error={form.formState.status === 'error' ? form.formState.error : null}
      onSave={save}
      onDiscard={discard}
    >
      <WorkspacePanel
        title="Agency branding"
        description="Upload the logo used on the public profile, property listings and platform communications."
      >
        <div className="max-w-2xl">
          <WorkspaceUploadField
            accept="image/*"
            description="Upload a high-resolution agency logo. A wide transparent PNG or SVG works best."
            file={logoFile}
            filename={logoFilename}
            inputRef={inputRef}
            label="Agency logo"
            previewType="image"
            previewUrl={logoUrl}
            onChoose={() => inputRef.current?.click()}
            onDrop={(files) => selectLogo(files[0] || null)}
            onFileChange={selectLogo}
            onRemove={removeLogo}
          />
        </div>
      </WorkspacePanel>
    </WorkspaceForm>
  )
}

export function AgencyContactForm({ agency }: { agency: Agency }) {
  const router = useRouter()
  const form = useFormState()

  const initialValues = {
    email: agency.email || '',
    phone: agency.phone || '',
    website: agency.website || '',
    street: agency.address?.street || '',
    city: agency.address?.city || '',
    postcode: agency.address?.postcode || '',
    country: agency.address?.country || 'Scotland',
  }

  const [values, setValues] = useState(initialValues)
  const [savedValues, setSavedValues] = useState(initialValues)

  const hasChanges = JSON.stringify(values) !== JSON.stringify(savedValues)

  function updateValue(field: keyof typeof values, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))

    form.clearFeedback()
  }

  function discard() {
    setValues(savedValues)
    form.clearFeedback()
  }

  async function save() {
    form.saving()

    const cleanValues = {
      email: values.email.trim(),
      phone: values.phone.trim(),
      website: values.website.trim(),
      street: values.street.trim(),
      city: values.city.trim(),
      postcode: values.postcode.trim(),
      country: values.country.trim(),
    }

    const formData = new FormData()
    formData.set('id', agency.id)

    Object.entries(cleanValues).forEach(([key, value]) => {
      formData.set(key, value)
    })

    try {
      const result = await updateAgency(formData)

      const nextValues = {
        email: result.agency?.email || '',
        phone: result.agency?.phone || '',
        website: result.agency?.website || '',
        street: result.agency?.address?.street || '',
        city: result.agency?.address?.city || '',
        postcode: result.agency?.address?.postcode || '',
        country: result.agency?.address?.country || '',
      }

      setValues(nextValues)
      setSavedValues(nextValues)

      form.success()
      router.refresh()
    } catch (error) {
      form.error(error instanceof Error ? error.message : 'Could not update contact details.')
    }
  }

  return (
    <WorkspaceForm
      hasChanges={hasChanges}
      saving={form.formState.status === 'saving'}
      saved={form.formState.status === 'success'}
      error={form.formState.status === 'error' ? form.formState.error : null}
      onSave={save}
      onDiscard={discard}
      className="space-y-6"
    >
      <WorkspacePanel
        title="Contact details"
        description="Public contact information used for property enquiries and the agency profile."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => updateValue('email', event.target.value)}
          />

          <TextField
            label="Phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={(event) => updateValue('phone', event.target.value)}
          />

          <div className="sm:col-span-2">
            <TextField
              label="Website"
              name="website"
              type="text"
              value={values.website}
              placeholder="www.rettie.co.uk"
              onChange={(event) => updateValue('website', event.target.value)}
            />
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Office address"
        description="The primary office address displayed on the agency profile."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField
              label="Street"
              name="street"
              value={values.street}
              onChange={(event) => updateValue('street', event.target.value)}
            />
          </div>

          <TextField
            label="Town or city"
            name="city"
            value={values.city}
            onChange={(event) => updateValue('city', event.target.value)}
          />

          <TextField
            label="Postcode"
            name="postcode"
            value={values.postcode}
            onChange={(event) => updateValue('postcode', event.target.value)}
          />

          <TextField
            label="Country"
            name="country"
            value={values.country}
            onChange={(event) => updateValue('country', event.target.value)}
          />
        </div>
      </WorkspacePanel>
    </WorkspaceForm>
  )
}

export function AgencyCRMForm({ agency }: { agency: Agency }) {
  const router = useRouter()
  const form = useFormState()

  const initialValues = {
    enabled: Boolean(agency.crm?.enabled),
    type: agency.crm?.type || 'manual',
    feedUrl: agency.crm?.feedUrl || '',
  }

  const [enabled, setEnabled] = useState(initialValues.enabled)
  const [type, setType] = useState<'generic-xml' | 'manual'>(initialValues.type)
  const [feedUrl, setFeedUrl] = useState(initialValues.feedUrl)

  const [savedValues, setSavedValues] = useState(initialValues)

  const hasChanges =
    enabled !== savedValues.enabled || type !== savedValues.type || feedUrl !== savedValues.feedUrl

  function discard() {
    setEnabled(savedValues.enabled)
    setType(savedValues.type)
    setFeedUrl(savedValues.feedUrl)
    form.clearFeedback()
  }

  async function save() {
    form.saving()

    const cleanFeedUrl = feedUrl.trim()

    const formData = new FormData()
    formData.set('id', agency.id)
    formData.set('crmEnabled', String(enabled))
    formData.set('crmType', type)
    formData.set('crmFeedUrl', cleanFeedUrl)

    try {
      const result = await updateAgency(formData)

      const nextValues = {
        enabled: Boolean(result.agency?.crm?.enabled),
        type: result.agency?.crm?.type || 'manual',
        feedUrl: result.agency?.crm?.feedUrl || '',
      }

      setEnabled(nextValues.enabled)
      setType(nextValues.type)
      setFeedUrl(nextValues.feedUrl)
      setSavedValues(nextValues)

      form.success()
      router.refresh()
    } catch (error) {
      form.error(error instanceof Error ? error.message : 'Could not update CRM settings.')
    }
  }

  return (
    <WorkspaceForm
      hasChanges={hasChanges}
      saving={form.formState.status === 'saving'}
      saved={form.formState.status === 'success'}
      error={form.formState.status === 'error' ? form.formState.error : null}
      onSave={save}
      onDiscard={discard}
    >
      <WorkspacePanel
        title="CRM integration"
        description="Configure the external property feed used to import and update listings."
      >
        <div className="grid gap-8">
          <label className="flex items-start gap-4 border border-neutral-200 bg-neutral-50 p-5">
            <input
              checked={enabled}
              className="mt-1 h-4 w-4"
              type="checkbox"
              onChange={(event) => {
                setEnabled(event.target.checked)
                form.clearFeedback()
              }}
            />

            <span>
              <span className="block text-sm font-semibold text-neutral-950">Enable CRM feed</span>

              <span className="mt-1 block text-sm leading-6 text-neutral-600">
                Automatically import property listings from the configured feed.
              </span>
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-900">Integration type</span>

            <select
              className="mt-2 h-11 w-full border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none focus:border-neutral-950"
              value={type}
              onChange={(event) => {
                setType(event.target.value as 'generic-xml' | 'manual')
                form.clearFeedback()
              }}
            >
              <option value="manual">Manual / No CRM</option>
              <option value="generic-xml">Generic XML Feed</option>
            </select>
          </label>

          <TextField
            label="Feed URL"
            name="crmFeedUrl"
            type="url"
            value={feedUrl}
            placeholder="https://example.com/property-feed.xml"
            onChange={(event) => {
              setFeedUrl(event.target.value)
              form.clearFeedback()
            }}
          />
        </div>
      </WorkspacePanel>
    </WorkspaceForm>
  )
}
