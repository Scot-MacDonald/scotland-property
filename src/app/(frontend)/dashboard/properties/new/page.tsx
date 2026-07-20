import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import PropertyCreateForm from '@/components/PropertyCreateForm'
import { getRelationshipId } from '@/lib/dashboard/workspaceHelpers'

export default async function NewPropertyPage() {
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

  const agentWhere =
    !isSuperAdmin && agencyId
      ? {
          agency: {
            equals: agencyId,
          },
        }
      : undefined

  const [regions, towns, propertyTypes, amenities, agents] = await Promise.all([
    payload.find({
      collection: 'regions',
      depth: 0,
      limit: 100,
      sort: 'name',
      overrideAccess: true,
    }),

    payload.find({
      collection: 'towns',
      depth: 0,
      limit: 200,
      sort: 'name',
      overrideAccess: true,
    }),

    payload.find({
      collection: 'property-types',
      depth: 0,
      limit: 100,
      sort: 'name',
      overrideAccess: true,
    }),

    payload.find({
      collection: 'amenities',
      depth: 0,
      limit: 100,
      sort: 'name',
      overrideAccess: true,
    }),

    payload.find({
      collection: 'agents',
      depth: 0,
      limit: 100,
      sort: 'name',
      where: agentWhere,
      overrideAccess: true,
    }),
  ])

  return (
    <main className="min-h-screen bg-[#f4f2ed]">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="mb-10 border-b border-black/10 pb-8">
          <Link
            href="/dashboard/properties"
            className="text-sm text-black/55 transition hover:text-black"
          >
            ← Back to properties
          </Link>

          <p className="mt-8 text-xs uppercase tracking-[0.24em] text-black/45">Properties</p>

          <h1 className="mt-3 text-4xl font-medium tracking-tight">Add property</h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
            Create a new listing for your agency.
          </p>
        </div>

        <PropertyCreateForm
          regions={regions.docs}
          towns={towns.docs}
          propertyTypes={propertyTypes.docs}
          amenities={amenities.docs}
          agents={agents.docs}
        />
      </div>
    </main>
  )
}
