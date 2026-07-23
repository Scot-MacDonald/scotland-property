import Link from 'next/link'
import {
  BadgePoundSterling,
  Building2,
  Eye,
  Home,
  Mail,
  Phone,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'

import type { ActivityRelation } from '@/lib/activity'
import type { Activity } from '@/payload-types'

export type ActivityFeedItem = {
  activity: Activity
  relation?: ActivityRelation
}

type ActivityCardProps = {
  item: ActivityFeedItem
}

type RelationshipValue =
  | string
  | number
  | {
      id?: string | number | null
      name?: string | null
      email?: string | null
    }
  | null
  | undefined

function getActorName(user: RelationshipValue) {
  if (!user || typeof user !== 'object') {
    return null
  }

  return user.name || user.email || null
}

function getEntityIcon(entityType?: string | null): LucideIcon {
  switch (entityType) {
    case 'property':
      return Home

    case 'viewing':
      return Eye

    case 'offer':
      return BadgePoundSterling

    case 'lead':
      return Phone

    case 'enquiry':
      return Mail

    case 'buyer':
      return User

    case 'agent':
      return Users

    case 'agency':
      return Building2

    default:
      return Building2
  }
}

function formatRelativeTime(value: string) {
  const date = new Date(value)
  const now = new Date()

  const differenceInSeconds = Math.round((date.getTime() - now.getTime()) / 1000)

  const formatter = new Intl.RelativeTimeFormat('en-GB', {
    numeric: 'auto',
  })

  const absoluteSeconds = Math.abs(differenceInSeconds)

  if (absoluteSeconds < 60) {
    return formatter.format(differenceInSeconds, 'second')
  }

  const differenceInMinutes = Math.round(differenceInSeconds / 60)

  if (Math.abs(differenceInMinutes) < 60) {
    return formatter.format(differenceInMinutes, 'minute')
  }

  const differenceInHours = Math.round(differenceInMinutes / 60)

  if (Math.abs(differenceInHours) < 24) {
    return formatter.format(differenceInHours, 'hour')
  }

  const differenceInDays = Math.round(differenceInHours / 24)

  if (Math.abs(differenceInDays) < 7) {
    return formatter.format(differenceInDays, 'day')
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  })
}

function ActivityCardContent({
  activity,
  relation,
}: {
  activity: Activity
  relation?: ActivityRelation
}) {
  const Icon = getEntityIcon(activity.entityType)
  const actorName = getActorName(activity.user as RelationshipValue)

  function shouldShowDescription(activity: Activity) {
    const description = activity.description?.trim()

    if (!description) {
      return false
    }

    const hiddenDescriptions = new Set([
      'Viewer feedback was updated.',
      'Internal viewing notes were updated.',
      'Viewer notes were updated.',
      'Property was updated.',
      'Viewing was updated.',
      'Enquiry was updated.',
      'Valuation lead was updated.',
      'Buyer was updated.',
      'Agent was updated.',
    ])

    return !hiddenDescriptions.has(description)
  }

  return (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
        <Icon aria-hidden="true" className="h-5 w-5 text-neutral-700" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-neutral-950">{activity.title}</h3>

            {relation ? (
              <div className="mt-1.5">
                <p className="text-base font-semibold leading-6 text-neutral-900">
                  {relation.title}
                </p>

                {relation.subtitle ? (
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                    {relation.subtitle}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <time
            className="shrink-0 text-sm text-neutral-500"
            dateTime={activity.createdAt}
            title={new Date(activity.createdAt).toLocaleString('en-GB')}
          >
            {formatRelativeTime(activity.createdAt)}
          </time>
        </div>

        {shouldShowDescription(activity) ? (
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-neutral-600">
            {activity.description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500">
          <span>{actorName || 'System'}</span>
        </div>

        {relation?.href ? (
          <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 transition group-hover:text-neutral-950">
            Open {activity.entityType.replaceAll('-', ' ')}
          </span>
        ) : null}
      </div>
    </>
  )
}

export function ActivityCard({ item }: ActivityCardProps) {
  const { activity, relation } = item

  const className =
    'group flex gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition duration-200 hover:border-neutral-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2'

  if (relation?.href) {
    return (
      <Link
        href={relation.href}
        className={className}
        aria-label={`Open ${activity.entityType}: ${relation.title}`}
      >
        <ActivityCardContent activity={activity} relation={relation} />
      </Link>
    )
  }

  return (
    <article className={className}>
      <ActivityCardContent activity={activity} relation={relation} />
    </article>
  )
}
