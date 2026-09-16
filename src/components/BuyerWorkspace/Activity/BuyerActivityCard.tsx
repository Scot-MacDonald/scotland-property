import Link from 'next/link'

import type { Activity } from '@/payload-types'

import type { BuyerActivityProperty } from './types'

type BuyerActivityCardProps = {
  activity: Activity
  property?: BuyerActivityProperty
}

function getRelativeTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Recently'
  }

  const differenceInSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat('en-GB', {
    numeric: 'auto',
  })

  const absoluteSeconds = Math.abs(differenceInSeconds)

  if (absoluteSeconds < 60) {
    return formatter.format(differenceInSeconds, 'second')
  }

  const minutes = Math.round(differenceInSeconds / 60)

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, 'minute')
  }

  const hours = Math.round(minutes / 60)

  if (Math.abs(hours) < 24) {
    return formatter.format(hours, 'hour')
  }

  const days = Math.round(hours / 24)

  if (Math.abs(days) < 7) {
    return formatter.format(days, 'day')
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  })
}

function getActivityLabel(type: string) {
  switch (type) {
    case 'buyer-property-viewed':
      return 'Viewed'

    case 'buyer-property-saved':
      return 'Saved'

    case 'buyer-property-removed':
      return 'Removed'

    case 'buyer-updated':
      return 'Account'

    case 'buyer-registered':
      return 'Account'

    default:
      return 'Activity'
  }
}

function getTone(type: string) {
  switch (type) {
    case 'buyer-property-saved':
      return 'bg-emerald-50 text-emerald-700'

    case 'buyer-property-removed':
      return 'bg-neutral-100 text-neutral-600'

    case 'buyer-property-viewed':
      return 'bg-blue-50 text-blue-700'

    default:
      return 'bg-black text-white'
  }
}

function ActivityContent({
  activity,
  property,
}: {
  activity: Activity
  property?: BuyerActivityProperty
}) {
  return (
    <>
      <div
        className={[
          'flex h-11 w-11 shrink-0 items-center justify-center text-xs font-semibold uppercase tracking-[0.12em]',
          getTone(activity.type),
        ].join(' ')}
      >
        {getActivityLabel(activity.type).slice(0, 1)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
              {getActivityLabel(activity.type)}
            </p>

            <h3 className="mt-2 text-lg font-medium text-black">{activity.title}</h3>

            {property ? (
              <p className="mt-1 text-base font-medium text-black/75">{property.title}</p>
            ) : null}
          </div>

          <time
            dateTime={activity.createdAt}
            title={new Date(activity.createdAt).toLocaleString('en-GB')}
            className="shrink-0 text-sm text-black/45"
            suppressHydrationWarning
          >
            {getRelativeTime(activity.createdAt)}
          </time>
        </div>

        {activity.description ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-black/55">{activity.description}</p>
        ) : null}

        {property?.slug ? (
          <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-black/65">
            View property →
          </span>
        ) : null}
      </div>
    </>
  )
}

export function BuyerActivityCard({ activity, property }: BuyerActivityCardProps) {
  const className =
    'flex gap-4 border border-black/10 bg-white p-5 transition hover:border-black/25'

  if (property?.slug) {
    return (
      <Link
        href={`/property/${property.slug}`}
        className={className}
        aria-label={`View ${property.title}`}
      >
        <ActivityContent activity={activity} property={property} />
      </Link>
    )
  }

  return (
    <article className={className}>
      <ActivityContent activity={activity} property={property} />
    </article>
  )
}
