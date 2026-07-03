import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

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
  if (!stringValue) return undefined
  return Number(stringValue)
}

async function uploadImage(payload: any, file: FormDataEntryValue | null, alt: string) {
  if (!(file instanceof File) || file.size === 0) return undefined

  const buffer = Buffer.from(await file.arrayBuffer())

  const uploaded = await payload.create({
    collection: 'media',
    data: {
      alt,
    },
    file: {
      data: buffer,
      mimetype: file.type,
      name: file.name,
      size: file.size,
    },
  })

  return uploaded.id
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({
      headers: await headers(),
    })

    if (!user || user.collection !== 'users') {
      return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
    }

    const userAsAny = user as any
    const isSuperAdmin = userAsAny.role === 'super-admin'
    const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

    if (!isSuperAdmin && !agencyId) {
      return NextResponse.json({ error: 'No agency assigned to this user.' }, { status: 403 })
    }

    const formData = await req.formData()

    const title = String(formData.get('title') || '').trim()

    if (!title) {
      return NextResponse.json({ error: 'Property title is required.' }, { status: 400 })
    }

    const featuredImageId = await uploadImage(payload, formData.get('featuredImage'), title)

    const galleryFiles = formData.getAll('gallery')
    const galleryIds = []

    for (const file of galleryFiles) {
      const uploadedId = await uploadImage(payload, file, title)
      if (uploadedId) galleryIds.push(uploadedId)
    }

    const property = await payload.create({
      collection: 'properties',
      data: {
        title,
        slug: `${createSlug(title)}-${Date.now().toString().slice(-6)}`,
        price: optionalNumber(formData.get('price')),
        status: optionalString(formData.get('status')) || 'for-sale',
        excerpt: optionalString(formData.get('excerpt')),
        bedrooms: optionalNumber(formData.get('bedrooms')),
        bathrooms: optionalNumber(formData.get('bathrooms')),
        internalArea: optionalNumber(formData.get('internalArea')),
        landArea: optionalString(formData.get('landArea')),
        latitude: optionalNumber(formData.get('latitude')),
        longitude: optionalNumber(formData.get('longitude')),
        region: optionalString(formData.get('region')),
        town: optionalString(formData.get('town')),
        propertyType: optionalString(formData.get('propertyType')),
        agent: optionalString(formData.get('agent')),
        amenities: formData.getAll('amenities').map(String).filter(Boolean),
        agency: agencyId,
        featuredImage: featuredImageId,
        gallery: galleryIds,
      },
    })

    return NextResponse.json({
      ok: true,
      property,
    })
  } catch (error: any) {
    console.error('Create property error:', error)

    return NextResponse.json(
      {
        error: error?.message || 'Could not create property.',
      },
      { status: 500 },
    )
  }
}
