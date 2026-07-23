import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { BuyerOverviewForm } from '@/components/DashboardV2/Buyers'

import {
  formatDate,
  formatDateTime,
  getRelationshipId,
  getRelationshipLabel,
} from '@/lib/dashboard'

import {
  WorkspaceHeader,
  WorkspaceLayout,
  WorkspacePanel,
  WorkspaceSidebar,
  WorkspaceSidebarItem,
  WorkspaceTabs,
  WorkspaceTimeline,
  type WorkspaceTab,
} from '@/components/DashboardV2/Workspace'

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

  return (
    <WorkspaceLayout
      header={
        <WorkspaceHeader
          backHref="/dashboard/buyers"
          backLabel="Buyers"
          eyebrow="Buyer"
          title={buyer.name || buyer.email || 'Unnamed buyer'}
        />
      }
      tabs={<WorkspaceTabs tabs={workspaceTabs} activeTab={activeTab} />}
      sidebar={
        <WorkspaceSidebar title="Buyer details">
          <WorkspaceSidebarItem label="Email" value={buyer.email || '—'} />

          <WorkspaceSidebarItem label="Agency" value={getRelationshipLabel(buyer.agency)} />

          <WorkspaceSidebarItem label="Alerts enabled" value={buyer.alertsEnabled ? 'Yes' : 'No'} />

          <WorkspaceSidebarItem label="Saved properties" value={String(savedProperties.length)} />

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

      {savedProperties.map((property) => {
        if (typeof property !== 'object' || property === null) {
          return null
        }

        return (
          <div
            key={String(property.id)}
            className="flex items-center justify-between border border-neutral-200 bg-white p-5 transition hover:border-neutral-300"
          >
            <div className="min-w-0">
              <p className="text-lg font-semibold text-neutral-950">{property.title}</p>

              <p className="mt-1 text-sm text-neutral-500">
                {property.price
                  ? new Intl.NumberFormat('en-GB', {
                      style: 'currency',
                      currency: 'GBP',
                      maximumFractionDigits: 0,
                    }).format(property.price)
                  : 'Price on application'}
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href={`/dashboard/properties/${property.id}`}
                className="border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-50"
              >
                Workspace
              </a>

              {property.slug ? (
                <a
                  href={`/property/${property.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Listing
                </a>
              ) : null}
            </div>
          </div>
        )
      })}

      {propertyEnquiries.map((enquiry) => {
        if (typeof enquiry !== 'object' || enquiry === null) {
          return null
        }

        const property =
          typeof enquiry.property === 'object' && enquiry.property !== null
            ? enquiry.property
            : null

        return (
          <div
            key={String(enquiry.id)}
            className="flex items-center justify-between border border-neutral-200 bg-white p-5 transition hover:border-neutral-300"
          >
            <div className="min-w-0">
              <p className="text-lg font-semibold text-neutral-950">
                {property?.title || 'Unknown Property'}
              </p>

              <p className="mt-1 text-sm text-neutral-500">Buyer enquiry</p>

              <p className="mt-3 inline-flex border border-neutral-300 bg-neutral-50 px-2 py-1 text-xs font-medium uppercase tracking-wide text-neutral-700">
                {String(enquiry.status || 'new')
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, (letter) => letter.toUpperCase())}
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href={`/dashboard/enquiries/${enquiry.id}`}
                className="border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-50"
              >
                Open
              </a>

              {property?.slug ? (
                <a
                  href={`/property/${property.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Listing
                </a>
              ) : null}
            </div>
          </div>
        )
      })}

      {activeTab === 'saved-searches' ? (
        <WorkspacePanel title="Saved Searches" description="Searches saved by this buyer.">
          {savedSearches.length > 0 ? (
            <div className="space-y-4">
              {savedSearches.map((search, index) => (
                <div
                  key={search.id || `${search.label}-${index}`}
                  className="border border-neutral-200 bg-white p-4"
                >
                  <p className="font-medium text-neutral-950">{search.label}</p>

                  <p className="mt-1 break-all text-sm text-neutral-500">{search.queryString}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-600">This buyer has no saved searches.</p>
          )}
        </WorkspacePanel>
      ) : null}

      {activeTab === 'history' ? (
        <WorkspacePanel title="History" description="Recent activity for this buyer.">
          <WorkspaceTimeline
            items={[
              ...(buyer.lastActiveAt
                ? [
                    {
                      id: 'last-active',
                      title: 'Buyer last active',
                      date: buyer.lastActiveAt,
                      description: 'The buyer used the property platform.',
                    },
                  ]
                : []),
              {
                id: 'updated',
                title: 'Buyer record updated',
                date: buyer.updatedAt,
                description: 'The buyer profile was changed.',
              },
              {
                id: 'created',
                title: 'Buyer account created',
                date: buyer.createdAt,
                description: 'The buyer registered an account.',
              },
            ]}
          />
        </WorkspacePanel>
      ) : null}
    </WorkspaceLayout>
  )
}
