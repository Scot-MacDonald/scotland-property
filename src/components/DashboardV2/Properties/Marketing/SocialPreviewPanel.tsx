'use client'
import Link from 'next/link'
import { useEffect, useMemo } from 'react'

import { WorkspacePanel } from '@/components/DashboardV2/Workspace'
import { propertyUrl, siteUrl } from '@/lib/site'

type SocialPreviewPanelProps = {
  description: string
  fallbackImageUrl?: string | null
  imageFile?: File | null
  imageUrl?: string | null

  slug: string
  title: string
}

export function SocialPreviewPanel({
  description,
  fallbackImageUrl,
  imageFile,
  imageUrl,
  slug,
  title,
}: SocialPreviewPanelProps) {
  const uploadedImageUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  )

  useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl)
      }
    }
  }, [uploadedImageUrl])

  const previewImageUrl = uploadedImageUrl || imageUrl || fallbackImageUrl
  const listingUrl = propertyUrl(slug)
  const displayDomain = siteUrl.replace(/^https?:\/\//, '')

  return (
    <WorkspacePanel
      title="Social Preview"
      description="Preview how the property will appear when shared on Facebook, LinkedIn, WhatsApp and other platforms."
    >
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden  border border-neutral-200 bg-white ">
          <div className="relative aspect-[1.91/1] overflow-hidden bg-neutral-100">
            {previewImageUrl ? (
              <div
                aria-label={`${title} social sharing preview`}
                className="absolute inset-0 bg-cover bg-center"
                role="img"
                style={{
                  backgroundImage: `url("${previewImageUrl}")`,
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center px-8 text-center">
                <p className="max-w-sm text-sm leading-6 text-neutral-500">
                  Upload a social sharing image or use the featured image to complete this preview.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-200 bg-white px-6 py-5">
            <p className="text-xs tracking-wide text-neutral-500">{displayDomain}</p>

            <h3 className="mt-2 text-xl font-semibold leading-tight text-neutral-950">{title}</h3>

            <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">
              {description || 'Add an SEO description or listing summary to complete the preview.'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500">
            Preview based on your current marketing settings.
          </p>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 transition-all hover:gap-3"
            href={listingUrl}
            target="_blank"
          >
            Open public listing
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </WorkspacePanel>
  )
}
