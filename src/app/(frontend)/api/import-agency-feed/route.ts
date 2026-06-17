import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

function createSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function GET() {
  const payload = await getPayload({ config: configPromise })

  const agencies = await payload.find({
    collection: 'agencies',
    limit: 1,
    where: {
      'crm.enabled': {
        equals: true,
      },
    },
    overrideAccess: true,
  })

  const agency = agencies.docs[0]

  if (!agency) {
    return NextResponse.json({
      ok: false,
      message: 'No agency with CRM enabled found.',
    })
  }

  if (agency.crm?.type !== 'generic-xml') {
    return NextResponse.json({
      ok: false,
      agency: agency.name,
      message: `CRM type "${agency.crm?.type}" is not importable yet.`,
    })
  }

  if (!agency.crm?.feedUrl) {
    return NextResponse.json({
      ok: false,
      agency: agency.name,
      message: 'CRM feed URL is missing.',
    })
  }

  try {
    const res = await fetch(agency.crm.feedUrl)

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        agency: agency.name,
        feedUrl: agency.crm.feedUrl,
        status: res.status,
        message: 'Feed could not be fetched.',
      })
    }

    const xml = await res.text()

    const parser = new XMLParser({
      ignoreAttributes: false,
    })

    const parsed = parser.parse(xml)

    const rawProperties = parsed?.properties?.property
    const feedProperties = Array.isArray(rawProperties)
      ? rawProperties
      : rawProperties
        ? [rawProperties]
        : []

    let created = 0
    let updated = 0
    let skipped = 0

    for (const feedProperty of feedProperties) {
      const reference = String(feedProperty.reference || '').trim()

      if (!reference) {
        skipped++
        continue
      }

      const title = String(feedProperty.title || 'Imported property')
      const slug = createSlug(`${title}-${reference}`)

      const regionName = String(feedProperty.region || '').trim()
      const townName = String(feedProperty.town || '').trim()

      const regionResult = regionName
        ? await payload.find({
            collection: 'regions',
            limit: 1,
            where: {
              name: {
                equals: regionName,
              },
            },
            overrideAccess: true,
          })
        : null

      const townResult = townName
        ? await payload.find({
            collection: 'towns',
            limit: 1,
            where: {
              name: {
                equals: townName,
              },
            },
            overrideAccess: true,
          })
        : null

      const region = regionResult?.docs[0]
      const town = townResult?.docs[0]

      if (!region || !town) {
        skipped++
        continue
      }

      const existing = await payload.find({
        collection: 'properties',
        limit: 1,
        where: {
          reference: {
            equals: reference,
          },
        },
        overrideAccess: true,
      })

      const propertyData = {
        title,
        slug,
        reference,
        price: Number(feedProperty.price || 0),
        bedrooms: Number(feedProperty.bedrooms || 0),
        bathrooms: Number(feedProperty.bathrooms || 0),
        latitude: Number(feedProperty.latitude || 0),
        longitude: Number(feedProperty.longitude || 0),
        excerpt: String(feedProperty.description || ''),
        agency: agency.id,
        region: region.id,
        town: town.id,
      }

      if (existing.docs[0]) {
        await payload.update({
          collection: 'properties',
          id: existing.docs[0].id,
          data: propertyData,
          overrideAccess: true,
        })

        updated++
      } else {
        await payload.create({
          collection: 'properties',
          data: propertyData,
          overrideAccess: true,
        })

        created++
      }
    }

    return NextResponse.json({
      ok: true,
      agency: agency.name,
      feedUrl: agency.crm.feedUrl,
      found: feedProperties.length,
      created,
      updated,
      skipped,
      message: 'Feed imported successfully.',
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      agency: agency.name,
      feedUrl: agency.crm.feedUrl,
      message: 'Feed import failed.',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
