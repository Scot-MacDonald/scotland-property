import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  OfferHistoryTab,
  OfferNegotiationForm,
  OfferOverviewForm,
} from '@/components/DashboardV2/Offers'

import {
  WorkspaceHeader,
  WorkspaceLayout,
  WorkspaceSidebar,
  WorkspaceSidebarItem,
  WorkspaceTabs,
  type WorkspaceTab,
} from '@/components/DashboardV2/Workspace'

import {
  assertWorkspaceOwnership,
  formatDate,
  formatDateTime,
  formatLabel,
  getRelationshipId,
  getRelationshipLabel,
  getWorkspaceContext,
} from '@/lib/dashboard'

type OfferWorkspacePageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    tab?: string
  }>
}

const offerTabIds = ['overview', 'negotiation', 'history'] as const

type OfferTabId = (typeof offerTabIds)[number]

type BuyerRelationship =
  | string
  | number
  | {
      id?: string | number
      name?: string | null
      email?: string | null
      phone?: string | null
    }
  | null
  | undefined

function isOfferTabId(value: string): value is OfferTabId {
  return offerTabIds.includes(value as OfferTabId)
}

function getStatusClasses(status: string | null | undefined) {
  switch (status) {
    case 'draft':
      return 'border-neutral-300 bg-white text-neutral-700'

    case 'submitted':
      return 'border-blue-200 bg-blue-50 text-blue-700'

    case 'negotiating':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'accepted':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'rejected':
      return 'border-red-200 bg-red-50 text-red-700'

    case 'withdrawn':
      return 'border-neutral-300 bg-neutral-100 text-neutral-500'

    default:
      return 'border-neutral-200 bg-white text-neutral-600'
  }
}

function getConfidenceClasses(confidence: string | null | undefined) {
  switch (confidence) {
    case 'high':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'medium':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'low':
      return 'border-red-200 bg-red-50 text-red-700'

    default:
      return 'border-neutral-200 bg-white text-neutral-600'
  }
}

function formatCurrency(amount: number | null | undefined) {
  if (typeof amount !== 'number') {
    return 'Not recorded'
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount)
}

function getBuyerEmail(buyer: BuyerRelationship) {
  if (!buyer || typeof buyer !== 'object') {
    return null
  }

  return buyer.email || null
}

function getBuyerPhone(buyer: BuyerRelationship) {
  if (!buyer || typeof buyer !== 'object') {
    return null
  }

  return buyer.phone || null
}

export default async function OfferWorkspacePage({
  params,
  searchParams,
}: OfferWorkspacePageProps) {
  const { id } = await params
  const { tab = 'overview' } = await searchParams

  const activeTab: OfferTabId = isOfferTabId(tab) ? tab : 'overview'

  const workspaceTabs: WorkspaceTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      href: `/dashboard/offers/${id}`,
    },
    {
      id: 'negotiation',
      label: 'Negotiation',
      href: `/dashboard/offers/${id}?tab=negotiation`,
    },
    {
      id: 'history',
      label: 'History',
      href: `/dashboard/offers/${id}?tab=history`,
    },
  ]

  const { payload, agencyId, isSuperAdmin } = await getWorkspaceContext()

  let offer

  try {
    offer = await payload.findByID({
      collection: 'offers',
      id,
      depth: 2,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }

  if (!offer) {
    notFound()
  }

  assertWorkspaceOwnership({
    recordAgency: offer.agency,
    agencyId,
    isSuperAdmin,
  })

  const agentsResult = await payload.find({
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
  })

  const agentOptions = agentsResult.docs.map((agent) => ({
    id: String(agent.id),
    name: agent.name || agent.email || 'Unnamed agent',
  }))

  const propertyId = getRelationshipId(offer.property)
  const buyerId = getRelationshipId(offer.buyer)

  const propertyLabel = getRelationshipLabel(offer.property) || 'Unknown property'
  const buyerLabel = getRelationshipLabel(offer.buyer) || 'Unknown buyer'
  const agentLabel = getRelationshipLabel(offer.agent) || 'Not assigned'
  const agencyLabel = getRelationshipLabel(offer.agency) || 'Not assigned'

  const buyerEmail = getBuyerEmail(offer.buyer)
  const buyerPhone = getBuyerPhone(offer.buyer)

  let content

  switch (activeTab) {
    case 'negotiation':
      content = (
        <OfferNegotiationForm
          offer={{
            id: String(offer.id),
            conditions: offer.conditions,
            vendorResponse: offer.vendorResponse,
            buyerResponse: offer.buyerResponse,
            internalNotes: offer.internalNotes,
          }}
        />
      )
      break

    case 'history':
      content = <OfferHistoryTab offerId={String(offer.id)} />
      break

    case 'overview':
    default:
      content = (
        <OfferOverviewForm
          offer={{
            id: String(offer.id),
            amount: offer.amount,
            status: offer.status,
            confidence: offer.confidence,
            agentId: getRelationshipId(offer.agent),
            submittedAt: offer.submittedAt,
            expiresAt: offer.expiresAt,
          }}
          agents={agentOptions}
        />
      )
      break
  }

  return (
    <WorkspaceLayout
      header={
        <WorkspaceHeader
          backHref="/dashboard/offers"
          backLabel="Offers"
          eyebrow={offer.reference}
          title={`${formatCurrency(offer.amount)} offer`}
          status={
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  'inline-flex border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                  getStatusClasses(offer.status),
                ].join(' ')}
              >
                {formatLabel(offer.status)}
              </span>

              <span
                className={[
                  'inline-flex border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                  getConfidenceClasses(offer.confidence),
                ].join(' ')}
              >
                {formatLabel(offer.confidence)} confidence
              </span>
            </div>
          }
          actions={
            <>
              {buyerPhone ? (
                <a
                  href={`tel:${buyerPhone}`}
                  className="inline-flex h-10 items-center justify-center border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  Call buyer
                </a>
              ) : null}

              {buyerEmail ? (
                <a
                  href={`mailto:${buyerEmail}`}
                  className="inline-flex h-10 items-center justify-center border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  Email buyer
                </a>
              ) : null}

              {propertyId ? (
                <Link
                  href={`/dashboard/properties/${propertyId}`}
                  className="inline-flex h-10 items-center justify-center bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Open property
                </Link>
              ) : null}
            </>
          }
        />
      }
      tabs={<WorkspaceTabs tabs={workspaceTabs} activeTab={activeTab} />}
      sidebar={
        <WorkspaceSidebar title="Offer details">
          <WorkspaceSidebarItem label="Reference" value={offer.reference} />

          <WorkspaceSidebarItem label="Status" value={formatLabel(offer.status)} />

          <WorkspaceSidebarItem label="Amount" value={formatCurrency(offer.amount)} />

          <WorkspaceSidebarItem
            label="Confidence"
            value={`${formatLabel(offer.confidence)} confidence`}
          />

          <WorkspaceSidebarItem label="Property" value={propertyLabel} />

          <WorkspaceSidebarItem label="Buyer" value={buyerLabel} />

          <WorkspaceSidebarItem label="Assigned agent" value={agentLabel} />

          <WorkspaceSidebarItem label="Agency" value={agencyLabel} />

          <WorkspaceSidebarItem label="Submitted" value={formatDateTime(offer.submittedAt)} />

          <WorkspaceSidebarItem label="Expires" value={formatDateTime(offer.expiresAt)} />

          <WorkspaceSidebarItem label="Created" value={formatDate(offer.createdAt)} />

          <WorkspaceSidebarItem label="Last updated" value={formatDate(offer.updatedAt)} />

          {buyerId ? (
            <div className="border-t border-neutral-200 pt-4">
              <Link
                href={`/dashboard/buyers/${buyerId}`}
                className="text-sm font-semibold text-neutral-950 underline-offset-4 hover:underline"
              >
                Open buyer workspace
              </Link>
            </div>
          ) : null}
        </WorkspaceSidebar>
      }
    >
      {content}
    </WorkspaceLayout>
  )
}
