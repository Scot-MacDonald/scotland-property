import 'dotenv/config'

import { getPayload } from 'payload'

import configPromise from '../src/payload.config.js'

const demoReferences = ['DEMO-OFFER-001', 'DEMO-OFFER-002'] as const

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result.toISOString()
}

async function main() {
  const payload = await getPayload({
    config: configPromise,
  })

  console.log('Finding an agency...')

  const agencies = await payload.find({
    collection: 'agencies',
    depth: 0,
    limit: 1,
    sort: 'createdAt',
    overrideAccess: true,
  })

  const agency = agencies.docs[0]

  if (!agency) {
    throw new Error('No agency found. Create an agency before running this seed.')
  }

  const agencyId = String(agency.id)

  console.log(`Using agency: ${agency.name}`)

  const properties = await payload.find({
    collection: 'properties',
    depth: 0,
    limit: 2,
    sort: '-createdAt',
    overrideAccess: true,
    where: {
      agency: {
        equals: agencyId,
      },
    },
  })

  if (properties.docs.length < 2) {
    throw new Error(
      `The agency "${agency.name}" needs at least two properties before offers can be seeded.`,
    )
  }

  // ---------------------------------------------------------------------------
  // Find or create demo buyers
  // ---------------------------------------------------------------------------

  const buyers = await payload.find({
    collection: 'buyers',
    depth: 0,
    limit: 2,
    sort: '-createdAt',
    overrideAccess: true,
    where: {
      agency: {
        equals: agencyId,
      },
    },
  })

  const demoBuyerData = [
    {
      name: 'James Campbell',
      email: 'james.campbell.demo@example.com',
      phone: '07700 900101',
      password: 'DemoBuyer123!',
    },
    {
      name: 'Emma Robertson',
      email: 'emma.robertson.demo@example.com',
      phone: '07700 900102',
      password: 'DemoBuyer123!',
    },
  ]

  for (const demoBuyer of demoBuyerData) {
    if (buyers.docs.length >= 2) {
      break
    }

    const existingBuyer = await payload.find({
      collection: 'buyers',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        email: {
          equals: demoBuyer.email,
        },
      },
    })

    if (existingBuyer.docs[0]) {
      buyers.docs.push(existingBuyer.docs[0])
      continue
    }

    const createdBuyer = await payload.create({
      collection: 'buyers',
      overrideAccess: true,
      data: {
        ...demoBuyer,
        agency: agencyId,
        alertsEnabled: false,
      },
    })

    buyers.docs.push(createdBuyer)

    console.log(`Created demo buyer: ${createdBuyer.name}`)
  }

  if (buyers.docs.length < 2) {
    throw new Error('Could not create or find two buyers for the offer seed.')
  }

  // ---------------------------------------------------------------------------
  // Agents
  // ---------------------------------------------------------------------------

  const agents = await payload.find({
    collection: 'agents',
    depth: 0,
    limit: 2,
    sort: 'name',
    overrideAccess: true,
    where: {
      agency: {
        equals: agencyId,
      },
    },
  })

  // ---------------------------------------------------------------------------
  // Existing demo offers
  // ---------------------------------------------------------------------------

  const existingOffers = await payload.find({
    collection: 'offers',
    depth: 0,
    limit: 10,
    overrideAccess: true,
    where: {
      reference: {
        in: [...demoReferences],
      },
    },
  })

  const existingReferences = new Set(existingOffers.docs.map((offer) => offer.reference))

  const now = new Date()

  const seeds = [
    {
      reference: demoReferences[0],
      property: String(properties.docs[0].id),
      buyer: String(buyers.docs[0].id),
      agent: agents.docs[0] ? String(agents.docs[0].id) : undefined,
      amount: 975000,
      status: 'submitted' as const,
      confidence: 'medium' as const,
      submittedAt: addDays(now, -1),
      expiresAt: addDays(now, 7),
      conditions:
        'Subject to mortgage approval, a satisfactory survey and confirmation of the preferred entry date.',
      vendorResponse:
        'The vendor is considering the offer and has asked for clarification on the proposed settlement date.',
      buyerResponse: 'The buyer has an agreement in principle and can proceed quickly.',
      internalNotes: 'Follow up with the vendor tomorrow morning if no response has been received.',
    },
    {
      reference: demoReferences[1],
      property: String(properties.docs[1].id),
      buyer: String(buyers.docs[1].id),
      agent: agents.docs[1]
        ? String(agents.docs[1].id)
        : agents.docs[0]
          ? String(agents.docs[0].id)
          : undefined,
      amount: 1250000,
      status: 'negotiating' as const,
      confidence: 'high' as const,
      submittedAt: addDays(now, -3),
      expiresAt: addDays(now, 4),
      conditions:
        'Subject to finance, legal due diligence and inclusion of selected fixtures and fittings.',
      vendorResponse: 'The vendor has requested an increased offer and an earlier settlement date.',
      buyerResponse: 'The buyer may increase the offer if the preferred entry date can be agreed.',
      internalNotes: 'Active negotiation. Contact both parties again this afternoon.',
    },
  ]

  let created = 0
  let skipped = 0

  for (const seed of seeds) {
    if (existingReferences.has(seed.reference)) {
      console.log(`Skipping ${seed.reference}: already exists.`)
      skipped += 1
      continue
    }

    const offer = await payload.create({
      collection: 'offers',
      overrideAccess: true,
      data: {
        ...seed,
        agency: agencyId,
        currency: 'GBP',
      },
    })

    console.log(
      `Created ${offer.reference}: £${Number(offer.amount).toLocaleString('en-GB')} (${offer.status})`,
    )

    created++
  }

  console.log('')
  console.log('Offer seed complete.')
  console.log(`Created: ${created}`)
  console.log(`Skipped: ${skipped}`)

  process.exit(0)
}

main().catch((error) => {
  console.error('')
  console.error('Could not seed offers.')
  console.error(error)
  process.exit(1)
})
