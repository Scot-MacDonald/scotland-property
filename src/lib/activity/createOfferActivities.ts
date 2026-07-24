import {
  ActivityEntityTypes,
  ActivityTypes,
  createActivity,
  type ActivityType,
} from '@/lib/activity'

function formatStatus(value: unknown) {
  if (!value) {
    return 'Unknown'
  }

  return String(value)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatAmount(value: unknown) {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return 'Unknown'
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatConfidence(value: unknown) {
  if (!value) {
    return 'Unknown'
  }

  const stringValue = String(value)

  return stringValue.charAt(0).toUpperCase() + stringValue.slice(1)
}

type Args = {
  previousOffer: any
  offer: any
  changedFields: string[]
  agencyId: string
  userId: string
}

export async function createOfferActivities({
  previousOffer,
  offer,
  changedFields,
  agencyId,
  userId,
}: Args) {
  const create = (
    type: ActivityType,
    title: string,
    description: string,
    metadata: Record<string, unknown> = {},
  ) =>
    createActivity({
      agency: agencyId,
      entityType: ActivityEntityTypes.OFFER,
      entityId: String(offer.id),
      type,
      title,
      description,
      metadata,
      user: userId,
    })

  if (changedFields.includes('amount')) {
    await create(
      ActivityTypes.OFFER_AMOUNT_CHANGED,
      'Offer amount changed',
      `${formatAmount(previousOffer.amount)} → ${formatAmount(offer.amount)}`,
      {
        previousAmount: previousOffer.amount,
        newAmount: offer.amount,
      },
    )
  }

  if (changedFields.includes('status')) {
    const previousStatus = previousOffer.status
    const newStatus = offer.status

    let activityType: ActivityType = ActivityTypes.OFFER_STATUS_CHANGED

    let title = 'Offer status changed'

    if (newStatus === 'accepted') {
      activityType = ActivityTypes.OFFER_ACCEPTED
      title = 'Offer accepted'
    }

    if (newStatus === 'rejected') {
      activityType = ActivityTypes.OFFER_REJECTED
      title = 'Offer rejected'
    }

    if (newStatus === 'withdrawn') {
      activityType = ActivityTypes.OFFER_WITHDRAWN
      title = 'Offer withdrawn'
    }

    await create(
      activityType,
      title,
      `${formatStatus(previousStatus)} → ${formatStatus(newStatus)}`,
      {
        previousStatus,
        newStatus,
      },
    )
  }

  if (changedFields.includes('confidence')) {
    await create(
      ActivityTypes.OFFER_UPDATED,
      'Offer confidence changed',
      `${formatConfidence(previousOffer.confidence)} → ${formatConfidence(offer.confidence)}`,
      {
        previousConfidence: previousOffer.confidence,
        newConfidence: offer.confidence,
      },
    )
  }

  if (
    changedFields.includes('conditions') ||
    changedFields.includes('vendorResponse') ||
    changedFields.includes('buyerResponse')
  ) {
    const negotiationFields = changedFields.filter(
      (field) => field === 'conditions' || field === 'vendorResponse' || field === 'buyerResponse',
    )

    await create(
      ActivityTypes.OFFER_NEGOTIATION_UPDATED,
      'Negotiation updated',
      'Offer negotiation details were updated.',
      {
        updatedFields: negotiationFields,
      },
    )
  }

  if (changedFields.includes('internalNotes')) {
    await create(
      ActivityTypes.OFFER_NOTES_UPDATED,
      'Offer notes updated',
      'Internal offer notes were updated.',
    )
  }

  const handledFields = [
    'amount',
    'status',
    'confidence',
    'conditions',
    'vendorResponse',
    'buyerResponse',
    'internalNotes',
  ]

  const ignoredFields = ['updatedAt', 'createdAt']

  const remainingFields = changedFields.filter(
    (field) => !handledFields.includes(field) && !ignoredFields.includes(field),
  )

  if (remainingFields.length > 0) {
    await create(
      ActivityTypes.OFFER_UPDATED,
      'Offer updated',
      'General offer details were updated.',
      {
        updatedFields: remainingFields,
      },
    )
  }
}
