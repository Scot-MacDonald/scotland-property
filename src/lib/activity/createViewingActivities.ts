import {
  ActivityEntityTypes,
  ActivitySeverities,
  ActivityTypes,
  createActivity,
} from '@/lib/activity'

function formatStatus(status: string | null | undefined) {
  if (!status) return 'Unknown'

  return status
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDateTime(value: unknown) {
  if (!value) return 'Unknown'

  const date = new Date(String(value))

  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

type Args = {
  previousViewing: any
  viewing: any
  changedFields: string[]
  agencyId: string
  userId: string
}

export async function createViewingActivities({
  previousViewing,
  viewing,
  changedFields,
  agencyId,
  userId,
}: Args) {
  const create = (title: string, description: string, metadata: Record<string, unknown> = {}) =>
    createActivity({
      type: ActivityTypes.VIEWING_UPDATED,
      title,
      description,
      severity: ActivitySeverities.INFO,
      entityType: ActivityEntityTypes.VIEWING,
      entityId: String(viewing.id),
      agency: agencyId,
      user: userId,
      metadata,
    })

  if (changedFields.includes('status')) {
    await create(
      'Viewing status changed',
      `${formatStatus(previousViewing.status)} → ${formatStatus(viewing.status)}`,
      {
        previousStatus: previousViewing.status,
        newStatus: viewing.status,
      },
    )
  }

  if (changedFields.includes('dateTime')) {
    await create(
      'Viewing rescheduled',
      `${formatDateTime(previousViewing.dateTime)} → ${formatDateTime(viewing.dateTime)}`,
      {
        previousDateTime: previousViewing.dateTime,
        newDateTime: viewing.dateTime,
      },
    )
  }

  if (changedFields.includes('durationMinutes')) {
    await create(
      'Viewing duration changed',
      `${previousViewing.durationMinutes ?? 'Unknown'} minutes → ${
        viewing.durationMinutes ?? 'Unknown'
      } minutes`,
      {
        previousDurationMinutes: previousViewing.durationMinutes,
        newDurationMinutes: viewing.durationMinutes,
      },
    )
  }

  if (changedFields.includes('agent')) {
    await create('Assigned agent changed', 'The assigned agent was updated.', {
      previousAgent: previousViewing.agent,
      newAgent: viewing.agent,
    })
  }

  if (changedFields.includes('internalNotes')) {
    await create('Internal notes updated', 'Internal viewing notes were updated.')
  }

  if (changedFields.includes('viewerRating')) {
    await create(
      'Viewer rating updated',
      viewing.viewerRating
        ? `Viewer rating changed to ${viewing.viewerRating} out of 5.`
        : 'Viewer rating was removed.',
      {
        previousViewerRating: previousViewing.viewerRating,
        newViewerRating: viewing.viewerRating,
      },
    )
  }

  if (changedFields.includes('viewingOutcome')) {
    await create(
      'Viewing outcome updated',
      `${formatStatus(previousViewing.viewingOutcome)} → ${formatStatus(viewing.viewingOutcome)}`,
      {
        previousViewingOutcome: previousViewing.viewingOutcome,
        newViewingOutcome: viewing.viewingOutcome,
      },
    )
  }

  if (changedFields.includes('feedback')) {
    await create('Viewer feedback updated', 'Viewer feedback was updated.')
  }

  if (changedFields.includes('vendorFeedback')) {
    await create('Vendor feedback updated', 'Vendor feedback was updated.')
  }

  if (changedFields.includes('followUpRequired') || changedFields.includes('followUpNotes')) {
    await create(
      'Follow-up updated',
      viewing.followUpRequired
        ? 'Follow-up is required for this viewing.'
        : 'Follow-up information was updated.',
      {
        followUpRequired: viewing.followUpRequired,
      },
    )
  }

  const handledFields = [
    'status',
    'dateTime',
    'durationMinutes',
    'agent',
    'internalNotes',
    'viewerRating',
    'viewingOutcome',
    'feedback',
    'vendorFeedback',
    'followUpRequired',
    'followUpNotes',
  ]

  const remainingFields = changedFields.filter((field) => !handledFields.includes(field))

  if (remainingFields.length > 0) {
    await create('Viewing updated', 'General viewing details were updated.', {
      updatedFields: remainingFields,
    })
  }
}
