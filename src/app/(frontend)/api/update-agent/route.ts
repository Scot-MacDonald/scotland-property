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

export async function POST(req: Request) {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const { user } = await payload.auth({
      headers: await headers(),
    })

    if (!user || user.collection !== 'users') {
      return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
    }

    const formData = await req.formData()
    const id = String(formData.get('id') || '').trim()

    if (!id) {
      return NextResponse.json({ error: 'Missing agent ID.' }, { status: 400 })
    }

    const existingAgent = await payload.findByID({
      collection: 'agents',
      id,
      depth: 0,
      overrideAccess: true,
    })

    const isSuperAdmin = user.role === 'super-admin'
    const userAgencyId = getRelationshipId(user.agency)
    const agentAgencyId = getRelationshipId(existingAgent.agency)

    if (!isSuperAdmin && userAgencyId !== agentAgencyId) {
      return NextResponse.json({ error: 'Not authorised.' }, { status: 403 })
    }

    const data: Record<string, unknown> = {}

    if (formData.has('name')) {
      const name = String(formData.get('name') || '').trim()

      if (!name) {
        return NextResponse.json({ error: 'Agent name is required.' }, { status: 400 })
      }

      data.name = name
      data.slug = createSlug(name)
    }

    if (formData.has('jobTitle')) {
      data.jobTitle = optionalString(formData.get('jobTitle'))
    }

    if (formData.has('email')) {
      data.email = optionalString(formData.get('email'))
    }

    if (formData.has('phone')) {
      data.phone = optionalString(formData.get('phone'))
    }

    if (formData.has('photoManaged')) {
      const retainedPhotoId = optionalString(formData.get('photoId'))

      const uploadedPhotoId = await uploadFile(
        payload,
        formData.get('photo'),
        String(data.name || existingAgent.name),
      )

      data.photo = uploadedPhotoId || retainedPhotoId || null
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No agent changes were submitted.' }, { status: 400 })
    }

    await payload.update({
      collection: 'agents',
      id,
      depth: 0,
      overrideAccess: true,
      data,
    })

    const updatedAgent = await payload.findByID({
      collection: 'agents',
      id,
      depth: 2,
      overrideAccess: true,
    })

    return NextResponse.json({
      ok: true,
      agent: updatedAgent,
    })
  } catch (error: unknown) {
    console.error('Update agent error:', error)

    const message = error instanceof Error ? error.message : 'Could not update agent.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
