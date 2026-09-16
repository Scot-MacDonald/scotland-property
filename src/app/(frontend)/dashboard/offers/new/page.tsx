import { redirect } from 'next/navigation'

import { OfferCreateForm } from '@/components/DashboardV2/Offers'
import { DashboardHeader } from '@/components/DashboardV2/Layout/DashboardHeader'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'
import { getDashboardContext, getRelationshipId, getWorkspaceContext } from '@/lib/dashboard'

type NewOfferPageProps = {
  searchParams: Promise<{
    property?: string
  }>
}

export default async function NewOfferPage({ searchParams }: NewOfferPageProps) {
  const { property: requestedPropertyId } = await searchParams

  const { payload, user, agencyId, isSuperAdmin } = await getWorkspaceContext()

  if (!isSuperAdmin && !agencyId) {
    redirect('/dashboard')
  }

  const agencyWhere = isSuperAdmin
    ? undefined
    : {
        agency: {
          equals: agencyId,
        },
      }

  const [dashboard, propertyResult, buyerResult, agentResult] = await Promise.all([
    getDashboardContext({
      payload,
      user,
    }),

    payload.find({
      collection: 'properties',
      depth: 0,
      limit: 500,
      sort: 'title',
      where: agencyWhere,
      overrideAccess: true,
      select: {
        title: true,
        reference: true,
        agency: true,
      },
    }),

    payload.find({
      collection: 'buyers',
      depth: 0,
      limit: 500,
      sort: 'name',
      where: agencyWhere,
      overrideAccess: true,
      select: {
        name: true,
        email: true,
        agency: true,
      },
    }),

    payload.find({
      collection: 'agents',
      depth: 0,
      limit: 200,
      sort: 'name',
      where: agencyWhere,
      overrideAccess: true,
      select: {
        name: true,
        email: true,
        agency: true,
      },
    }),
  ])

  const properties = propertyResult.docs.map((property) => ({
    id: String(property.id),
    label: property.title || 'Untitled property',
    secondaryLabel: property.reference || undefined,
  }))

  const buyers = buyerResult.docs.map((buyer) => ({
    id: String(buyer.id),
    label: buyer.name || buyer.email || 'Unnamed buyer',
    secondaryLabel: buyer.email || undefined,
  }))

  const agents = agentResult.docs.map((agent) => ({
    id: String(agent.id),
    label: agent.name || agent.email || 'Unnamed agent',
    secondaryLabel: agent.email || undefined,
  }))

  const selectedProperty = requestedPropertyId
    ? propertyResult.docs.find((property) => String(property.id) === requestedPropertyId)
    : undefined

  const initialPropertyId =
    selectedProperty && (isSuperAdmin || getRelationshipId(selectedProperty.agency) === agencyId)
      ? String(selectedProperty.id)
      : undefined

  const agencyName =
    dashboard.agency?.name || (typeof user.name === 'string' ? user.name : null) || 'Your Agency'

  return (
    <DashboardLayout agencyName={agencyName} navigationCounts={dashboard.navigationCounts}>
      <DashboardHeader
        eyebrow="Offers"
        title="Create offer"
        description="Record a buyer’s offer, assign an agent and begin the negotiation workflow."
        actions={[
          {
            label: 'Back to offers',
            href: '/dashboard/offers',
            variant: 'secondary',
          },
        ]}
      />

      <DashboardWorkspace>
        <OfferCreateForm
          properties={properties}
          buyers={buyers}
          agents={agents}
          initialPropertyId={initialPropertyId}
        />
      </DashboardWorkspace>
    </DashboardLayout>
  )
}
