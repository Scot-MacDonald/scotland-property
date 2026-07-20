import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { ViewingCreateForm } from '@/components/DashboardV2/Viewings/ViewingCreateForm'
import { getRelationshipId, getRelationshipLabel } from '@/lib/dashboard/workspaceHelpers'

export default async function NewViewingPage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user || user.collection !== 'users') {
    redirect('/agency/login')
  }

  const isSuperAdmin = user.role === 'super-admin'
  const agencyId = getRelationshipId(user.agency)

  if (!isSuperAdmin && !agencyId) {
    redirect('/dashboard')
  }

  const agencyWhere = agencyId
    ? {
        agency: {
          equals: agencyId,
        },
      }
    : undefined

  const [propertyResult, agentResult, buyerResult, enquiryResult] = await Promise.all([
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
      },
    }),

    payload.find({
      collection: 'buyers',
      depth: 0,
      limit: 500,
      sort: 'name',
      overrideAccess: true,
      select: {
        name: true,
        email: true,
      },
    }),

    payload.find({
      collection: 'enquiries',
      depth: 1,
      limit: 500,
      sort: '-createdAt',
      where: agencyWhere,
      overrideAccess: true,
      select: {
        name: true,
        email: true,
        phone: true,
        property: true,
      },
    }),
  ])

  const properties = propertyResult.docs.map((property) => ({
    id: String(property.id),
    label: property.title || 'Untitled property',
    secondaryLabel: property.reference || undefined,
  }))

  const agents = agentResult.docs.map((agent) => ({
    id: String(agent.id),
    label: agent.name || agent.email || 'Unnamed agent',
    secondaryLabel: agent.email || undefined,
  }))

  const buyers = buyerResult.docs.map((buyer) => ({
    id: String(buyer.id),
    label: buyer.name || buyer.email || 'Unnamed buyer',
    secondaryLabel: buyer.email || undefined,
  }))

  const enquiries = enquiryResult.docs.map((enquiry) => ({
    id: String(enquiry.id),
    label: enquiry.name || enquiry.email || 'Unnamed enquiry',
    secondaryLabel: enquiry.email || undefined,
    propertyId: getRelationshipId(enquiry.property) || undefined,
    propertyLabel: getRelationshipLabel(enquiry.property) || undefined,
    contactName: enquiry.name || '',
    contactEmail: enquiry.email || '',
    contactPhone: enquiry.phone || undefined,
  }))

  return (
    <main className="min-h-screen bg-[#f4f2ed]">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="mb-10 border-b border-black/10 pb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-black/45">Viewings</p>

          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-medium tracking-tight">Book viewing</h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
                Schedule a property viewing and assign it to an agent.
              </p>
            </div>
          </div>
        </div>

        <ViewingCreateForm
          properties={properties}
          agents={agents}
          buyers={buyers}
          enquiries={enquiries}
        />
      </div>
    </main>
  )
}
