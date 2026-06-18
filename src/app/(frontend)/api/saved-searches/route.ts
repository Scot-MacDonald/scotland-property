import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'buyers') {
    return NextResponse.json({
      ok: false,
      savedSearches: [],
      message: 'No logged-in buyer.',
    })
  }

  return NextResponse.json({
    ok: true,
    savedSearches: Array.isArray(user.savedSearches) ? user.savedSearches : [],
  })
}

export async function POST(req: Request) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'buyers') {
    return NextResponse.json(
      {
        ok: false,
        message: 'You must be logged in as a buyer.',
      },
      { status: 401 },
    )
  }

  const body = await req.json()

  const label = String(body.label || '').trim()
  const queryString = String(body.queryString || '').trim()

  if (!label || !queryString) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Missing label or queryString.',
      },
      { status: 400 },
    )
  }

  const currentSavedSearches = Array.isArray(user.savedSearches) ? user.savedSearches : []

  const alreadySaved = currentSavedSearches.some((search: any) => {
    return search.queryString === queryString
  })

  const nextSavedSearches = alreadySaved
    ? currentSavedSearches
    : [
        ...currentSavedSearches,
        {
          label,
          queryString,
          createdAt: new Date().toISOString(),
        },
      ]

  await payload.update({
    collection: 'buyers',
    id: user.id,
    data: {
      savedSearches: nextSavedSearches,
    },
    overrideAccess: true,
  })

  return NextResponse.json({
    ok: true,
    savedSearches: nextSavedSearches,
  })
}

export async function DELETE(req: Request) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'buyers') {
    return NextResponse.json(
      {
        ok: false,
        message: 'You must be logged in as a buyer.',
      },
      { status: 401 },
    )
  }

  const body = await req.json()
  const queryString = String(body.queryString || '').trim()

  if (!queryString) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Missing queryString.',
      },
      { status: 400 },
    )
  }

  const currentSavedSearches = Array.isArray(user.savedSearches) ? user.savedSearches : []

  const nextSavedSearches = currentSavedSearches.filter((search: any) => {
    return search.queryString !== queryString
  })

  await payload.update({
    collection: 'buyers',
    id: user.id,
    data: {
      savedSearches: nextSavedSearches,
    },
    overrideAccess: true,
  })

  return NextResponse.json({
    ok: true,
    savedSearches: nextSavedSearches,
  })
}
