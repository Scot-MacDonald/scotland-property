'use client'

import { useRef, useState } from 'react'
import {
  WorkspacePanel,
  WorkspaceStatusFooter,
  WorkspaceUploadField,
} from '@/components/DashboardV2/Workspace'
import type { Media, Property } from '@/payload-types'
import { useWorkspaceForm } from '@/hooks/useWorkspaceForm'

type MarketingMedia = {
  id: string
  filename: string
  url: string
  alt: string
}

type MarketingProperty = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  price?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  featuredImage?: unknown
  gallery?: unknown[] | null
  region?: unknown
  town?: unknown
  propertyType?: unknown
  marketingHeadline?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  publishOnWebsite?: boolean | null
  publishToJamesEdition?: boolean | null
  publishToRightmove?: boolean | null
  publishToZoopla?: boolean | null
  socialImage?: string | Media | null
  brochure?: string | Media | null
}

type MarketingTabProps = {
  property: MarketingProperty
}

function normaliseMedia(
  value: string | Media | null | undefined,
  fallback: string,
): MarketingMedia | null {
  if (!value || typeof value === 'string' || !value.url) {
    return null
  }

  return {
    id: value.id,
    filename: value.filename || value.alt || fallback,
    url: value.url,
    alt: value.alt || fallback,
  }
}

function ToggleRow({
  checked,
  description,
  disabled = false,
  label,
  onChange,
}: {
  checked: boolean
  description: string
  disabled?: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      className={[
        'flex items-start justify-between gap-6 border-b border-neutral-200 py-5 last:border-b-0',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      <span>
        <span className="block text-sm font-semibold text-neutral-950">{label}</span>

        <span className="mt-1 block text-sm leading-6 text-neutral-600">{description}</span>
      </span>

      <span className="relative mt-0.5 shrink-0">
        <input
          checked={checked}
          className="peer sr-only"
          disabled={disabled}
          type="checkbox"
          onChange={(event) => onChange(event.target.checked)}
        />

        <span className="block h-6 w-11 border border-neutral-300 bg-neutral-200 transition peer-checked:border-neutral-950 peer-checked:bg-neutral-950" />

        <span className="absolute left-1 top-1 h-4 w-4 bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

function CharacterCount({ current, recommended }: { current: number; recommended: number }) {
  const isOver = current > recommended

  return (
    <span
      className={['text-xs', isOver ? 'font-medium text-red-700' : 'text-neutral-500'].join(' ')}
    >
      {current}/{recommended}
    </span>
  )
}

function ChecklistItem({ complete, label }: { complete: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3 py-2 text-sm">
      <span
        className={[
          'inline-flex h-5 w-5 items-center justify-center border text-xs',
          complete
            ? 'border-emerald-700 bg-emerald-700 text-white'
            : 'border-neutral-300 bg-white text-neutral-400',
        ].join(' ')}
      >
        {complete ? '✓' : '–'}
      </span>

      <span className={complete ? 'text-neutral-800' : 'text-neutral-500'}>{label}</span>
    </li>
  )
}

export function MarketingTab({ property }: MarketingTabProps) {
  const initialSocialImage = normaliseMedia(property.socialImage, `${property.title} social image`)
  const initialBrochure = normaliseMedia(property.brochure, `${property.title} brochure`)

  const socialImageInputRef = useRef<HTMLInputElement>(null)
  const brochureInputRef = useRef<HTMLInputElement>(null)

  const [savedMarketingHeadline, setSavedMarketingHeadline] = useState(
    property.marketingHeadline || '',
  )
  const [savedSeoTitle, setSavedSeoTitle] = useState(property.seoTitle || '')
  const [savedSeoDescription, setSavedSeoDescription] = useState(property.seoDescription || '')
  const [savedPublishOnWebsite, setSavedPublishOnWebsite] = useState(
    property.publishOnWebsite ?? true,
  )
  const [savedPublishToJamesEdition, setSavedPublishToJamesEdition] = useState(
    property.publishToJamesEdition ?? false,
  )
  const [savedPublishToRightmove, setSavedPublishToRightmove] = useState(
    property.publishToRightmove ?? false,
  )
  const [savedPublishToZoopla, setSavedPublishToZoopla] = useState(
    property.publishToZoopla ?? false,
  )

  const [marketingHeadline, setMarketingHeadline] = useState(savedMarketingHeadline)
  const [seoTitle, setSeoTitle] = useState(savedSeoTitle)
  const [seoDescription, setSeoDescription] = useState(savedSeoDescription)
  const [publishOnWebsite, setPublishOnWebsite] = useState(savedPublishOnWebsite)
  const [publishToJamesEdition, setPublishToJamesEdition] = useState(savedPublishToJamesEdition)
  const [publishToRightmove, setPublishToRightmove] = useState(savedPublishToRightmove)
  const [publishToZoopla, setPublishToZoopla] = useState(savedPublishToZoopla)

  const [savedSocialImage, setSavedSocialImage] = useState<MarketingMedia | null>(
    initialSocialImage,
  )
  const [socialImage, setSocialImage] = useState<MarketingMedia | null>(initialSocialImage)
  const [newSocialImage, setNewSocialImage] = useState<File | null>(null)

  const [savedBrochure, setSavedBrochure] = useState<MarketingMedia | null>(initialBrochure)
  const [brochure, setBrochure] = useState<MarketingMedia | null>(initialBrochure)
  const [newBrochure, setNewBrochure] = useState<File | null>(null)

  const { isSaving, message, error, beginSave, finishSave, failSave, clearMessages } =
    useWorkspaceForm()

  const isDirty =
    marketingHeadline !== savedMarketingHeadline ||
    seoTitle !== savedSeoTitle ||
    seoDescription !== savedSeoDescription ||
    publishOnWebsite !== savedPublishOnWebsite ||
    publishToJamesEdition !== savedPublishToJamesEdition ||
    publishToRightmove !== savedPublishToRightmove ||
    publishToZoopla !== savedPublishToZoopla ||
    socialImage?.id !== savedSocialImage?.id ||
    Boolean(newSocialImage) ||
    brochure?.id !== savedBrochure?.id ||
    Boolean(newBrochure)

  const readinessItems = [
    {
      label: 'Property title added',
      complete: Boolean(property.title.trim()),
    },
    {
      label: 'Property URL created',
      complete: Boolean(property.slug.trim()),
    },
    {
      label: 'Short listing summary added',
      complete: Boolean(property.excerpt?.trim()),
    },
    {
      label: 'Price added',
      complete: typeof property.price === 'number' && property.price > 0,
    },
    {
      label: 'Featured image added',
      complete: Boolean(property.featuredImage),
    },
    {
      label: 'Gallery images added',
      complete: Array.isArray(property.gallery) && property.gallery.length > 0,
    },
    {
      label: 'SEO title added',
      complete: Boolean(seoTitle.trim()),
    },
    {
      label: 'SEO description added',
      complete: Boolean(seoDescription.trim()),
    },
    {
      label: 'Social sharing image added',
      complete: Boolean(socialImage || newSocialImage || property.featuredImage),
    },
    {
      label: 'Brochure added',
      complete: Boolean(brochure || newBrochure),
    },
  ]

  const completedItems = readinessItems.filter((item) => item.complete).length
  const readinessPercentage = Math.round((completedItems / readinessItems.length) * 100)

  function beginEdit() {
    clearMessages()
  }

  function discardChanges() {
    setMarketingHeadline(savedMarketingHeadline)
    setSeoTitle(savedSeoTitle)
    setSeoDescription(savedSeoDescription)
    setPublishOnWebsite(savedPublishOnWebsite)
    setPublishToJamesEdition(savedPublishToJamesEdition)
    setPublishToRightmove(savedPublishToRightmove)
    setPublishToZoopla(savedPublishToZoopla)
    setSocialImage(savedSocialImage)
    setNewSocialImage(null)
    setBrochure(savedBrochure)
    setNewBrochure(null)
    clearMessages()
  }

  async function saveMarketing() {
    beginSave()

    try {
      const formData = new FormData()

      formData.set('id', property.id)
      formData.set('marketingHeadline', marketingHeadline)
      formData.set('seoTitle', seoTitle)
      formData.set('seoDescription', seoDescription)
      formData.set('publishOnWebsite', String(publishOnWebsite))
      formData.set('publishToJamesEdition', String(publishToJamesEdition))
      formData.set('publishToRightmove', String(publishToRightmove))
      formData.set('publishToZoopla', String(publishToZoopla))

      formData.set('socialImageManaged', 'true')
      if (socialImage) formData.set('socialImageId', socialImage.id)
      if (newSocialImage) formData.set('socialImage', newSocialImage)

      formData.set('brochureManaged', 'true')
      if (brochure) formData.set('brochureId', brochure.id)
      if (newBrochure) formData.set('brochure', newBrochure)

      const response = await fetch('/api/update-property', {
        method: 'POST',
        body: formData,
      })

      const result = (await response.json()) as {
        error?: string
        property?: Property
      }

      if (!response.ok) {
        throw new Error(result.error || 'Could not update property marketing.')
      }

      setSavedMarketingHeadline(marketingHeadline)
      setSavedSeoTitle(seoTitle)
      setSavedSeoDescription(seoDescription)
      setSavedPublishOnWebsite(publishOnWebsite)
      setSavedPublishToJamesEdition(publishToJamesEdition)
      setSavedPublishToRightmove(publishToRightmove)
      setSavedPublishToZoopla(publishToZoopla)

      if (result.property) {
        const nextSocialImage = normaliseMedia(
          result.property.socialImage,
          `${result.property.title} social image`,
        )
        const nextBrochure = normaliseMedia(
          result.property.brochure,
          `${result.property.title} brochure`,
        )

        setSocialImage(nextSocialImage)
        setSavedSocialImage(nextSocialImage)
        setBrochure(nextBrochure)
        setSavedBrochure(nextBrochure)
      }

      setNewSocialImage(null)
      setNewBrochure(null)
      finishSave('Marketing settings saved successfully.')
    } catch (saveError) {
      failSave(saveError, 'Could not update property marketing.')
    }
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Marketing copy"
        description="Control how the property is presented in campaigns and promotional material."
      >
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-neutral-950">
            Marketing headline
          </span>

          <input
            className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
            maxLength={120}
            placeholder="An exceptional Highland estate with panoramic views"
            type="text"
            value={marketingHeadline}
            onChange={(event) => {
              beginEdit()
              setMarketingHeadline(event.target.value)
            }}
          />

          <span className="mt-2 block text-sm text-neutral-500">
            Optional promotional copy used outside the main listing title.
          </span>
        </label>
      </WorkspacePanel>

      <WorkspacePanel
        title="Search appearance"
        description="Control how the listing appears in search engines and shared links."
      >
        <div className="space-y-6">
          <label className="block">
            <span className="mb-2 flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-neutral-950">SEO title</span>

              <CharacterCount current={seoTitle.length} recommended={60} />
            </span>

            <input
              className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
              maxLength={60}
              placeholder={property.title}
              type="text"
              value={seoTitle}
              onChange={(event) => {
                beginEdit()
                setSeoTitle(event.target.value)
              }}
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-neutral-950">SEO description</span>

              <CharacterCount current={seoDescription.length} recommended={160} />
            </span>

            <textarea
              className="min-h-32 w-full resize-y border border-neutral-300 bg-white px-4 py-3 text-sm leading-6 text-neutral-950 outline-none transition focus:border-neutral-950"
              maxLength={160}
              placeholder="Describe the property in a concise and compelling way."
              value={seoDescription}
              onChange={(event) => {
                beginEdit()
                setSeoDescription(event.target.value)
              }}
            />
          </label>

          <div className="border border-neutral-200 bg-neutral-50 p-5">
            <p className="truncate text-lg text-blue-800">{seoTitle || property.title}</p>

            <p className="mt-1 text-sm text-emerald-700">
              scotlandluxuryestates.com/property/{property.slug}
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              {seoDescription ||
                property.excerpt ||
                'Add an SEO description to preview the property search result.'}
            </p>
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Marketing assets"
        description="Control the image used for social sharing and the downloadable property brochure."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3">
              <p className="text-sm font-semibold text-neutral-950">Social sharing image</p>
              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Recommended size: 1200 × 630 pixels. The featured image can be used as a fallback.
              </p>
            </div>

            <WorkspaceUploadField
              accept="image/*"
              description="Upload a landscape image for social media and shared-link previews."
              file={newSocialImage}
              filename={socialImage?.filename || null}
              inputRef={socialImageInputRef}
              label="Social sharing image"
              previewUrl={socialImage?.url || null}
              onChoose={() => socialImageInputRef.current?.click()}
              onDrop={(files) => {
                beginEdit()
                setNewSocialImage(files[0] || null)
              }}
              onFileChange={(file) => {
                beginEdit()
                setNewSocialImage(file)
              }}
              onRemove={() => {
                beginEdit()
                setSocialImage(null)
                setNewSocialImage(null)
              }}
            />
          </div>

          <div>
            <div className="mb-3">
              <p className="text-sm font-semibold text-neutral-950">Property brochure</p>
              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Upload the final brochure as a PDF for buyers to download.
              </p>
            </div>

            <WorkspaceUploadField
              accept="application/pdf,.pdf"
              description="Upload a PDF brochure containing the property particulars."
              file={newBrochure}
              filename={brochure?.filename || null}
              inputRef={brochureInputRef}
              label="Property brochure"
              previewUrl={null}
              onChoose={() => brochureInputRef.current?.click()}
              onDrop={(files) => {
                beginEdit()
                setNewBrochure(files[0] || null)
              }}
              onFileChange={(file) => {
                beginEdit()
                setNewBrochure(file)
              }}
              onRemove={() => {
                beginEdit()
                setBrochure(null)
                setNewBrochure(null)
              }}
            />
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Publishing"
        description="Choose where the listing is eligible to be published."
      >
        <div>
          <ToggleRow
            checked={publishOnWebsite}
            description="Show this listing on Scotland Luxury Estates."
            label="Scotland Luxury Estates"
            onChange={(checked) => {
              beginEdit()
              setPublishOnWebsite(checked)
            }}
          />

          <ToggleRow
            checked={publishToJamesEdition}
            description="Mark this listing for JamesEdition export when the integration is enabled."
            label="JamesEdition"
            onChange={(checked) => {
              beginEdit()
              setPublishToJamesEdition(checked)
            }}
          />

          <ToggleRow
            checked={publishToRightmove}
            description="Mark this listing for Rightmove export when the integration is enabled."
            label="Rightmove"
            onChange={(checked) => {
              beginEdit()
              setPublishToRightmove(checked)
            }}
          />

          <ToggleRow
            checked={publishToZoopla}
            description="Mark this listing for Zoopla export when the integration is enabled."
            label="Zoopla"
            onChange={(checked) => {
              beginEdit()
              setPublishToZoopla(checked)
            }}
          />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Listing readiness"
        description="Review the key information needed for a strong public listing."
      >
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <div>
            <p className="text-4xl font-semibold tracking-tight text-neutral-950">
              {readinessPercentage}%
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              {completedItems} of {readinessItems.length} checks complete
            </p>

            <div className="mt-4 h-2 overflow-hidden bg-neutral-200">
              <div
                className="h-full bg-neutral-950 transition-all"
                style={{
                  width: `${readinessPercentage}%`,
                }}
              />
            </div>
          </div>

          <ul className="divide-y divide-neutral-200">
            {readinessItems.map((item) => (
              <ChecklistItem key={item.label} complete={item.complete} label={item.label} />
            ))}
          </ul>
        </div>
      </WorkspacePanel>

      <WorkspaceStatusFooter
        error={error}
        isDirty={isDirty}
        isSaving={isSaving}
        message={message}
        onDiscard={discardChanges}
        onSave={saveMarketing}
        saveLabel="Save marketing"
      />
    </div>
  )
}
