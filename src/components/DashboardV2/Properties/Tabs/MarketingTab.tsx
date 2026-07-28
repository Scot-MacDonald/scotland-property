'use client'

import { useRef, useState } from 'react'

import {
  WorkspacePanel,
  WorkspaceStatusFooter,
  WorkspaceUploadField,
} from '@/components/DashboardV2/Workspace'
import { useWorkspaceForm } from '@/hooks/useWorkspaceForm'
import type { Media, Property } from '@/payload-types'

import { ListingUrlPanel } from '../Marketing/ListingUrlPanel'
import { MarketingHealthPanel } from '../Marketing/MarketingHealthPanel'
import { PublishingDestination } from '../Marketing/PublishingDestination'
import { SocialPreviewPanel } from '../Marketing/SocialPreviewPanel'
import { LaunchStatusPanel, type LaunchReadinessItem } from './LaunchStatusPanel'

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

export function MarketingTab({ property }: MarketingTabProps) {
  const initialSocialImage = normaliseMedia(property.socialImage, `${property.title} social image`)

  const initialBrochure = normaliseMedia(property.brochure, `${property.title} brochure`)

  const featuredImage = normaliseMedia(
    property.featuredImage as string | Media | null | undefined,
    `${property.title} featured image`,
  )

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

  const readinessItems: LaunchReadinessItem[] = [
    {
      label: 'Property title added',
      complete: Boolean(property.title.trim()),
      requiredForLaunch: true,
    },
    {
      label: 'Property URL created',
      complete: Boolean(property.slug.trim()),
      requiredForLaunch: true,
    },
    {
      label: 'Short listing summary added',
      complete: Boolean(property.excerpt?.trim()),
      requiredForLaunch: true,
    },
    {
      label: 'Price added',
      complete: typeof property.price === 'number' && property.price > 0,
      requiredForLaunch: true,
    },
    {
      label: 'Featured image added',
      complete: Boolean(property.featuredImage),
      requiredForLaunch: true,
    },
    {
      label: 'Gallery images added',
      complete: Array.isArray(property.gallery) && property.gallery.length > 0,
      requiredForLaunch: true,
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

      if (socialImage) {
        formData.set('socialImageId', socialImage.id)
      }

      if (newSocialImage) {
        formData.set('socialImage', newSocialImage)
      }

      formData.set('brochureManaged', 'true')

      if (brochure) {
        formData.set('brochureId', brochure.id)
      }

      if (newBrochure) {
        formData.set('brochure', newBrochure)
      }

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
      <LaunchStatusPanel
        readinessItems={readinessItems}
        readinessPercentage={readinessPercentage}
      />

      <ListingUrlPanel slug={property.slug} published={publishOnWebsite} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)] xl:items-stretch">
        <SocialPreviewPanel
          description={seoDescription || property.excerpt || ''}
          fallbackImageUrl={featuredImage?.url}
          imageFile={newSocialImage}
          imageUrl={socialImage?.url}
          slug={property.slug}
          title={seoTitle || marketingHeadline || property.title}
        />

        <MarketingHealthPanel
          seoTitle={seoTitle}
          seoDescription={seoDescription}
          featuredImage={featuredImage}
          socialImage={socialImage}
          brochure={brochure}
          publishOnWebsite={publishOnWebsite}
        />
      </div>

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
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(520px,1.15fr)]">
          <div className="space-y-6">
            <label className="block">
              <span className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-neutral-950">SEO title</span>

                <span
                  className={[
                    'inline-flex min-w-14 justify-center border px-2.5 py-1 text-xs font-medium',
                    seoTitle.length >= 55
                      ? 'border-amber-200 bg-amber-50 text-amber-800'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-600',
                  ].join(' ')}
                >
                  {seoTitle.length}/60
                </span>
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

              <span className="mt-2 block text-sm leading-6 text-neutral-500">
                Used as the clickable headline in search engine results.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-neutral-950">SEO description</span>

                <span
                  className={[
                    'inline-flex min-w-16 justify-center border px-2.5 py-1 text-xs font-medium',
                    seoDescription.length >= 150
                      ? 'border-amber-200 bg-amber-50 text-amber-800'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-600',
                  ].join(' ')}
                >
                  {seoDescription.length}/160
                </span>
              </span>

              <textarea
                className="min-h-36 w-full resize-y border border-neutral-300 bg-white px-4 py-3 text-sm leading-6 text-neutral-950 outline-none transition focus:border-neutral-950"
                maxLength={160}
                placeholder="Describe the property in a concise and compelling way."
                value={seoDescription}
                onChange={(event) => {
                  beginEdit()
                  setSeoDescription(event.target.value)
                }}
              />

              <span className="mt-2 block text-sm leading-6 text-neutral-500">
                Summarise the property clearly to encourage people to open the listing.
              </span>
            </label>
          </div>

          <div className="border border-neutral-200 bg-neutral-50 p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">Search preview</p>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  An approximate preview of how this property may appear in search results.
                </p>
              </div>

              <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live preview
              </span>
            </div>

            <div className="border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500">
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />

                    <path
                      d="M3.75 12h16.5M12 3.75c2.15 2.3 3.25 5.05 3.25 8.25S14.15 17.95 12 20.25M12 3.75C9.85 6.05 8.75 8.8 8.75 12S9.85 17.95 12 20.25"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-normal text-neutral-900">
                    Scotland Luxury Estates
                  </p>

                  <p className="truncate text-xs text-neutral-600">www.scotlandluxuryestates.com</p>
                </div>
              </div>

              <p className="mt-6 truncate text-[18px] leading-7 text-[#1a0dab]">
                {seoTitle || property.title}
              </p>

              <p className="mt-1 truncate text-sm text-emerald-700">
                scotlandluxuryestates.com › property › {property.slug}
              </p>

              <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">
                {seoDescription ||
                  property.excerpt ||
                  'Add an SEO description to preview the property search result.'}
              </p>
            </div>

            <p className="mt-4 text-xs leading-5 text-neutral-500">
              Search engines may adjust the title or description depending on the search query.
            </p>
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Marketing assets"
        description="Control the image used for social sharing and the downloadable property brochure."
      >
        <div className="grid gap-8 xl:grid-cols-2">
          <div>
            <div className="mb-3">
              <p className="text-sm font-semibold text-neutral-950">Social sharing image</p>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Upload a dedicated landscape image for social media and shared-link previews.
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

            <div className="mt-5 border-t border-neutral-200 pt-5">
              <dl className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-6">
                  <dt className="text-neutral-500">Recommended size</dt>

                  <dd className="text-right font-medium text-neutral-900">1200 × 630 px</dd>
                </div>

                <div className="flex items-start justify-between gap-6">
                  <dt className="text-neutral-500">Formats</dt>

                  <dd className="text-right font-medium text-neutral-900">JPG or PNG</dd>
                </div>

                <div className="flex items-start justify-between gap-6">
                  <dt className="text-neutral-500">Used for</dt>

                  <dd className="max-w-xs text-right font-medium text-neutral-900">
                    Facebook, LinkedIn and WhatsApp
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-6">
                  <dt className="text-neutral-500">Fallback</dt>

                  <dd className="text-right font-medium text-neutral-900">Featured image</dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <div className="mb-3">
              <p className="text-sm font-semibold text-neutral-950">Property brochure</p>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Upload the final property particulars as a PDF for buyers to download.
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

            <div className="mt-5 border-t border-neutral-200 pt-5">
              <dl className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-6">
                  <dt className="text-neutral-500">Current file</dt>

                  <dd className="max-w-xs truncate text-right font-medium text-neutral-900">
                    {newBrochure?.name || brochure?.filename || 'Not uploaded'}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-6">
                  <dt className="text-neutral-500">Format</dt>

                  <dd className="text-right font-medium text-neutral-900">PDF document</dd>
                </div>

                <div className="flex items-start justify-between gap-6">
                  <dt className="text-neutral-500">Visibility</dt>

                  <dd className="text-right font-medium text-neutral-900">Public listing</dd>
                </div>

                <div className="flex items-start justify-between gap-6">
                  <dt className="text-neutral-500">Purpose</dt>

                  <dd className="max-w-xs text-right font-medium text-neutral-900">
                    Downloadable property particulars
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Publishing destinations"
        description="Choose where this property is available and manage future portal distribution."
      >
        <div className="grid gap-4">
          <PublishingDestination
            checked={publishOnWebsite}
            description="Publish this property on the Scotland Luxury Estates website. Changes take effect after saving."
            label="Scotland Luxury Estates"
            status={publishOnWebsite ? 'published' : 'not-published'}
            onChange={(checked) => {
              beginEdit()
              setPublishOnWebsite(checked)
            }}
          />

          <PublishingDestination
            checked={publishToJamesEdition}
            description="Prepare this property for international luxury listing distribution through JamesEdition."
            disabled
            label="JamesEdition"
            status="coming-soon"
            onChange={(checked) => {
              beginEdit()
              setPublishToJamesEdition(checked)
            }}
          />

          <PublishingDestination
            checked={publishToRightmove}
            description="Prepare this property for distribution through the Rightmove property portal."
            disabled
            label="Rightmove"
            status="coming-soon"
            onChange={(checked) => {
              beginEdit()
              setPublishToRightmove(checked)
            }}
          />

          <PublishingDestination
            checked={publishToZoopla}
            description="Prepare this property for distribution through the Zoopla property portal."
            disabled
            label="Zoopla"
            status="coming-soon"
            onChange={(checked) => {
              beginEdit()
              setPublishToZoopla(checked)
            }}
          />
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
