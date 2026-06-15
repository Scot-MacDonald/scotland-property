import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/admin/login')
  }

  const isSuperAdmin = user.role === 'super-admin'

  const agencyId = typeof user.agency === 'object' ? user.agency?.id : user.agency

  const agencyFilter =
    !isSuperAdmin && agencyId
      ? {
          agency: {
            equals: agencyId,
          },
        }
      : {}

  const properties = await payload.count({
    collection: 'properties',
    where: agencyFilter,
    overrideAccess: true,
  })

  const agents = await payload.count({
    collection: 'agents',
    where: agencyFilter,
    overrideAccess: true,
  })

  const enquiries = await payload.count({
    collection: 'enquiries',
    where: agencyFilter,
    overrideAccess: true,
  })

  const newEnquiries = await payload.count({
    collection: 'enquiries',
    where: {
      and: [
        agencyFilter,
        {
          status: {
            equals: 'new',
          },
        },
      ],
    },
    overrideAccess: true,
  })

  const recentEnquiries = await payload.find({
    collection: 'enquiries',
    depth: 2,
    limit: 5,
    sort: '-createdAt',
    where: agencyFilter,
    overrideAccess: true,
  })

  const recentProperties = await payload.find({
    collection: 'properties',
    depth: 1,
    limit: 5,
    sort: '-updatedAt',
    where: agencyFilter,
    overrideAccess: true,
  })

  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
          Agency Dashboard
        </p>

        <h1 className="mt-2 text-5xl font-medium tracking-tight">Welcome back</h1>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Manage your properties, agents and enquiries from one place.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Properties"
          value={properties.totalDocs}
          href="/admin/collections/properties"
        />

        <DashboardCard title="Agents" value={agents.totalDocs} href="/admin/collections/agents" />

        <DashboardCard
          title="Enquiries"
          value={enquiries.totalDocs}
          href="/admin/collections/enquiries"
        />

        <DashboardCard
          title="New Leads"
          value={newEnquiries.totalDocs}
          href="/admin/collections/enquiries?where[status][equals]=new"
        />
      </div>

      <section className="mt-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Latest Activity
            </p>

            <h2 className="mt-2 text-3xl font-medium">Recent Enquiries</h2>
          </div>

          <Link href="/admin/collections/enquiries" className="border px-4 py-2 text-sm">
            View all
          </Link>
        </div>

        <div className="divide-y border">
          {recentEnquiries.docs.map((enquiry) => {
            const property = typeof enquiry.property === 'object' ? enquiry.property : null

            return (
              <Link
                key={enquiry.id}
                href="/admin/collections/enquiries"
                className="grid gap-4 p-5 hover:bg-gray-50 md:grid-cols-[1.5fr_1.5fr_1fr]"
              >
                <div>
                  <p className="font-medium">{enquiry.name}</p>
                  <p className="text-sm text-muted-foreground">{enquiry.email}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p className="font-medium">{property?.title || 'Unknown property'}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{enquiry.status?.replaceAll('-', ' ')}</p>
                </div>
              </Link>
            )
          })}

          {recentEnquiries.docs.length === 0 && (
            <div className="p-6 text-muted-foreground">No enquiries yet.</div>
          )}
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Listings</p>

            <h2 className="mt-2 text-3xl font-medium">Recent Properties</h2>
          </div>

          <Link href="/admin/collections/properties" className="border px-4 py-2 text-sm">
            View all
          </Link>
        </div>

        <div className="divide-y border">
          {recentProperties.docs.map((property) => (
            <Link
              key={property.id}
              href="/admin/collections/properties"
              className="flex items-center justify-between gap-4 p-5 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">{property.title}</p>

                <p className="text-sm text-muted-foreground">
                  Ref: {property.reference || property.slug}
                </p>
              </div>

              <p className="font-medium">£{property.price?.toLocaleString('en-GB')}</p>
            </Link>
          ))}

          {recentProperties.docs.length === 0 && (
            <div className="p-6 text-muted-foreground">No properties yet.</div>
          )}
        </div>
      </section>

      <section className="mt-16 grid gap-3 lg:grid-cols-3">
        <Link href="/admin/collections/properties" className="border p-8">
          <h2 className="text-2xl font-medium">Manage Properties</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Add, edit and review your property listings.
          </p>
        </Link>

        <Link href="/admin/collections/agents" className="border p-8">
          <h2 className="text-2xl font-medium">Manage Agents</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Manage your agency team and public agent profiles.
          </p>
        </Link>

        <Link href="/admin/collections/enquiries" className="border p-8">
          <h2 className="text-2xl font-medium">View Enquiries</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Track new leads, update statuses and add internal notes.
          </p>
        </Link>
      </section>
    </main>
  )
}

function DashboardCard({ title, value, href }: { title: string; value: number; href: string }) {
  return (
    <Link href={href} className="border p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{title}</p>

      <p className="mt-4 text-5xl font-medium">{value}</p>
    </Link>
  )
}
