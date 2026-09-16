import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { BuyerOverviewForm } from '@/components/DashboardV2/Buyers'
import { DashboardEnquiryCard } from '@/components/DashboardV2/Cards/DashboardEnquiryCard'
import { DashboardPropertyCard } from '@/components/DashboardV2/Cards/DashboardPropertyCard'
import { DashboardEmptyState } from '@/components/DashboardV2/Shared/DashboardEmptyState'
import { TimelineView } from '@/components/DashboardV2/Timeline/TimelineView'
import {
  WorkspaceHeader,
  WorkspaceLayout,
  WorkspacePanel,
  WorkspaceSidebar,
  WorkspaceSidebarItem,
  WorkspaceTabs,
  type WorkspaceTab,
} from '@/components/DashboardV2/Workspace'
import { getActivityRelationMap } from '@/lib/activity'
import {
  formatDate,
  formatDateTime,
  getRelationshipId,
  getRelationshipLabel,
} from '@/lib/dashboard'

type BuyerWorkspacePageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    tab?: string
  }>
}

const buyerTabIds = [
  'overview',
  'saved-properties',
  'enquiries',
  'saved-searches',
  'history',
] as const

type BuyerTabId = (typeof buyerTabIds)[number]

function isBuyerTabId(value: string): value is BuyerTabId {
  return buyerTabIds.includes(value as BuyerTabId)
}

function formatPrice(value: number | null | undefined) {
  if (!value) {
    return 'Price on request'
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatStatus(value: string | null | undefined) {
  if (!value) {
    return 'Draft'
  }

  return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getMediaUrl(
  value:
    | string
    | number
    | {
        url?: string | null
      }
    | null
    | undefined,
) {
  if (!value || typeof value !== 'object') {
    return null
  }

  return value.url || null
}

function getLocationLabel(
  town:
    | string
    | number
    | {
        name?: string | null
        title?: string | null
      }
    | null
    | undefined,
  region:
    | string
    | number
    | {
        name?: string | null
        title?: string | null
      }
    | null
    | undefined,
) {
  const townLabel =
    typeof town === 'object' && town !== null ? town.name || town.title || null : null

  const regionLabel =
    typeof region === 'object' && region !== null ? region.name || region.title || null : null

  return [townLabel, regionLabel].filter(Boolean).join(' • ') || 'Scotland'
}

function getSavedSearchHref(queryString: string) {
  const value = queryString.trim()

  if (!value) {
    return '/properties'
  }

  if (value.startsWith('/properties')) {
    return value
  }

  if (value.startsWith('?')) {
    return `/properties${value}`
  }

  return `/properties?${value}`
}

export default async function BuyerWorkspacePage({
  params,
  searchParams,
}: BuyerWorkspacePageProps) {
  const { id } = await params
  const { tab = 'overview' } = await searchParams

  const activeTab: BuyerTabId = isBuyerTabId(tab) ? tab : 'overview'

  const workspaceTabs: WorkspaceTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      href: `/dashboard/buyers/${id}`,
    },
    {
      id: 'saved-properties',
      label: 'Saved Properties',
      href: `/dashboard/buyers/${id}?tab=saved-properties`,
    },
    {
      id: 'enquiries',
      label: 'Enquiries',
      href: `/dashboard/buyers/${id}?tab=enquiries`,
    },
    {
      id: 'saved-searches',
      label: 'Saved Searches',
      href: `/dashboard/buyers/${id}?tab=saved-searches`,
    },
    {
      id: 'history',
      label: 'History',
      href: `/dashboard/buyers/${id}?tab=history`,
    },
  ]

  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'users') {
    redirect('/login')
  }

  const agencyId = getRelationshipId(user.agency)
  const isSuperAdmin = user.role === 'super-admin'

  if (!isSuperAdmin && !agencyId) {
    redirect('/dashboard')
  }

  let buyer

  try {
    buyer = await payload.findByID({
      collection: 'buyers',
      id,
      depth: 2,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }

  if (!buyer) {
    notFound()
  }

  const buyerAgencyId = getRelationshipId(buyer.agency)

  if (!isSuperAdmin && buyerAgencyId !== agencyId) {
    notFound()
  }

  const savedProperties = Array.isArray(buyer.savedProperties) ? buyer.savedProperties : []

  const propertyEnquiries = Array.isArray(buyer.propertyEnquiries) ? buyer.propertyEnquiries : []

  const savedSearches = Array.isArray(buyer.savedSearches) ? buyer.savedSearches : []

  const buyerTitle = buyer.name || buyer.email || 'Unnamed buyer'

  const activitiesResult =
    activeTab === 'history'
      ? await payload.find({
          collection: 'activities',
          depth: 1,
          limit: 100,
          pagination: false,
          sort: '-createdAt',
          overrideAccess: true,
          where: {
            entityType: {
              equals: 'buyer',
            },
            entityId: {
              equals: String(buyer.id),
            },
          },
        })
      : null

  const activities = activitiesResult?.docs || []

  const activityRelationMap =
    activeTab === 'history' && activities.length > 0
      ? await getActivityRelationMap(payload, activities)
      : {}

  return (
    <WorkspaceLayout
      header={
        <WorkspaceHeader
          backHref="/dashboard/buyers"
          backLabel="Buyers"
          eyebrow="Buyer"
          title={buyerTitle}
        />
      }
      tabs={<WorkspaceTabs tabs={workspaceTabs} activeTab={activeTab} />}
      sidebar={
        <WorkspaceSidebar title="Buyer details">
          <WorkspaceSidebarItem label="Email" value={buyer.email || '—'} />

          <WorkspaceSidebarItem label="Agency" value={getRelationshipLabel(buyer.agency)} />

          <WorkspaceSidebarItem label="Alerts enabled" value={buyer.alertsEnabled ? 'Yes' : 'No'} />

          <WorkspaceSidebarItem label="Saved properties" value={String(savedProperties.length)} />

          <WorkspaceSidebarItem label="Enquiries" value={String(propertyEnquiries.length)} />

          <WorkspaceSidebarItem label="Saved searches" value={String(savedSearches.length)} />

          <WorkspaceSidebarItem label="Last active" value={formatDateTime(buyer.lastActiveAt)} />

          <WorkspaceSidebarItem label="Created" value={formatDate(buyer.createdAt)} />

          <WorkspaceSidebarItem label="Last updated" value={formatDate(buyer.updatedAt)} />
        </WorkspaceSidebar>
      }
    >
      {activeTab === 'overview' ? (
        <BuyerOverviewForm
          buyer={{
            id: String(buyer.id),
            name: buyer.name,
            email: buyer.email,
            alertsEnabled: buyer.alertsEnabled,
          }}
        />
      ) : null}

      {activeTab === 'saved-properties' ? (
        <WorkspacePanel
          title="Saved Properties"
          description="Properties this buyer has saved to their account."
        >
          {savedProperties.length > 0 ? (
            <div className="space-y-5">
              {savedProperties.map((property) => {
                if (typeof property !== 'object' || property === null) {
                  return null
                }

                return (
                  <DashboardPropertyCard
                    key={String(property.id)}
                    title={property.title || 'Untitled property'}
                    location={getLocationLabel(property.town, property.region)}
                    price={formatPrice(property.price)}
                    status={formatStatus(property.status)}
                    reference={property.reference || property.slug || String(property.id)}
                    bedrooms={property.bedrooms || 0}
                    bathrooms={property.bathrooms || 0}
                    image={getMediaUrl(property.featuredImage)}
                    featured={Boolean(property.featured)}
                    href={`/dashboard/properties/${property.id}`}
                    viewHref={property.slug ? `/property/${property.slug}` : '/properties'}
                  />
                )
              })}
            </div>
          ) : (
            <DashboardEmptyState
              title="No saved properties"
              description="Properties saved by this buyer will appear here."
            />
          )}
        </WorkspacePanel>
      ) : null}

      {activeTab === 'enquiries' ? (
        <WorkspacePanel title="Enquiries" description="Property enquiries submitted by this buyer.">
          {propertyEnquiries.length > 0 ? (
            <div className="space-y-5">
              {propertyEnquiries.map((enquiry) => {
                if (typeof enquiry !== 'object' || enquiry === null) {
                  return null
                }

                const property =
                  typeof enquiry.property === 'object' && enquiry.property !== null
                    ? enquiry.property
                    : null

                return (
                  <DashboardEnquiryCard
                    key={String(enquiry.id)}
                    id={String(enquiry.id)}
                    name={enquiry.name || buyer.name || 'Unnamed buyer'}
                    email={enquiry.email || buyer.email}
                    phone={enquiry.phone}
                    message={enquiry.message}
                    status={enquiry.status || 'new'}
                    createdAt={enquiry.createdAt}
                    property={
                      property
                        ? {
                            id: String(property.id),
                            title: property.title || 'Untitled property',
                            slug: property.slug || null,
                          }
                        : null
                    }
                  />
                )
              })}
            </div>
          ) : (
            <DashboardEmptyState
              title="No enquiries"
              description="Property enquiries submitted by this buyer will appear here."
            />
          )}
        </WorkspacePanel>
      ) : null}

      {activeTab === 'saved-searches' ? (
        <WorkspacePanel title="Saved Searches" description="Property searches saved by this buyer.">
          {savedSearches.length > 0 ? (
            <div className="divide-y divide-neutral-200 border border-neutral-200 bg-white">
              {savedSearches.map((search, index) => (
                <div
                  key={search.id || `${search.label}-${index}`}
                  className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-950">
                      {search.label || 'Saved search'}
                    </p>

                    <p className="mt-2 break-all text-sm leading-6 text-neutral-500">
                      {search.queryString}
                    </p>

                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                      Saved {formatDate(search.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <span
                      className={[
                        'inline-flex min-h-10 items-center border px-4 text-xs font-semibold uppercase tracking-[0.12em]',
                        buyer.alertsEnabled
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-neutral-300 bg-neutral-100 text-neutral-600',
                      ].join(' ')}
                    >
                      {buyer.alertsEnabled ? 'Alerts enabled' : 'Alerts disabled'}
                    </span>

                    <Link
                      href={getSavedSearchHref(search.queryString)}
                      target="_blank"
                      className="inline-flex min-h-10 items-center justify-center bg-neutral-950 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-neutral-800"
                    >
                      Run search
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DashboardEmptyState
              title="No saved searches"
              description="Searches saved by this buyer will appear here."
            />
          )}
        </WorkspacePanel>
      ) : null}

      {activeTab === 'history' ? (
        <WorkspacePanel
          title="History"
          description="Account and engagement activity for this buyer."
        >
          <TimelineView
            activities={activities}
            relationMap={activityRelationMap}
            compact
            emptyTitle="No buyer activity yet"
            emptyDescription="Updates and CRM activity associated with this buyer will appear here."
          />
        </WorkspacePanel>
      ) : null}
    </WorkspaceLayout>
  )
}
