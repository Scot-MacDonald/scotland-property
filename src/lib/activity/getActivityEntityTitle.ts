import { ActivityEntityTypes, type ActivityEntityType } from './activityEntityTypes'

type ActivityEntityRecord = Record<string, unknown>

function getStringValue(record: ActivityEntityRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return null
}

export function getActivityEntityTitle(
  entityType: ActivityEntityType,
  record: ActivityEntityRecord,
): string {
  switch (entityType) {
    case ActivityEntityTypes.PROPERTY:
      return getStringValue(record, ['title', 'reference']) || 'Property'

    case ActivityEntityTypes.VIEWING:
      return getStringValue(record, ['title', 'reference']) || 'Viewing'

    case ActivityEntityTypes.ENQUIRY:
      return getStringValue(record, ['name', 'email']) || 'Enquiry'

    case ActivityEntityTypes.LEAD:
      return getStringValue(record, ['name', 'postcode']) || 'Valuation lead'

    case ActivityEntityTypes.BUYER:
      return getStringValue(record, ['name', 'email']) || 'Buyer'

    case ActivityEntityTypes.AGENT:
      return getStringValue(record, ['name', 'email']) || 'Agent'

    case ActivityEntityTypes.OFFER:
      return getStringValue(record, ['reference', 'title']) || 'Offer'

    case ActivityEntityTypes.AGENCY:
      return getStringValue(record, ['name']) || 'Agency'

    default:
      return 'Record'
  }
}
