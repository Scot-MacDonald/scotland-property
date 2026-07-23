import { NextResponse } from 'next/server'

import { importAllAgencyFeeds } from '@/lib/importAgencyFeed'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json(
      {
        ok: false,
        message: 'CRON_SECRET is not configured.',
      },
      { status: 500 },
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Unauthorized.',
      },
      { status: 401 },
    )
  }

  const result = await importAllAgencyFeeds()

  return NextResponse.json(result)
}
