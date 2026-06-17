import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

export async function GET() {
  const payload = await getPayload({ config: configPromise })

  const buyers = await payload.find({
    collection: 'buyers',
    limit: 1,
    where: {
      alertsEnabled: {
        equals: true,
      },
    },
    overrideAccess: true,
  })

  const buyer = buyers.docs[0]

  if (!buyer?.email) {
    return NextResponse.json({
      ok: false,
      message: 'No buyer with alertsEnabled found.',
    })
  }

  await payload.sendEmail({
    to: buyer.email,
    subject: 'Test property alert',
    html: `
      <h1>Test Property Alert</h1>
      <p>Hello ${buyer.name || 'there'},</p>
      <p>This is a test email from Scotland Luxury Estates.</p>
      <p>If you received this, buyer alerts are working.</p>
    `,
  })

  return NextResponse.json({
    ok: true,
    message: `Test email sent to ${buyer.email}`,
  })
}
