import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import PropertyEditForm from '@/components/PropertyEditForm'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params

  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/admin/login')
  if (user.collection !== 'users') redirect('/login')

  const property = await payload.findByID({
    collection: 'properties',
    id,
    depth: 2,
    overrideAccess: true,
  })

  if (!property) return notFound()

  const userAsAny = user as any
  const isSuperAdmin = userAsAny.role === 'super-admin'
  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  const propertyAgencyId =
    typeof property.agency === 'object' ? property.agency?.id : property.agency

  if (!isSuperAdmin && agencyId !== propertyAgencyId) {
    redirect('/dashboard/properties')
  }

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

          <h1 className="mt-4 text-5xl font-medium tracking-tight">Edit property</h1>

          <p className="mt-4 text-muted-foreground">Update this property listing.</p>
        </div>

        <PropertyEditForm
          property={property}
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
