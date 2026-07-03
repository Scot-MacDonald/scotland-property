import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardAgentsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/admin/login')
  if (user.collection !== 'users') redirect('/login')

  const userAsAny = user as any
  const isSuperAdmin = userAsAny.role === 'super-admin'
  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  const agentFilter =
    !isSuperAdmin && agencyId
      ? {
          agency: {
            equals: agencyId,
          },
        }
      : {}

  const agents = await payload.find({
    collection: 'agents',
    depth: 2,
    limit: 100,
    sort: 'name',
    where: agentFilter,
    overrideAccess: true,
  })

  const properties = await payload.find({
    collection: 'properties',
    depth: 1,
    limit: 500,
    where: agentFilter,
    overrideAccess: true,
  })

  const enquiries = await payload.count({
    collection: 'enquiries',
    where: agentFilter,
    overrideAccess: true,
  })

  return (
    <main className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Agency Team</p>

            <h1 className="mt-2 text-5xl font-medium tracking-tight">Agents</h1>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              Manage your agency team and public agent profiles.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="border bg-white px-4 py-2 text-sm">
              Back
            </Link>

            <Link
              href="/admin/collections/agents/create"
              className="bg-black px-4 py-2 text-sm text-white"
            >
              Add Agent
            </Link>
          </div>
        </div>

        <section className="grid gap-3 md:grid-cols-3">
          <StatCard title="Total Agents" value={agents.totalDocs} />
          <StatCard title="Active Listings" value={properties.totalDocs} />
          <StatCard title="Total Enquiries" value={enquiries.totalDocs} />
        </section>

        <section className="mt-12 overflow-hidden border bg-white">
          <div className="grid gap-4 border-b bg-neutral-50 p-5 text-sm uppercase tracking-[0.2em] text-muted-foreground md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
            <p>Agent</p>
            <p>Job Title</p>
            <p>Email</p>
            <p>Phone</p>
            <p className="text-right">Actions</p>
          </div>

          <div className="divide-y">
            {agents.docs.map((agent: any) => {
              const photo =
                typeof agent.photo === 'object' && agent.photo?.url ? agent.photo.url : null

              return (
                <div
                  key={agent.id}
                  className="grid gap-4 p-5 hover:bg-neutral-50 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden bg-neutral-100">
                      {photo ? (
                        <img src={photo} alt={agent.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg font-medium">
                          {String(agent.name || '?').charAt(0)}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="font-medium">{agent.name}</p>

                      <p className="mt-1 text-sm text-muted-foreground">{agent.slug}</p>
                    </div>
                  </div>

                  <p>{agent.jobTitle || '-'}</p>

                  <p className="break-all text-sm text-muted-foreground">{agent.email || '-'}</p>

                  <p>{agent.phone || '-'}</p>

                  <div className="flex justify-end gap-2">
                    <Link href={`/agent/${agent.slug}`} className="border px-3 py-2 text-sm">
                      View
                    </Link>

                    <Link
                      href={`/admin/collections/agents/${agent.id}`}
                      className="border px-3 py-2 text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              )
            })}

            {agents.docs.length === 0 && (
              <div className="p-10 text-center text-muted-foreground">No agents found.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="border bg-white p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <p className="mt-4 text-5xl font-medium">{value}</p>
    </div>
  )
}
