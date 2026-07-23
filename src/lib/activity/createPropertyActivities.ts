import type { Property } from '@/payload-types'

import { ActivityEntityTypes } from './activityEntityTypes'
import { ActivitySeverities } from './activitySeverity'
import { ActivityTypes } from './activityTypes'
import { createActivity } from './createActivity'

type CreatePropertyActivitiesArgs = {
  previousProperty: Property
  property: Property
  changedFields: string[]
  agencyId: string
  userId: string
}

function formatPropertyStatus(status: Property['status']) {
  if (status === 'for-sale') return 'For Sale'
  if (status === 'reserved') return 'Reserved'
  if (status === 'sold') return 'Sold'

  return 'Not set'
}

function formatPropertyPrice(price: Property['price']) {
  if (typeof price !== 'number') {
    return 'Not set'
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(price)
}

function getPropertyUpdateDescription(fields: string[]) {
  const labels: Record<string, string> = {
    title: 'title',
    slug: 'slug',
    reference: 'reference',
    excerpt: 'summary',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    internalArea: 'internal area',
    landArea: 'land area',
    yearBuilt: 'year built',
    energyRating: 'energy rating',
    marketingHeadline: 'marketing headline',
    seoTitle: 'SEO title',
    seoDescription: 'SEO description',
    latitude: 'latitude',
    longitude: 'longitude',
    virtualTour: 'virtual tour',
    youtubeVideo: 'video',
    region: 'region',
    town: 'town',
    propertyType: 'property type',
    agent: 'assigned agent',
    featured: 'featured status',
    amenities: 'amenities',
    publishOnWebsite: 'website publishing',
    publishToJamesEdition: 'JamesEdition publishing',
    publishToRightmove: 'Rightmove publishing',
    publishToZoopla: 'Zoopla publishing',
    featuredImage: 'featured image',
    socialImage: 'social image',
    brochure: 'brochure',
    gallery: 'gallery',
    floorPlans: 'floor plans',
  }

  const fieldLabels = fields.map((field) => labels[field] || field)

  if (fieldLabels.length === 1) {
    const [fieldLabel] = fieldLabels
    return `${fieldLabel[0].toUpperCase()}${fieldLabel.slice(1)} updated.`
  }

  if (fieldLabels.length === 2) {
    return `${fieldLabels[0]} and ${fieldLabels[1]} updated.`
  }

  return `${fieldLabels.slice(0, -1).join(', ')} and ${
    fieldLabels[fieldLabels.length - 1]
  } updated.`
}

export async function createPropertyActivities({
  previousProperty,
  property,
  changedFields,
  agencyId,
  userId,
}: CreatePropertyActivitiesArgs) {
  if (changedFields.includes('status') && previousProperty.status !== property.status) {
    await createActivity({
      type: ActivityTypes.PROPERTY_STATUS_CHANGED,
      title: 'Status changed',
      description: `Property status changed from ${formatPropertyStatus(
        previousProperty.status,
      )} to ${formatPropertyStatus(property.status)}.`,
      severity: property.status === 'sold' ? ActivitySeverities.SUCCESS : ActivitySeverities.INFO,
      entityType: ActivityEntityTypes.PROPERTY,
      entityId: property.id,
      agency: agencyId,
      user: userId,
      metadata: {
        previousStatus: previousProperty.status,
        nextStatus: property.status,
      },
    })
  }

  if (changedFields.includes('price') && previousProperty.price !== property.price) {
    await createActivity({
      type: ActivityTypes.PRICE_CHANGED,
      title: 'Price changed',
      description: `Property price changed from ${formatPropertyPrice(
        previousProperty.price,
      )} to ${formatPropertyPrice(property.price)}.`,
      severity: ActivitySeverities.INFO,
      entityType: ActivityEntityTypes.PROPERTY,
      entityId: property.id,
      agency: agencyId,
      user: userId,
      metadata: {
        previousPrice: previousProperty.price,
        nextPrice: property.price,
      },
    })
  }

  const generalUpdatedFields = changedFields.filter(
    (field) => field !== 'status' && field !== 'price' && field !== 'slug',
  )

  if (generalUpdatedFields.length > 0) {
    await createActivity({
      type: ActivityTypes.PROPERTY_UPDATED,
      title: 'Property updated',
      description: getPropertyUpdateDescription(generalUpdatedFields),
      severity: ActivitySeverities.INFO,
      entityType: ActivityEntityTypes.PROPERTY,
      entityId: property.id,
      agency: agencyId,
      user: userId,
      metadata: {
        updatedFields: generalUpdatedFields,
      },
    })
  }
}
