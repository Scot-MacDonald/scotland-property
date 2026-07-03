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
    const payload = await getPayload({
      config: configPromise,
    })

    const { user } = await payload.auth({
      headers: await headers(),
    })

    if (!user) {
      return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
    }

    const formData = await req.formData()

    const id = String(formData.get('id'))
    const name = String(formData.get('name') || '').trim()
    const jobTitle = String(formData.get('jobTitle') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const phone = String(formData.get('phone') || '').trim()
    const photo = formData.get('photo')

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

    const existingAgent = await payload.findByID({
      collection: 'agents',
      id,
      depth: 0,
    })

    await payload.update({
      collection: 'agents',
      id,
      data: {
        name,
        slug: createSlug(name),
        jobTitle,
        email,
        phone,
        photo:
          photoId ||
          (typeof existingAgent.photo === 'object' ? existingAgent.photo?.id : existingAgent.photo),
      },
    })

    return NextResponse.json({
      ok: true,
    })
  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      {
        error: error?.message || 'Could not update agent.',
      },
      { status: 500 },
    )
  }
}
