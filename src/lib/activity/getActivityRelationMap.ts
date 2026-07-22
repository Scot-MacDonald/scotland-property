import type { Payload } from 'payload'

import type { Activity } from '@/payload-types'

import { ActivityEntityTypes, type ActivityEntityType } from './activityEntityTypes'
import { getActivityEntityTitle } from './getActivityEntityTitle'
import { getActivityHref } from './getActivityHref'

export type ActivityRelation = {
  title: string
  subtitle?: string
  href: string | null
}

export type ActivityRelationMap = Record<string, ActivityRelation>

type ActivityEntityRecord = Record<string, unknown>

type RelationshipRecord = {
  id?: string | number | null
  title?: string | null
  reference?: string | null
}

function getRelationKey(entityType: string, entityId: string) {
  return `${entityType}:${entityId}`
}

function getUniqueEntityIds(activities: Activity[], entityType: ActivityEntityType) {
  return Array.from(
    new Set(
      activities
        .filter((activity) => activity.entityType === entityType)
        .map((activity) => activity.entityId)
        .filter((entityId): entityId is string => Boolean(entityId)),
    ),
  )
}

function getEntitySubtitle(entityType: ActivityEntityType) {
  switch (entityType) {
    case ActivityEntityTypes.PROPERTY:
      return 'Property'

    case ActivityEntityTypes.VIEWING:
      return 'Viewing'

    case ActivityEntityTypes.ENQUIRY:
      return 'Enquiry'

    case ActivityEntityTypes.LEAD:
      return 'Valuation lead'

    case ActivityEntityTypes.BUYER:
      return 'Buyer'

    case ActivityEntityTypes.AGENT:
      return 'Agent'

    case ActivityEntityTypes.AGENCY:
      return 'Agency'

    case ActivityEntityTypes.OFFER:
      return 'Offer'

    default:
      return undefined
  }
}

function getViewingPropertyTitle(record: ActivityEntityRecord) {
  const property = record.property

  if (!property || typeof property !== 'object') {
    return null
  }

  const relatedProperty = property as RelationshipRecord

  if (typeof relatedProperty.title === 'string' && relatedProperty.title.trim()) {
    return relatedProperty.title.trim()
  }

  if (typeof relatedProperty.reference === 'string' && relatedProperty.reference.trim()) {
    return relatedProperty.reference.trim()
  }

  return null
}

function getRelationTitle(entityType: ActivityEntityType, record: ActivityEntityRecord) {
  if (entityType === ActivityEntityTypes.VIEWING) {
    return getViewingPropertyTitle(record) || getActivityEntityTitle(entityType, record)
  }

  return getActivityEntityTitle(entityType, record)
}

async function addRelations({
  payload,
  relationMap,
  entityType,
  collection,
  entityIds,
}: {
  payload: Payload
  relationMap: ActivityRelationMap
  entityType: ActivityEntityType
  collection:
    | 'properties'
    | 'viewings'
    | 'enquiries'
    | 'valuation-leads'
    | 'buyers'
    | 'agents'
    | 'agencies'
  entityIds: string[]
}) {
  if (entityIds.length === 0) {
    return
  }

  const result = await payload.find({
    collection,
    depth: 1,
    limit: entityIds.length,
    pagination: false,
    where: {
      id: {
        in: entityIds,
      },
    },
  })

  for (const record of result.docs) {
    const entityId = String(record.id)
    const entityRecord = record as unknown as ActivityEntityRecord

    relationMap[getRelationKey(entityType, entityId)] = {
      title: getRelationTitle(entityType, entityRecord),
      subtitle: getEntitySubtitle(entityType),
      href: getActivityHref({
        entityType,
        entityId,
      }),
    }
  }
}

export async function getActivityRelationMap(
  payload: Payload,
  activities: Activity[],
): Promise<ActivityRelationMap> {
  const relationMap: ActivityRelationMap = {}

  await Promise.all([
    addRelations({
      payload,
      relationMap,
      entityType: ActivityEntityTypes.PROPERTY,
      collection: 'properties',
      entityIds: getUniqueEntityIds(activities, ActivityEntityTypes.PROPERTY),
    }),

    addRelations({
      payload,
      relationMap,
      entityType: ActivityEntityTypes.VIEWING,
      collection: 'viewings',
      entityIds: getUniqueEntityIds(activities, ActivityEntityTypes.VIEWING),
    }),

    addRelations({
      payload,
      relationMap,
      entityType: ActivityEntityTypes.ENQUIRY,
      collection: 'enquiries',
      entityIds: getUniqueEntityIds(activities, ActivityEntityTypes.ENQUIRY),
    }),

    addRelations({
      payload,
      relationMap,
      entityType: ActivityEntityTypes.LEAD,
      collection: 'valuation-leads',
      entityIds: getUniqueEntityIds(activities, ActivityEntityTypes.LEAD),
    }),

    addRelations({
      payload,
      relationMap,
      entityType: ActivityEntityTypes.BUYER,
      collection: 'buyers',
      entityIds: getUniqueEntityIds(activities, ActivityEntityTypes.BUYER),
    }),

    addRelations({
      payload,
      relationMap,
      entityType: ActivityEntityTypes.AGENT,
      collection: 'agents',
      entityIds: getUniqueEntityIds(activities, ActivityEntityTypes.AGENT),
    }),

    addRelations({
      payload,
      relationMap,
      entityType: ActivityEntityTypes.AGENCY,
      collection: 'agencies',
      entityIds: getUniqueEntityIds(activities, ActivityEntityTypes.AGENCY),
    }),
  ])

  return relationMap
}
