import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

type Payload = Awaited<ReturnType<typeof getPayload>>

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

function optionalWebsite(value: FormDataEntryValue | null) {
  const website = String(value || '').trim()

  if (!website) {
    return undefined
  }

  if (/^https?:\/\//i.test(website)) {
    return website
  }

  return `https://${website}`
}

function optionalBoolean(value: FormDataEntryValue | null) {
  return String(value) === 'true'
}

function getRelationshipId(value: unknown) {
  if (!value) return null

  if (typeof value === 'string') {
    return value
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string'
  ) {
    return value.id
  }

  return null
}

async function uploadLogo(payload: Payload, file: FormDataEntryValue | null, alt: string) {
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

export async function PATCH(req: Request) {
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
          ok: false,
          message: 'Not authorised.',
        },
        { status: 401 },
      )
    }

    const formData = await req.formData()
    const submittedId = String(formData.get('id') || '').trim()

    const userAgencyId = getRelationshipId(user.agency)
    const isSuperAdmin = user.role === 'super-admin'

    const agencyId = submittedId || userAgencyId

    if (!agencyId) {
      return NextResponse.json(
        {
          ok: false,
          message: 'No agency was specified.',
        },
        { status: 400 },
      )
    }

    if (!isSuperAdmin && agencyId !== userAgencyId) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Not authorised.',
        },
        { status: 403 },
      )
    }

    const existingAgency = await payload.findByID({
      collection: 'agencies',
      id: agencyId,
      depth: 0,
      overrideAccess: true,
    })

    const data: Record<string, unknown> = {}

    if (formData.has('name')) {
      const name = String(formData.get('name') || '').trim()

      if (!name) {
        return NextResponse.json(
          {
            ok: false,
            message: 'Agency name is required.',
          },
          { status: 400 },
        )
      }

      data.name = name
      data.slug = createSlug(name)
    }

    if (formData.has('description')) {
      data.description = optionalString(formData.get('description'))
    }

    if (formData.has('email')) {
      data.email = optionalString(formData.get('email'))
    }

    if (formData.has('phone')) {
      data.phone = optionalString(formData.get('phone'))
    }

    if (formData.has('website')) {
      data.website = optionalWebsite(formData.get('website'))
    }

    const addressManaged =
      formData.has('street') ||
      formData.has('city') ||
      formData.has('postcode') ||
      formData.has('country')

    if (addressManaged) {
      data.address = {
        street: optionalString(formData.get('street')),
        city: optionalString(formData.get('city')),
        postcode: optionalString(formData.get('postcode')),
        country: optionalString(formData.get('country')),
      }
    }

    const crmManaged =
      formData.has('crmEnabled') || formData.has('crmType') || formData.has('crmFeedUrl')

    if (crmManaged) {
      const existingCRM =
        existingAgency.crm && typeof existingAgency.crm === 'object' ? existingAgency.crm : {}

      const crmType = String(formData.get('crmType') || 'manual')

      if (crmType !== 'manual' && crmType !== 'generic-xml') {
        return NextResponse.json(
          {
            ok: false,
            message: 'Invalid CRM integration type.',
          },
          { status: 400 },
        )
      }

      data.crm = {
        ...existingCRM,
        enabled: optionalBoolean(formData.get('crmEnabled')),
        type: crmType,
        feedUrl: optionalString(formData.get('crmFeedUrl')),
      }
    }

    if (formData.has('logoManaged')) {
      const retainedLogoId = optionalString(formData.get('logoId'))

      const uploadedLogoId = await uploadLogo(
        payload,
        formData.get('logo'),
        String(data.name || existingAgency.name),
      )

      data.logo = uploadedLogoId || retainedLogoId || null
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: 'No agency changes were submitted.',
        },
        { status: 400 },
      )
    }

    await payload.update({
      collection: 'agencies',
      id: agencyId,
      depth: 0,
      overrideAccess: true,
      data,
    })

    const updatedAgency = await payload.findByID({
      collection: 'agencies',
      id: agencyId,
      depth: 2,
      overrideAccess: true,
    })

    return NextResponse.json({
      ok: true,
      agency: updatedAgency,
      message: 'Agency updated successfully.',
    })
  } catch (error: unknown) {
    console.error('Update agency settings error:', error)

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : 'Could not update agency settings.',
      },
      { status: 500 },
    )
  }
}
