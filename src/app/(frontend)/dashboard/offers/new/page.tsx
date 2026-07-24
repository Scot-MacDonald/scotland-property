import { redirect } from 'next/navigation'

import { OfferCreateForm } from '@/components/DashboardV2/Offers'
import { getRelationshipId, getWorkspaceContext } from '@/lib/dashboard'

type NewOfferPageProps = {
  searchParams: Promise<{
    property?: string
  }>
}

export default async function NewOfferPage({ searchParams }: NewOfferPageProps) {
  const { property: requestedPropertyId } = await searchParams

  const { payload, agencyId, isSuperAdmin } = await getWorkspaceContext()

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

  const [propertyResult, buyerResult, agentResult] = await Promise.all([
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

  return (
    <main className="min-h-screen bg-[#f4f2ed]">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="mb-10 border-b border-black/10 pb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-black/45">Offers</p>

          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-medium tracking-tight">Create offer</h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
                Record a buyer&apos;s offer, assign an agent and begin the negotiation workflow.
              </p>
            </div>
          </div>
        </div>

        <OfferCreateForm
          properties={properties}
          buyers={buyers}
          agents={agents}
          initialPropertyId={initialPropertyId}
        />
      </div>
    </main>
  )
}
