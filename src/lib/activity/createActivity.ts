import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { ActivityType } from './activityTypes'

export type ActivitySeverity = 'info' | 'success' | 'warning' | 'error'

export type CreateActivityArgs = {
  type: ActivityType

  title: string

  description?: string

  severity?: ActivitySeverity

  entityType: 'property' | 'enquiry' | 'lead' | 'viewing' | 'offer' | 'buyer' | 'agent' | 'agency'

  entityId: string

  agency: string

  user?: string

  metadata?: Record<string, unknown>
}

export async function createActivity({
  type,
  title,
  description,
  severity = 'info',
  entityType,
  entityId,
  agency,
  user,
  metadata,
}: CreateActivityArgs) {
  const payload = await getPayload({
    config: configPromise,
  })

  return payload.create({
    collection: 'activities',

    overrideAccess: true,

    data: {
      type,
      title,
      description,
      severity,
      entityType,
      entityId,
      agency,
      user,
      metadata,
    },
  })
}
