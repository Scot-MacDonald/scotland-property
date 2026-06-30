import Link from 'next/link'

function getDaysRemaining(value?: string | null) {
  if (!value) return null

  const now = new Date()
  const trialEnd = new Date(value)

  const diff = trialEnd.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function TrialStatusCard({
  subscriptionStatus,
  trialEndsAt,
}: {
  subscriptionStatus?: string | null
  trialEndsAt?: string | null
}) {
  const daysRemaining = getDaysRemaining(trialEndsAt)

  if (subscriptionStatus === 'active') {
    return (
      <div className="mb-10 border bg-green-50 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-green-800">Subscription Active</p>

        <p className="mt-2 text-2xl font-medium">Your agency subscription is active.</p>
      </div>
    )
  }

  if (subscriptionStatus === 'cancelled') {
    return (
      <div className="mb-10 border bg-red-50 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-red-800">Subscription Cancelled</p>

        <p className="mt-2 text-2xl font-medium">Your agency subscription has been cancelled.</p>

        <Link href="/dashboard/billing" className="mt-4 inline-block border px-4 py-2 text-sm">
          Upgrade Now
        </Link>
      </div>
    )
  }

  if (subscriptionStatus === 'trial') {
    if (daysRemaining === null || daysRemaining <= 0) {
      return null
    }

    return (
      <div className="mb-10 border bg-yellow-50 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-yellow-800">Free Trial</p>

        <p className="mt-2 text-2xl font-medium">
          {daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining in your free trial.
        </p>

        <Link href="/dashboard/billing" className="mt-4 inline-block border px-4 py-2 text-sm">
          Upgrade Now
        </Link>
      </div>
    )
  }

  return null
}
