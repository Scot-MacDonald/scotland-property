import { NextResponse } from 'next/server'
import { importAgencyFeed } from '@/lib/importAgencyFeed'

export async function GET() {
  const result = await importAgencyFeed()

  return NextResponse.json(result)
}
