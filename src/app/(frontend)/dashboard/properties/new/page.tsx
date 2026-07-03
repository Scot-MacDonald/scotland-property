import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import PropertyCreateForm from '@/components/PropertyCreateForm'

export default async function NewPropertyPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/admin/login')
  if (user.collection !== 'users') redirect('/login')

  const userAsAny = user as any
  const isSuperAdmin = userAsAny.role === 'super-admin'
  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  if (!isSuperAdmin && !agencyId) redirect('/dashboard')

  const [regions, towns, propertyTypes, amenities, agents] = await Promise.all([
    payload.find({
      collection: 'regions',
      limit: 100,
      sort: 'name',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'towns',
      limit: 200,
      sort: 'name',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'property-types',
      limit: 100,
      sort: 'name',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'amenities',
      limit: 100,
      sort: 'name',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'agents',
      limit: 100,
      sort: 'name',
      where:
        !isSuperAdmin && agencyId
          ? {
              agency: {
                equals: agencyId,
              },
            }
          : {},
      overrideAccess: true,
    }),
  ])

  return (
    <main className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">
        <div className="mb-8">
          <a
            href="/dashboard/properties"
            className="text-sm text-muted-foreground hover:text-black"
          >
            ← Back to properties
          </a>

          <h1 className="mt-4 text-5xl font-medium tracking-tight">Add property</h1>

          <p className="mt-4 text-muted-foreground">Create a new listing for your agency.</p>
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
