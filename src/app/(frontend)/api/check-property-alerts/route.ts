import { sendPropertyAlerts } from '@/lib/sendPropertyAlerts'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const propertyId = String(body.propertyId || '').trim()

  if (!propertyId) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Missing propertyId.',
      },
      { status: 400 },
    )
  }

  const result = await sendPropertyAlerts(propertyId)

  return NextResponse.json(result)
}
