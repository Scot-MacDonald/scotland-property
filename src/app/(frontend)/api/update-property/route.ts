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

function getPropertyStatus(value: FormDataEntryValue | null): PropertyStatus {
  const status = String(value || '').trim()

  if (status === 'for-sale' || status === 'reserved' || status === 'sold') {
    return status
  }

  return 'for-sale'
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

    await payload.update({
      collection: 'properties',
      id,
      overrideAccess: true,
      data: {
        title,
        slug: existingProperty.slug || `${createSlug(title)}-${Date.now().toString().slice(-6)}`,
        price: optionalNumber(formData.get('price')),
        status: getPropertyStatus(formData.get('status')),
        excerpt: optionalString(formData.get('excerpt')),
        bedrooms: optionalNumber(formData.get('bedrooms')),
        bathrooms: optionalNumber(formData.get('bathrooms')),
        internalArea: optionalNumber(formData.get('internalArea')),
        landArea: optionalNumber(formData.get('landArea')),
        yearBuilt: optionalNumber(formData.get('yearBuilt')),
        energyRating: optionalString(formData.get('energyRating')),
        latitude: optionalNumber(formData.get('latitude')),
        longitude: optionalNumber(formData.get('longitude')),
        virtualTour: optionalString(formData.get('virtualTour')),
        youtubeVideo: optionalString(formData.get('youtubeVideo')),
        region: optionalString(formData.get('region')),
        town: optionalString(formData.get('town')),
        propertyType: optionalString(formData.get('propertyType')),
        agent: optionalString(formData.get('agent')),
        amenities: formData.getAll('amenities').map(String).filter(Boolean),
        featuredImage: featuredImageId || existingFeaturedImageId || undefined,
        gallery: [...existingGallery, ...newGalleryIds],
      },
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
