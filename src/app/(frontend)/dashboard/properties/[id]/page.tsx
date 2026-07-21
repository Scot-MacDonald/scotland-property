import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import {
  DocumentsTab,
  HistoryTab,
  LocationTab,
  MarketingTab,
  MediaTab,
  PricingTab,
  PropertyOverviewForm,
} from '@/components/DashboardV2/Properties'
import {
  WorkspaceHeader,
  WorkspaceLayout,
  WorkspaceSidebar,
  WorkspaceSidebarItem,
  WorkspaceTabs,
  type WorkspaceTab,
} from '@/components/DashboardV2/Workspace'

import { formatDate, formatLabel, getRelationshipId, getRelationshipLabel } from '@/lib/dashboard'

type PropertyWorkspacePageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    tab?: string
  }>
}

const propertyTabIds = [
  'overview',
  'location',
  'media',
  'pricing',
  'marketing',
  'documents',
  'history',
] as const

type PropertyTabId = (typeof propertyTabIds)[number]

function isPropertyTabId(value: string): value is PropertyTabId {
  return propertyTabIds.includes(value as PropertyTabId)
}

function relationshipValue(
  relationship:
    | string
    | number
    | {
        id?: string | number
      }
    | null
    | undefined,
) {
  return getRelationshipId(relationship) || ''
}

function getStatusClasses(status: string | null | undefined) {
  switch (status) {
    case 'for-sale':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'reserved':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'sold':
      return 'border-neutral-300 bg-neutral-100 text-neutral-700'

    default:
      return 'border-neutral-200 bg-white text-neutral-600'
  }
}

export default async function PropertyWorkspacePage({
  params,
  searchParams,
}: PropertyWorkspacePageProps) {
  const { id } = await params
  const { tab = 'overview' } = await searchParams

  const activeTab: PropertyTabId = isPropertyTabId(tab) ? tab : 'overview'

  const workspaceTabs: WorkspaceTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      href: `/dashboard/properties/${id}`,
    },
    {
      id: 'location',
      label: 'Location',
      href: `/dashboard/properties/${id}?tab=location`,
    },
    {
      id: 'media',
      label: 'Media',
      href: `/dashboard/properties/${id}?tab=media`,
    },
    {
      id: 'pricing',
      label: 'Pricing',
      href: `/dashboard/properties/${id}?tab=pricing`,
    },
    {
      id: 'marketing',
      label: 'Marketing',
      href: `/dashboard/properties/${id}?tab=marketing`,
    },
    {
      id: 'documents',
      label: 'Documents',
      href: `/dashboard/properties/${id}?tab=documents`,
    },
    {
      id: 'history',
      label: 'History',
      href: `/dashboard/properties/${id}?tab=history`,
    },
  ]

  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user || user.collection !== 'users') {
    redirect('/login')
  }

  const agencyId = getRelationshipId(user.agency)
  const isSuperAdmin = user.role === 'super-admin'

  if (!isSuperAdmin && !agencyId) {
    redirect('/dashboard')
  }

  let property

  try {
    property = await payload.findByID({
      collection: 'properties',
      id,
      depth: 2,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }

  if (!property) {
    notFound()
  }

  const propertyAgencyId = getRelationshipId(property.agency)

  if (!isSuperAdmin && propertyAgencyId !== agencyId) {
    notFound()
  }

  const [regionsResult, townsResult, propertyTypesResult, agentsResult] = await Promise.all([
    payload.find({
      collection: 'regions',
      depth: 0,
      limit: 200,
      sort: 'name',
      overrideAccess: true,
    }),

    payload.find({
      collection: 'towns',
      depth: 0,
      limit: 500,
      sort: 'name',
      overrideAccess: true,
    }),

    payload.find({
      collection: 'property-types',
      depth: 0,
      limit: 200,
      sort: 'name',
      overrideAccess: true,
    }),

    payload.find({
      collection: 'agents',
      depth: 0,
      limit: 200,
      sort: 'name',
      overrideAccess: true,
      where: isSuperAdmin
        ? undefined
        : {
            agency: {
              equals: agencyId,
            },
          },
    }),
  ])

  const regions = regionsResult.docs.map((region) => ({
    value: String(region.id),
    label: region.name,
  }))

  const towns = townsResult.docs.map((town) => ({
    value: String(town.id),
    label: town.name,
  }))

  const propertyTypes = propertyTypesResult.docs.map((propertyType) => ({
    value: String(propertyType.id),
    label: propertyType.name,
  }))

  const agents = agentsResult.docs.map((agent) => ({
    value: String(agent.id),
    label: agent.name,
  }))

  return (
    <WorkspaceLayout
      header={
        <WorkspaceHeader
          backHref="/dashboard/properties"
          backLabel="Properties"
          eyebrow={property.reference || 'Property'}
          title={property.title}
          status={
            <span
              className={[
                'inline-flex border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                getStatusClasses(property.status),
              ].join(' ')}
            >
              {formatLabel(property.status)}
            </span>
          }
          actions={
            <>
              <a
                href={`/property/${property.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                View listing
              </a>

              <button
                type="button"
                disabled
                className="inline-flex h-10 cursor-not-allowed items-center justify-center bg-neutral-950 px-4 text-sm font-semibold text-white opacity-50"
              >
                Save changes
              </button>
            </>
          }
        />
      }
      tabs={<WorkspaceTabs tabs={workspaceTabs} activeTab={activeTab} />}
      sidebar={
        <WorkspaceSidebar title="Property details">
          <WorkspaceSidebarItem label="Status" value={formatLabel(property.status)} />

          <WorkspaceSidebarItem label="Agency" value={getRelationshipLabel(property.agency)} />

          <WorkspaceSidebarItem
            label="Assigned agent"
            value={getRelationshipLabel(property.agent)}
          />

          <WorkspaceSidebarItem label="Featured" value={property.featured ? 'Yes' : 'No'} />

          <WorkspaceSidebarItem label="Created" value={formatDate(property.createdAt)} />

          <WorkspaceSidebarItem label="Last updated" value={formatDate(property.updatedAt)} />
        </WorkspaceSidebar>
      }
    >
      {activeTab === 'overview' ? (
        <PropertyOverviewForm
          property={{
            id: String(property.id),
            title: property.title,
            reference: property.reference,
            excerpt: property.excerpt,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            internalArea: property.internalArea,
            landArea: property.landArea,
          }}
        />
      ) : null}

      {activeTab === 'location' ? (
        <LocationTab
          propertyId={String(property.id)}
          title={property.title}
          region={relationshipValue(property.region)}
          town={relationshipValue(property.town)}
          propertyType={relationshipValue(property.propertyType)}
          agent={relationshipValue(property.agent)}
          latitude={property.latitude}
          longitude={property.longitude}
          regions={regions}
          towns={towns}
          propertyTypes={propertyTypes}
          agents={agents}
        />
      ) : null}

      {activeTab === 'media' ? <MediaTab property={property} /> : null}

      {activeTab === 'pricing' ? (
        <PricingTab
          propertyId={String(property.id)}
          title={property.title}
          price={property.price}
          status={property.status}
          featured={property.featured}
        />
      ) : null}

      {activeTab === 'marketing' ? <MarketingTab property={property} /> : null}

      {activeTab === 'documents' ? <DocumentsTab /> : null}

      {activeTab === 'history' ? <HistoryTab propertyId={property.id} /> : null}
    </WorkspaceLayout>
  )
}
