import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { Timeline } from '@/components/DashboardV2/Timeline'
import { ActivityEntityTypes, type ActivityEntityType } from '@/lib/activity'

type HistoryTabProps = {
  propertyId: string
}

type TimelineEntity = {
  entityType: ActivityEntityType
  entityId: string
}

export async function HistoryTab({ propertyId }: HistoryTabProps) {
  const payload = await getPayload({
    config: configPromise,
  })

  const [offersResult, viewingsResult, enquiriesResult, tasksResult] = await Promise.all([
    payload.find({
      collection: 'offers',
      depth: 0,
      limit: 500,
      pagination: false,
      overrideAccess: true,
      where: {
        property: {
          equals: propertyId,
        },
      },
    }),

    payload.find({
      collection: 'viewings',
      depth: 0,
      limit: 500,
      pagination: false,
      overrideAccess: true,
      where: {
        property: {
          equals: propertyId,
        },
      },
    }),

    payload.find({
      collection: 'enquiries',
      depth: 0,
      limit: 500,
      pagination: false,
      overrideAccess: true,
      where: {
        property: {
          equals: propertyId,
        },
      },
    }),

    payload.find({
      collection: 'tasks',
      depth: 0,
      limit: 500,
      pagination: false,
      overrideAccess: true,
      where: {
        property: {
          equals: propertyId,
        },
      },
    }),
  ])

  const entities: TimelineEntity[] = [
    {
      entityType: ActivityEntityTypes.PROPERTY,
      entityId: propertyId,
    },

    ...offersResult.docs.map((offer) => ({
      entityType: ActivityEntityTypes.OFFER,
      entityId: String(offer.id),
    })),

    ...viewingsResult.docs.map((viewing) => ({
      entityType: ActivityEntityTypes.VIEWING,
      entityId: String(viewing.id),
    })),

    ...enquiriesResult.docs.map((enquiry) => ({
      entityType: ActivityEntityTypes.ENQUIRY,
      entityId: String(enquiry.id),
    })),

    ...tasksResult.docs.map((task) => ({
      entityType: ActivityEntityTypes.TASK,
      entityId: String(task.id),
    })),
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-950">Property timeline</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Property updates, enquiries, viewings, offers and tasks are shown together in
          chronological order.
        </p>
      </div>

      <Timeline entities={entities} limit={100} />
    </div>
  )
}
