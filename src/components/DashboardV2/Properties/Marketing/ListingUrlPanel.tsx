'use client'

import { useState } from 'react'
import { WorkspacePanel } from '@/components/DashboardV2/Workspace'
import { propertyUrl } from '@/lib/site'

type ListingUrlPanelProps = {
  slug: string
  published: boolean
}

export function ListingUrlPanel({ slug, published }: ListingUrlPanelProps) {
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  const listingUrl = propertyUrl(slug)

  async function copyListingUrl() {
    try {
      await navigator.clipboard.writeText(listingUrl)
      setCopyMessage('Copied')

      window.setTimeout(() => {
        setCopyMessage(null)
      }, 2000)
    } catch {
      setCopyMessage('Could not copy')
    }
  }

  function openListing() {
    window.open(listingUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <WorkspacePanel
      title="Public listing"
      description="Copy or open the public property page used in campaigns and client communications."
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-neutral-950">Listing URL</p>

            <span
              className={[
                'inline-flex items-center border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                published
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-neutral-200 bg-neutral-100 text-neutral-600',
              ].join(' ')}
            >
              {published ? 'Website enabled' : 'Website disabled'}
            </span>
          </div>

          <div className="mt-3 overflow-hidden border border-neutral-300 bg-neutral-50">
            <p className="truncate px-4 py-3 text-sm text-neutral-700">{listingUrl}</p>
          </div>

          <p className="mt-2 min-h-5 text-sm text-neutral-500">
            {copyMessage ||
              (published
                ? 'This listing is enabled for publication on the website.'
                : 'The URL exists, but website publication is currently disabled.')}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            className="border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950"
            type="button"
            onClick={copyListingUrl}
          >
            Copy URL
          </button>

          <button
            className="border border-neutral-950 bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            type="button"
            onClick={openListing}
          >
            Open listing
          </button>
        </div>
      </div>
    </WorkspacePanel>
  )
}
