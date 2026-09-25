import { getPayload } from 'payload'

import config from '../src/payload.config'

const PROPERTY_TYPES = [
  // Residential
  { name: 'House', slug: 'house' },
  { name: 'Flat / Apartment', slug: 'flat-apartment' },
  { name: 'Cottage', slug: 'cottage' },
  { name: 'Bungalow', slug: 'bungalow' },
  { name: 'Townhouse', slug: 'townhouse' },
  { name: 'Villa', slug: 'villa' },

  // Country & Luxury
  { name: 'Country House', slug: 'country-house' },
  { name: 'Estate', slug: 'estate' },
  { name: 'Sporting Estate', slug: 'sporting-estate' },
  { name: 'Castle', slug: 'castle' },
  { name: 'Lodge / Chalet', slug: 'lodge-chalet' },

  // Rural
  { name: 'Farm / Farmhouse', slug: 'farm-farmhouse' },
  { name: 'Croft', slug: 'croft' },
  { name: 'Equestrian', slug: 'equestrian' },

  // Land & Forestry
  { name: 'Land', slug: 'land' },
  { name: 'Building Plot', slug: 'building-plot' },
  { name: 'Woodland / Forestry', slug: 'woodland-forestry' },
  {
    name: 'Development / Investment',
    slug: 'development-investment',
  },

  // Commercial
  { name: 'Commercial', slug: 'commercial' },
] as const

async function run() {
  const payload = await getPayload({ config })

  console.log('\nResetting Property Types...\n')

  const existingTypes = await payload.find({
    collection: 'property-types',
    limit: 1000,
    overrideAccess: true,
  })

  console.log(`Found ${existingTypes.totalDocs} existing Property Types.`)

  //
  // These are currently demo records, so remove their references
  // from demo properties before deleting them.
  //
  const properties = await payload.find({
    collection: 'properties',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
  })

  for (const property of properties.docs) {
    if (!property.propertyType) continue

    await payload.update({
      collection: 'properties',
      id: property.id,
      data: {
        propertyType: null,
      },
      overrideAccess: true,
    })

    console.log(`Cleared type from property: ${property.title}`)
  }

  for (const propertyType of existingTypes.docs) {
    await payload.delete({
      collection: 'property-types',
      id: propertyType.id,
      overrideAccess: true,
    })

    console.log(`Deleted: ${propertyType.name}`)
  }

  console.log('\nCreating canonical Property Types...\n')

  for (const propertyType of PROPERTY_TYPES) {
    await payload.create({
      collection: 'property-types',
      data: {
        name: propertyType.name,
        slug: propertyType.slug,
      },
      overrideAccess: true,
    })

    console.log(`Created: ${propertyType.name} → ${propertyType.slug}`)
  }

  console.log(`\nDone. Created ${PROPERTY_TYPES.length} Property Types.\n`)

  process.exit(0)
}

run().catch((error) => {
  console.error('\nProperty Type reset failed:\n')
  console.error(error)
  process.exit(1)
})
