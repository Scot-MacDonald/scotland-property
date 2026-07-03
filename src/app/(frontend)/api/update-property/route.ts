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

    const formData = await req.formData()

    const id = String(formData.get('id') || '')
    const title = String(formData.get('title') || '').trim()

    if (!id) {
      return NextResponse.json({ error: 'Missing property ID.' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Property title is required.' }, { status: 400 })
    }

    const existingProperty = await payload.findByID({
      collection: 'properties',
      id,
      depth: 0,
      overrideAccess: true,
    })

    const userAsAny = user as any
    const isSuperAdmin = userAsAny.role === 'super-admin'
    const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

    const propertyAgencyId =
      typeof existingProperty.agency === 'object'
        ? existingProperty.agency?.id
        : existingProperty.agency

    if (!isSuperAdmin && agencyId !== propertyAgencyId) {
      return NextResponse.json({ error: 'Not authorised.' }, { status: 403 })
    }

    const featuredImageId = await uploadImage(payload, formData.get('featuredImage'), title)

    const galleryFiles = formData.getAll('gallery')
    const newGalleryIds = []

    for (const file of galleryFiles) {
      const uploadedId = await uploadImage(payload, file, title)
      if (uploadedId) newGalleryIds.push(uploadedId)
    }

    const existingGallery = Array.isArray(existingProperty.gallery)
      ? existingProperty.gallery.map((item: any) => (typeof item === 'object' ? item.id : item))
      : []

    await payload.update({
      collection: 'properties',
      id,
      overrideAccess: true,
      data: {
        title,
        slug: existingProperty.slug || `${createSlug(title)}-${Date.now().toString().slice(-6)}`,
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
        featuredImage:
          featuredImageId ||
          (typeof existingProperty.featuredImage === 'object'
            ? existingProperty.featuredImage?.id
            : existingProperty.featuredImage),
        gallery: [...existingGallery, ...newGalleryIds],
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Update property error:', error)

    return NextResponse.json(
      {
        error: error?.message || 'Could not update property.',
      },
      { status: 500 },
    )
  }
}
