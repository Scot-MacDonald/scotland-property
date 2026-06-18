import { NextResponse } from 'next/server'
import { importAllAgencyFeeds } from '@/lib/importAgencyFeed'

export async function GET() {
  return NextResponse.json(await importAllAgencyFeeds())
}
