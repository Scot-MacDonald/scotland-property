import { ActivityEntityTypes, type ActivityEntityType } from './activityEntityTypes'

type GetActivityHrefArgs = {
  entityType: ActivityEntityType
  entityId: string
}

export function getActivityHref({ entityType, entityId }: GetActivityHrefArgs): string | null {
  switch (entityType) {
    case ActivityEntityTypes.PROPERTY:
      return `/dashboard/properties/${entityId}`

    case ActivityEntityTypes.VIEWING:
      return `/dashboard/viewings/${entityId}`

    case ActivityEntityTypes.TASK:
      return `/dashboard/tasks/${entityId}`

    case ActivityEntityTypes.ENQUIRY:
      return `/dashboard/enquiries/${entityId}`

    case ActivityEntityTypes.LEAD:
      return `/dashboard/leads/${entityId}`

    case ActivityEntityTypes.BUYER:
      return `/dashboard/buyers/${entityId}`

    case ActivityEntityTypes.AGENT:
      return `/dashboard/agents/${entityId}`

    case ActivityEntityTypes.OFFER:
      return `/dashboard/offers/${entityId}`

    case ActivityEntityTypes.AGENCY:
      return `/dashboard/settings`

    default:
      return null
  }
}
