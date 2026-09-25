import 'dotenv/config'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const COUNCIL_AREAS = [
  ['Aberdeen City', 'aberdeen-city'],
  ['Aberdeenshire', 'aberdeenshire'],
  ['Angus', 'angus'],
  ['Argyll and Bute', 'argyll-and-bute'],
  ['City of Edinburgh', 'city-of-edinburgh'],
  ['Clackmannanshire', 'clackmannanshire'],
  ['Dumfries and Galloway', 'dumfries-and-galloway'],
  ['Dundee City', 'dundee-city'],
  ['East Ayrshire', 'east-ayrshire'],
  ['East Dunbartonshire', 'east-dunbartonshire'],
  ['East Lothian', 'east-lothian'],
  ['East Renfrewshire', 'east-renfrewshire'],
  ['Falkirk', 'falkirk'],
  ['Fife', 'fife'],
  ['Glasgow City', 'glasgow-city'],
  ['Highland', 'highland'],
  ['Inverclyde', 'inverclyde'],
  ['Midlothian', 'midlothian'],
  ['Moray', 'moray'],
  ['Na h-Eileanan Siar', 'na-h-eileanan-siar'],
  ['North Ayrshire', 'north-ayrshire'],
  ['North Lanarkshire', 'north-lanarkshire'],
  ['Orkney Islands', 'orkney-islands'],
  ['Perth and Kinross', 'perth-and-kinross'],
  ['Renfrewshire', 'renfrewshire'],
  ['Scottish Borders', 'scottish-borders'],
  ['Shetland Islands', 'shetland-islands'],
  ['South Ayrshire', 'south-ayrshire'],
  ['South Lanarkshire', 'south-lanarkshire'],
  ['Stirling', 'stirling'],
  ['West Dunbartonshire', 'west-dunbartonshire'],
  ['West Lothian', 'west-lothian'],
] as const

const TOWN_COUNCIL_AREA: Record<string, string> = {
  'fort-william': 'highland',
  inverness: 'highland',
  oban: 'argyll-and-bute',
}

const payload = await getPayload({
  config: configPromise,
})

const countryResult = await payload.find({
  collection: 'countries',
  limit: 1,
  depth: 0,
  where: {
    slug: {
      equals: 'scotland',
    },
  },
  overrideAccess: true,
})

const scotland = countryResult.docs[0]

if (!scotland) {
  throw new Error('Scotland country record was not found.')
}

console.log(`Scotland: ${scotland.id}`)
console.log('\n=== UPSERTING COUNCIL AREAS ===')

const regionBySlug = new Map<string, string>()

for (const [name, slug] of COUNCIL_AREAS) {
  const existing = await payload.find({
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

  if (existing.docs[0]) {
    const region = await payload.update({
      collection: 'regions',
      id: existing.docs[0].id,
      overrideAccess: true,
      data: {
        name,
        country: scotland.id,
      },
    })

    regionBySlug.set(slug, String(region.id))
    console.log(`✓ Existing: ${name}`)
    continue
  }

  const region = await payload.create({
    collection: 'regions',
    overrideAccess: true,
    data: {
      name,
      slug,
      country: scotland.id,
    },
  })

  regionBySlug.set(slug, String(region.id))
  console.log(`+ Created: ${name}`)
}

console.log('\n=== MIGRATING TOWNS ===')

const towns = await payload.find({
  collection: 'towns',
  limit: 500,
  depth: 0,
  overrideAccess: true,
})

for (const town of towns.docs) {
  const targetRegionSlug = TOWN_COUNCIL_AREA[town.slug]

  if (!targetRegionSlug) {
    console.log(`! No migration mapping for town: ${town.name}`)
    continue
  }

  const targetRegionId = regionBySlug.get(targetRegionSlug)

  if (!targetRegionId) {
    throw new Error(`Target region not found for ${town.name}: ${targetRegionSlug}`)
  }

  await payload.update({
    collection: 'towns',
    id: town.id,
    overrideAccess: true,
    data: {
      region: targetRegionId,
    },
  })

  console.log(`✓ ${town.name} → ${targetRegionSlug}`)
}

console.log('\n=== ALIGNING PROPERTY REGIONS WITH TOWNS ===')

const refreshedTowns = await payload.find({
  collection: 'towns',
  limit: 500,
  depth: 0,
  overrideAccess: true,
})

const townRegionById = new Map(
  refreshedTowns.docs.map((town) => [
    String(town.id),
    typeof town.region === 'object' && town.region
      ? String(town.region.id)
      : String(town.region),
  ]),
)

const properties = await payload.find({
  collection: 'properties',
  limit: 1000,
  depth: 0,
  overrideAccess: true,
})

let propertyUpdates = 0

for (const property of properties.docs) {
  const townId =
    typeof property.town === 'object' && property.town
      ? String(property.town.id)
      : String(property.town || '')

  const currentRegionId =
    typeof property.region === 'object' && property.region
      ? String(property.region.id)
      : String(property.region || '')

  const correctRegionId = townRegionById.get(townId)

  if (!correctRegionId) {
    console.log(`! Could not determine region for property: ${property.title}`)
    continue
  }

  if (currentRegionId === correctRegionId) {
    console.log(`✓ Already correct: ${property.title}`)
    continue
  }

  await payload.update({
    collection: 'properties',
    id: property.id,
    overrideAccess: true,
    data: {
      region: correctRegionId,
    },
  })

  propertyUpdates++
  console.log(`→ Corrected: ${property.title}`)
}

console.log('\n=== COMPLETE ===')
console.log({
  canonicalCouncilAreas: COUNCIL_AREAS.length,
  townsChecked: towns.totalDocs,
  propertiesChecked: properties.totalDocs,
  propertyUpdates,
})

console.log('\nOld broad region records have NOT been deleted.')

process.exit(0)
