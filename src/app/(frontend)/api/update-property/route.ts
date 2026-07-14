import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Property } from '@/payload-types'

type Payload = Awaited<ReturnType<typeof getPayload>>
type PropertyStatus = NonNullable<Property['status']>

function createSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function optionalString(value: FormDataEntryValue | null) {
  const stringValue = String(value || '').trim()

  return stringValue || undefined
}

function optionalNumber(value: FormDataEntryValue | null) {
  const stringValue = String(value || '').trim()

  if (!stringValue) {
    return undefined
  }

  const numberValue = Number(stringValue)

  return Number.isFinite(numberValue) ? numberValue : undefined
}

function optionalBoolean(value: FormDataEntryValue | null) {
  if (value === null) {
    return undefined
  }

  const stringValue = String(value).trim().toLowerCase()

  if (stringValue === 'true') {
    return true
  }

  if (stringValue === 'false') {
    return false
  }

  return undefined
}

function getPropertyStatus(value: FormDataEntryValue | null): PropertyStatus | undefined {
  if (value === null) return undefined

  const status = String(value).trim()

  if (status === 'for-sale' || status === 'reserved' || status === 'sold') {
    return status
  }

  return undefined
}

function getRelationshipId(value: unknown) {
  if (!value) return null

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
    return value.id
  }

  return null
}

function getRelationshipIds(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map(getRelationshipId).filter((id): id is string => Boolean(id))
}

async function uploadFile(payload: Payload, file: FormDataEntryValue | null, alt: string) {
  if (!(file instanceof File) || file.size === 0) {
    return undefined
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const uploaded = await payload.create({
    collection: 'media',
    overrideAccess: true,
    data: {
      alt,
    },
    file: {
      data: buffer,
      mimetype: file.type || 'application/octet-stream',
      name: file.name,
      size: file.size,
    },
  })

  return uploaded.id
}

async function uploadFiles(payload: Payload, files: FormDataEntryValue[], alt: string) {
  const ids: string[] = []

  for (const file of files) {
    const uploadedId = await uploadFile(payload, file, alt)

    if (uploadedId) {
      ids.push(uploadedId)
    }
  }

  return ids
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const { user } = await payload.auth({
      headers: await headers(),
    })

    if (!user || user.collection !== 'users') {
      return NextResponse.json(
        {
          error: 'Not authorised.',
        },
        {
          status: 401,
        },
      )
    }

    const formData = await req.formData()
    const id = String(formData.get('id') || '').trim()

    if (!id) {
      return NextResponse.json(
        {
          error: 'Missing property ID.',
        },
        {
          status: 400,
        },
      )
    }

    const existingProperty = await payload.findByID({
      collection: 'properties',
      id,
      depth: 0,
      overrideAccess: true,
    })

    const isSuperAdmin = user.role === 'super-admin'
    const agencyId = getRelationshipId(user.agency)
    const propertyAgencyId = getRelationshipId(existingProperty.agency)

    if (!isSuperAdmin && agencyId !== propertyAgencyId) {
      return NextResponse.json(
        {
          error: 'Not authorised.',
        },
        {
          status: 403,
        },
      )
    }

    const data: Record<string, unknown> = {}

    if (formData.has('title')) {
      const title = String(formData.get('title') || '').trim()

      if (!title) {
        return NextResponse.json(
          {
            error: 'Property title is required.',
          },
          {
            status: 400,
          },
        )
      }

      data.title = title

      if (!existingProperty.slug) {
        data.slug = `${createSlug(title)}-${Date.now().toString().slice(-6)}`
      }
    }

    if (formData.has('reference')) {
      data.reference = optionalString(formData.get('reference'))
    }

    if (formData.has('price')) {
      data.price = optionalNumber(formData.get('price'))
    }

    if (formData.has('status')) {
      data.status = getPropertyStatus(formData.get('status'))
    }

    if (formData.has('excerpt')) {
      data.excerpt = optionalString(formData.get('excerpt'))
    }

    if (formData.has('bedrooms')) {
      data.bedrooms = optionalNumber(formData.get('bedrooms'))
    }

    if (formData.has('bathrooms')) {
      data.bathrooms = optionalNumber(formData.get('bathrooms'))
    }

    if (formData.has('internalArea')) {
      data.internalArea = optionalNumber(formData.get('internalArea'))
    }

    if (formData.has('landArea')) {
      data.landArea = optionalNumber(formData.get('landArea'))
    }

    if (formData.has('yearBuilt')) {
      data.yearBuilt = optionalNumber(formData.get('yearBuilt'))
    }

    if (formData.has('energyRating')) {
      data.energyRating = optionalString(formData.get('energyRating'))
    }

    if (formData.has('latitude')) {
      data.latitude = optionalNumber(formData.get('latitude'))
    }

    if (formData.has('longitude')) {
      data.longitude = optionalNumber(formData.get('longitude'))
    }

    if (formData.has('virtualTour')) {
      data.virtualTour = optionalString(formData.get('virtualTour'))
    }

    if (formData.has('youtubeVideo')) {
      data.youtubeVideo = optionalString(formData.get('youtubeVideo'))
    }

    if (formData.has('region')) {
      data.region = optionalString(formData.get('region'))
    }

    if (formData.has('town')) {
      data.town = optionalString(formData.get('town'))
    }

    if (formData.has('propertyType')) {
      data.propertyType = optionalString(formData.get('propertyType'))
    }

    if (formData.has('agent')) {
      data.agent = optionalString(formData.get('agent'))
    }

    if (formData.has('featured')) {
      data.featured = optionalBoolean(formData.get('featured'))
    }

    if (formData.has('amenities')) {
      data.amenities = formData.getAll('amenities').map(String).filter(Boolean)
    }

    if (formData.has('featuredImageManaged')) {
      const featuredImageId = optionalString(formData.get('featuredImageId'))
      const uploadedFeaturedImageId = await uploadFile(
        payload,
        formData.get('featuredImage'),
        existingProperty.title,
      )

      data.featuredImage = uploadedFeaturedImageId || featuredImageId || null
    }

    if (formData.has('galleryManaged')) {
      const retainedGalleryIds = formData.getAll('galleryIds').map(String).filter(Boolean)

      const uploadedGalleryIds = await uploadFiles(
        payload,
        formData.getAll('galleryFiles'),
        existingProperty.title,
      )

      data.gallery = [...retainedGalleryIds, ...uploadedGalleryIds]
    }

    if (formData.has('floorPlansManaged')) {
      const retainedFloorPlanIds = formData.getAll('floorPlanIds').map(String).filter(Boolean)

      const uploadedFloorPlanIds = await uploadFiles(
        payload,
        formData.getAll('floorPlanFiles'),
        `${existingProperty.title} floorplan`,
      )

      data.floorPlans = [...retainedFloorPlanIds, ...uploadedFloorPlanIds]
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          error: 'No property changes were submitted.',
        },
        {
          status: 400,
        },
      )
    }

    await payload.update({
      collection: 'properties',
      id,
      depth: 0,
      overrideAccess: true,
      data,
    })

    const updatedProperty = await payload.findByID({
      collection: 'properties',
      id,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({
      ok: true,
      property: updatedProperty,
    })
  } catch (error: unknown) {
    console.error('Update property error:', error)

    const message = error instanceof Error ? error.message : 'Could not update property.'

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    )
  }
}
