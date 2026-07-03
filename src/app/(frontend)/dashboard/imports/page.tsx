import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ImportsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user) {
    redirect('/admin/login')
  }

  if (user.collection !== 'users') {
    redirect('/login')
  }

  const userAsAny = user as any
  const isSuperAdmin = userAsAny.role === 'super-admin'

  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  let agencyName: string | null = null

  if (!isSuperAdmin && agencyId) {
    const agency = await payload.findByID({
      collection: 'agencies',
      id: agencyId,
      overrideAccess: true,
    })

    agencyName = agency?.name || null
  }

  const where =
    !isSuperAdmin && agencyName
      ? {
          agencyName: {
            equals: agencyName,
          },
        }
      : {}

  const importLogs = await payload.find({
    collection: 'import-logs',
    depth: 1,
    limit: 100,
    sort: '-createdAt',
    where,
    overrideAccess: true,
  })

  const successfulImports = importLogs.docs.filter((log: any) => log.status === 'success').length

  const failedImports = importLogs.docs.filter((log: any) => log.status === 'failed').length

  const totalCreated = importLogs.docs.reduce(
    (total: number, log: any) => total + (log.created || 0),
    0,
  )

  return (
    <main className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">CRM Imports</p>

            <h1 className="mt-2 text-5xl font-medium tracking-tight">Feed Imports</h1>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              Review automated feed imports and monitor CRM activity.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="border bg-white px-4 py-2 text-sm">
              Back
            </Link>

            <Link
              href="/api/run-agency-import"
              className="border bg-black px-4 py-2 text-sm text-white"
            >
              Run Import
            </Link>
          </div>
        </div>

        <section className="grid gap-3 md:grid-cols-4">
          <StatCard title="Total Imports" value={importLogs.totalDocs} />

          <StatCard title="Successful" value={successfulImports} />

          <StatCard title="Failed" value={failedImports} />

          <StatCard title="Properties Created" value={totalCreated} />
        </section>

        <section className="mt-12 overflow-hidden border bg-white">
          <div className="grid gap-4 border-b bg-neutral-50 p-5 text-sm uppercase tracking-[0.2em] text-muted-foreground md:grid-cols-[1fr_1fr_1fr_1fr_2fr]">
            <p>Agency</p>
            <p>Status</p>
            <p>Created</p>
            <p>Date</p>
            <p>Message</p>
          </div>

          <div className="divide-y">
            {importLogs.docs.map((log: any) => (
              <div
                key={log.id}
                className="grid gap-4 p-5 hover:bg-neutral-50 md:grid-cols-[1fr_1fr_1fr_1fr_2fr]"
              >
                <p className="font-medium">{log.agencyName || 'Unknown'}</p>

                <p className="capitalize">{log.status || '-'}</p>

                <p>{log.created || 0}</p>

                <p className="text-sm text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString('en-GB')}
                </p>

                <p className="text-sm text-muted-foreground">{log.message || '-'}</p>
              </div>
            ))}

            {importLogs.docs.length === 0 && (
              <div className="p-10 text-center text-muted-foreground">No import logs found.</div>
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
