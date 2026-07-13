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

    const isSuperAdmin = user.role === 'super-admin'

    const userAgencyId = typeof user.agency === 'object' ? user.agency?.id : user.agency

    if (!isSuperAdmin && !userAgencyId) {
      return NextResponse.json(
        {
          error: 'No agency assigned to this user.',
        },
        {
          status: 403,
        },
      )
    }

    const formData = await req.formData()

    const title = String(formData.get('title') || '').trim()
    const price = optionalNumber(formData.get('price'))
    const regionId = optionalString(formData.get('region'))
    const townId = optionalString(formData.get('town'))

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

    if (price === undefined) {
      return NextResponse.json(
        {
          error: 'Property price is required.',
        },
        {
          status: 400,
        },
      )
    }

    if (!regionId) {
      return NextResponse.json(
        {
          error: 'Region is required.',
        },
        {
          status: 400,
        },
      )
    }

    if (!townId) {
      return NextResponse.json(
        {
          error: 'Town is required.',
        },
        {
          status: 400,
        },
      )
    }

    const selectedAgencyId = isSuperAdmin
      ? optionalString(formData.get('agency')) || userAgencyId
      : userAgencyId

    if (!selectedAgencyId) {
      return NextResponse.json(
        {
          error: 'An agency must be assigned to this property.',
        },
        {
          status: 400,
        },
      )
    }

    const uniqueSuffix = Date.now().toString().slice(-6)
    const slug = `${createSlug(title)}-${uniqueSuffix}`

    const reference = optionalString(formData.get('reference')) || `SLE-${Date.now()}`

    const featuredImageId = await uploadImage(payload, formData.get('featuredImage'), title)

    const galleryFiles = formData.getAll('gallery')
    const galleryIds: string[] = []

    for (const file of galleryFiles) {
      const uploadedId = await uploadImage(payload, file, title)

      if (uploadedId) {
        galleryIds.push(uploadedId)
      }
    }

    const property = await payload.create({
      collection: 'properties',
      overrideAccess: true,
      data: {
        title,
        slug,
        reference,
        price,
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
        region: regionId,
        town: townId,
        propertyType: optionalString(formData.get('propertyType')),
        agent: optionalString(formData.get('agent')),
        amenities: formData.getAll('amenities').map(String).filter(Boolean),
        agency: selectedAgencyId,
        featuredImage: featuredImageId,
        gallery: galleryIds,
      },
    })

    return NextResponse.json({
      ok: true,
      property,
    })
  } catch (error: unknown) {
    console.error('Create property error:', error)

    const message = error instanceof Error ? error.message : 'Could not create property.'

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
