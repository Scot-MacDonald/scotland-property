import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AgencySettingsForm } from '@/components/AgencySettingsForm'

export default async function EditAgencySettingsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/admin/login')
  if (user.collection !== 'users') redirect('/login')

  const userAsAny = user as any
  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  if (!agencyId) redirect('/dashboard')

  const agency = await payload.findByID({
    collection: 'agencies',
    id: agencyId,
    depth: 2,
    overrideAccess: true,
  })

  if (!agency) redirect('/dashboard/settings')

  return (
    <main className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Agency Settings
            </p>

            <h1 className="mt-2 text-5xl font-medium tracking-tight">Edit Settings</h1>
          </div>

          <Link href="/dashboard/settings" className="border bg-white px-4 py-2 text-sm">
            Back
          </Link>
        </div>

        <AgencySettingsForm agency={agency} />
      </div>
    </main>
  )
}
