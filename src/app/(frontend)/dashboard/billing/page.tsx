import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

function formatDate(value?: string | null) {
  if (!value) return 'Not set'

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getDaysRemaining(value?: string | null) {
  if (!value) return null

  const diff = new Date(value).getTime() - new Date().getTime()

  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const plans = [
  {
    name: 'Starter',
    price: '£99/month',
    description: 'For small agencies testing the platform.',
    features: [
      '25 active listings',
      'Agency dashboard',
      'Buyer enquiries',
      'Seller valuation leads',
    ],
  },
  {
    name: 'Professional',
    price: '£199/month',
    description: 'For growing agencies with regular stock.',
    features: [
      'Unlimited listings',
      'CRM feed imports',
      'Analytics dashboard',
      'Buyer and seller pipelines',
    ],
  },
  {
    name: 'Premium',
    price: '£399/month',
    description: 'For premium agencies wanting maximum exposure.',
    features: [
      'Everything in Professional',
      'Featured agency placement',
      'Priority support',
      'Advanced launch support',
    ],
  },
]

export default async function BillingPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/admin/login')
  }

  if (user.collection !== 'users') {
    redirect('/login')
  }

  const userAsAny = user as any
  const isSuperAdmin = userAsAny.role === 'super-admin'
  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  const agencies = await payload.find({
    collection: 'agencies',
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

  if (!agency) {
    redirect('/dashboard')
  }

  const daysRemaining = getDaysRemaining(agency.trialEndsAt)

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-16 md:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Billing</p>

          <h1 className="mt-2 text-5xl font-medium tracking-tight">Subscription & Plans</h1>

          <p className="mt-4 max-w-2xl text-muted-foreground">
            Manage your agency subscription and choose the right plan for your listings.
          </p>
        </div>

        <Link href="/dashboard" className="border px-4 py-2 text-sm">
          Back to Dashboard
        </Link>
      </div>

      <section className="mb-12 border p-8">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
          Current Subscription
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <BillingStat title="Agency" value={agency.name} />
          <BillingStat title="Plan" value={agency.subscriptionPlan || 'starter'} />
          <BillingStat title="Status" value={agency.subscriptionStatus || 'trial'} />
          <BillingStat title="Trial Ends" value={formatDate(agency.trialEndsAt)} />
        </div>

        {agency.subscriptionStatus === 'trial' && (
          <div className="mt-8 border bg-yellow-50 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-800">Free Trial</p>

            <p className="mt-2 text-2xl font-medium">
              {daysRemaining !== null && daysRemaining > 0
                ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining in your free trial.`
                : 'Your free trial has ended.'}
            </p>
          </div>
        )}
      </section>

      <section>
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Choose Plan</p>

          <h2 className="mt-2 text-3xl font-medium">Upgrade your agency account</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="flex flex-col border p-8">
              <div>
                <h3 className="text-3xl font-medium">{plan.name}</h3>

                <p className="mt-3 text-2xl">{plan.price}</p>

                <p className="mt-4 text-sm text-muted-foreground">{plan.description}</p>

                <ul className="mt-8 space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                disabled
                className="mt-8 bg-black px-5 py-4 text-sm font-medium text-white disabled:opacity-50"
              >
                Stripe coming next
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

function BillingStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="border p-5">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{title}</p>

      <p className="mt-3 text-xl font-medium capitalize">{value}</p>
    </div>
  )
}
