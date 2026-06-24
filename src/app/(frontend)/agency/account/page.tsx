import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'

async function getAgencyStats() {
  const res = await fetch('http://localhost:3000/api/agency-stats', {
    cache: 'no-store',
  })

  if (!res.ok) return null

  return res.json()
}

function isAgencyUser(user: any) {
  return user?.role === 'agency-admin' || user?.role === 'agent' || user?.role === 'super-admin'
}

export default async function AgencyAccountPage() {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!isAgencyUser(user)) {
    return (
      <main className="mx-auto max-w-[800px] px-4 py-16">
        <h1 className="text-3xl font-medium">Please log in</h1>

        <p className="mt-4 text-muted-foreground">
          Sign in with your agency account to view your dashboard.
        </p>

        <Link href="/agency/login" className="mt-6 inline-block bg-black px-6 py-3 text-white">
          Agency Login
        </Link>
      </main>
    )
  }

  const stats = await getAgencyStats()

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-16 md:px-8">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
          Agency Dashboard
        </p>

        <h1 className="mt-2 text-5xl font-medium tracking-tight">Performance overview</h1>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Track valuation leads, booked valuations and instructions won.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="Leads This Month" value={stats?.leadsThisMonth ?? 0} />
        <StatCard label="New Leads" value={stats?.newLeads ?? 0} />
        <StatCard label="Valuations Booked" value={stats?.valuationsBooked ?? 0} />
        <StatCard label="Instructions Won" value={stats?.instructionsWon ?? 0} />
        <StatCard label="Conversion Rate" value={`${stats?.conversionRate ?? 0}%`} />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/agency/account/leads" className="bg-black px-6 py-3 text-white">
          View valuation leads
        </Link>

        <Link href="/agency/account/properties" className="border px-6 py-3">
          View my properties
        </Link>

        <Link href="/admin/collections/properties" className="border px-6 py-3">
          Manage properties
        </Link>

        <Link href="/admin/collections/agencies" className="border px-6 py-3">
          Agency settings
        </Link>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-neutral-200 bg-white p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-4 text-4xl font-semibold">{value}</p>
    </div>
  )
}
