import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Property } from '@/payload-types'

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

async function uploadImage(
  payload: Awaited<ReturnType<typeof getPayload>>,
  file: FormDataEntryValue | null,
  alt: string,
) {
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
    const title = String(formData.get('title') || '').trim()

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

    const existingProperty = await payload.findByID({
      collection: 'properties',
      id,
      depth: 0,
      overrideAccess: true,
    })

    const isSuperAdmin = user.role === 'super-admin'

    const agencyId = typeof user.agency === 'object' ? user.agency?.id : user.agency

    const propertyAgencyId =
      typeof existingProperty.agency === 'object'
        ? existingProperty.agency?.id
        : existingProperty.agency

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

    const featuredImageId = await uploadImage(payload, formData.get('featuredImage'), title)

    const galleryFiles = formData.getAll('gallery')
    const newGalleryIds: string[] = []

    for (const file of galleryFiles) {
      const uploadedId = await uploadImage(payload, file, title)

      if (uploadedId) {
        newGalleryIds.push(uploadedId)
      }
    }

    const existingGallery = Array.isArray(existingProperty.gallery)
      ? existingProperty.gallery
          .map((item) => {
            if (typeof item === 'string') {
              return item
            }

            return item?.id || null
          })
          .filter((item): item is string => Boolean(item))
      : []

    const existingFeaturedImageId =
      typeof existingProperty.featuredImage === 'object'
        ? existingProperty.featuredImage?.id
        : existingProperty.featuredImage

    const data: Record<string, unknown> = {
      title,
      slug: existingProperty.slug || `${createSlug(title)}-${Date.now().toString().slice(-6)}`,
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

    if (featuredImageId) {
      data.featuredImage = featuredImageId
    } else if (existingFeaturedImageId) {
      data.featuredImage = existingFeaturedImageId
    }

    if (newGalleryIds.length > 0) {
      data.gallery = [...existingGallery, ...newGalleryIds]
    }

    await payload.update({
      collection: 'properties',
      id,
      overrideAccess: true,
      data,
    })

    return NextResponse.json({
      ok: true,
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
