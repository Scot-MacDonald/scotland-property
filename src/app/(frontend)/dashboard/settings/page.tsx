import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardSettingsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/admin/login')
  if (user.collection !== 'users') redirect('/login')

  const userAsAny = user as any
  const isSuperAdmin = userAsAny.role === 'super-admin'
  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  const agencies = await payload.find({
    collection: 'agencies',
    depth: 2,
    limit: 1,
    where:
      !isSuperAdmin && agencyId
        ? {
            id: {
              equals: agencyId,
            },
          }
        : undefined,
    overrideAccess: true,
  })

  const agency = agencies.docs[0] as any

  if (!agency) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Agency Settings
            </p>

            <h1 className="mt-2 text-5xl font-medium tracking-tight">Settings</h1>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              Manage your agency profile, contact details, CRM feed and coverage.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="border bg-white px-4 py-2 text-sm">
              Back
            </Link>

            <Link href="/dashboard/settings/edit" className="bg-black px-4 py-2 text-sm text-white">
              Edit Settings
            </Link>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <SettingsPanel title="Agency Details">
            <SettingRow label="Agency Name" value={agency.name} />
            <SettingRow label="Email" value={agency.email} />
            <SettingRow label="Phone" value={agency.phone} />
            <SettingRow label="Website" value={agency.website} />
          </SettingsPanel>

          <SettingsPanel title="Subscription">
            <SettingRow label="Plan" value={agency.subscriptionPlan || 'starter'} />
            <SettingRow label="Status" value={agency.subscriptionStatus || 'trial'} />
            <SettingRow
              label="Trial Ends"
              value={
                agency.trialEndsAt
                  ? new Date(agency.trialEndsAt).toLocaleDateString('en-GB')
                  : 'Not set'
              }
            />
            <SettingRow label="Stripe Customer" value={agency.stripeCustomerId} />
          </SettingsPanel>

          <SettingsPanel title="Office Address">
            <SettingRow label="Street" value={agency.address?.street} />
            <SettingRow label="Town / City" value={agency.address?.city} />
            <SettingRow label="Postcode" value={agency.address?.postcode} />
            <SettingRow label="Country" value={agency.address?.country} />
          </SettingsPanel>

          <SettingsPanel title="CRM Feed">
            <SettingRow label="Enabled" value={agency.crm?.enabled ? 'Yes' : 'No'} />
            <SettingRow label="Type" value={agency.crm?.type} />
            <SettingRow label="Feed URL" value={agency.crm?.feedUrl} />
          </SettingsPanel>

          <SettingsPanel title="Coverage">
            {agency.coveragePostcodes?.length ? (
              <div className="flex flex-wrap gap-2">
                {agency.coveragePostcodes.map((item: any, index: number) => (
                  <span key={index} className="border bg-white px-3 py-2 text-sm">
                    {item.postcode}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No coverage postcodes set.</p>
            )}
          </SettingsPanel>

          <SettingsPanel title="Public Profile">
            <SettingRow label="Slug" value={agency.slug} />
            <SettingRow label="Featured" value={agency.featured ? 'Yes' : 'No'} />

            <div className="mt-6">
              <Link href={`/agency/${agency.slug}`} className="border bg-white px-4 py-2 text-sm">
                View Public Agency Page
              </Link>
            </div>
          </SettingsPanel>
        </section>
      </div>
    </main>
  )
}

function SettingsPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border bg-white p-8">
      <h2 className="text-2xl font-medium">{title}</h2>

      <div className="mt-6 space-y-4">{children}</div>
    </section>
  )
}

function SettingRow({ label, value }: { label: string; value?: any }) {
  const displayValue =
    value && typeof value === 'object' ? Object.values(value).filter(Boolean).join(', ') : value

  return (
    <div className="border-b pb-4 last:border-b-0 last:pb-0">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{label}</p>

      <p className="mt-2 break-words font-medium">{displayValue || 'Not set'}</p>
    </div>
  )
}
