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

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })

    if (!user || user.collection !== 'users') {
      return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
    }

    const agencyId = typeof user.agency === 'object' && user.agency ? user.agency.id : user.agency

    if (!agencyId) {
      return NextResponse.json({ error: 'No agency assigned to this user.' }, { status: 403 })
    }

    const formData = await req.formData()

    const name = String(formData.get('name') || '').trim()
    const jobTitle = String(formData.get('jobTitle') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const phone = String(formData.get('phone') || '').trim()
    const photo = formData.get('photo')

    if (!name) {
      return NextResponse.json({ error: 'Agent name is required.' }, { status: 400 })
    }

    let photoId: string | undefined

    if (photo instanceof File && photo.size > 0) {
      const buffer = Buffer.from(await photo.arrayBuffer())

      const uploadedPhoto = await payload.create({
        collection: 'media',
        data: {
          alt: name,
        },
        file: {
          data: buffer,
          mimetype: photo.type,
          name: photo.name,
          size: photo.size,
        },
      })

      photoId = uploadedPhoto.id
    }

    const agent = await payload.create({
      collection: 'agents',
      data: {
        name,
        slug: createSlug(name),
        email: email || undefined,
        phone: phone || undefined,
        jobTitle: jobTitle || undefined,
        agency: agencyId,
        photo: photoId,
      },
    })

    return NextResponse.json({
      ok: true,
      agent,
    })
  } catch (error: any) {
    console.error('Create agent error:', error)

    return NextResponse.json(
      {
        error: error?.message || 'Could not create agent.',
      },
      { status: 500 },
    )
  }
}
