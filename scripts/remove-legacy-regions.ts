import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({
  config: configPromise,
})

const LEGACY_SLUGS = ['edinburgh-lothians', 'highlands']

console.log('\n=== REMOVING LEGACY REGIONS ===')

for (const slug of LEGACY_SLUGS) {
  const result = await payload.find({
    collection: 'regions',
    limit: 1,
    depth: 0,
    where: {
      slug: {
        equals: slug,
      },
    },
    overrideAccess: true,
  })

  const region = result.docs[0]

  if (!region) {
    console.log(`✓ Already removed: ${slug}`)
    continue
  }

  const [townReferences, propertyReferences] = await Promise.all([
    payload.find({
      collection: 'towns',
      limit: 1,
      depth: 0,
      where: {
        region: {
          equals: region.id,
        },
      },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'properties',
      limit: 1,
      depth: 0,
      where: {
        region: {
          equals: region.id,
        },
      },
      overrideAccess: true,
    }),
  ])

  if (townReferences.totalDocs > 0 || propertyReferences.totalDocs > 0) {
    console.log(`! NOT deleting ${region.name}`)
    console.log({
      towns: townReferences.totalDocs,
      properties: propertyReferences.totalDocs,
    })
    continue
  }

  await payload.delete({
    collection: 'regions',
    id: region.id,
    overrideAccess: true,
  })

  console.log(`✓ Deleted: ${region.name}`)
}

console.log('\n=== COMPLETE ===')

process.exit(0)
