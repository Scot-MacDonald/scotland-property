import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import { getActivityRelationMap, type ActivityEntityType } from '@/lib/activity'
import type { Activity } from '@/payload-types'

import { TimelineView } from './TimelineView'

type TimelineEntity = {
  entityType: ActivityEntityType
  entityId: string
}

type TimelineProps =
  | {
      entityType: ActivityEntityType
      entityId: string
      entities?: never
      limit?: number
    }
  | {
      entityType?: never
      entityId?: never
      entities: TimelineEntity[]
      limit?: number
    }

function createEntityCondition(entity: TimelineEntity): Where {
  return {
    and: [
      {
        entityType: {
          equals: entity.entityType,
        },
      },
      {
        entityId: {
          equals: entity.entityId,
        },
      },
    ],
  }
}

function getTimelineEntities(props: TimelineProps): TimelineEntity[] {
  const entities =
    'entities' in props && props.entities
      ? props.entities
      : [
          {
            entityType: props.entityType,
            entityId: props.entityId,
          },
        ]

  const uniqueEntities = new Map<string, TimelineEntity>()

  for (const entity of entities) {
    const key = `${entity.entityType}:${entity.entityId}`

    uniqueEntities.set(key, entity)
  }

  return Array.from(uniqueEntities.values())
}

export async function Timeline(props: TimelineProps) {
  const { limit = 50 } = props
  const entities = getTimelineEntities(props)

  if (entities.length === 0) {
    return <TimelineView activities={[]} relationMap={{}} />
  }

  const payload = await getPayload({
    config: configPromise,
  })

  const where: Where =
    entities.length === 1
      ? createEntityCondition(entities[0])
      : {
          or: entities.map(createEntityCondition),
        }

  const result = await payload.find({
    collection: 'activities',
    depth: 1,
    limit,
    sort: '-createdAt',
    overrideAccess: true,
    where,
  })

  const activities = result.docs as Activity[]
  const relationMap = await getActivityRelationMap(payload, activities)

  return <TimelineView activities={activities} relationMap={relationMap} />
}
