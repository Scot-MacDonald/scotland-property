import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import {
  BuyerViewingsEmptyState,
  BuyerViewingsList,
  type BuyerViewing,
} from '@/components/BuyerWorkspace/Viewings'

function getRelationshipId(value: unknown): string | null {
  if (!value) return null

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'object' && 'id' in value && value.id) {
    return String(value.id)
  }

  return null
}

function getProperty(value: unknown): BuyerViewing['property'] | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const id = getRelationshipId(value)

  if (!id) {
    return null
  }

  const property = value as {
    title?: string | null
    reference?: string | null
    slug?: string | null
    latitude?: number | null
    longitude?: number | null
  }

  return {
    id,
    title: property.title?.trim() || property.reference?.trim() || 'Untitled property',
    slug: property.slug || null,
    latitude: property.latitude,
    longitude: property.longitude,
  }
}

function getAgent(value: unknown): BuyerViewing['agent'] {
  if (!value || typeof value !== 'object') {
    return null
  }

  const id = getRelationshipId(value)

  if (!id) {
    return null
  }

  const agent = value as {
    name?: string | null
    email?: string | null
    phone?: string | null
    jobTitle?: string | null
  }

  return {
    id,
    name: agent.name?.trim() || agent.email?.trim() || 'Agent',
    email: agent.email,
    phone: agent.phone,
    jobTitle: agent.jobTitle,
  }
}

export default async function BuyerViewingsPage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'buyers') {
    redirect('/login')
  }

  const result = await payload.find({
    collection: 'viewings',
    depth: 2,
    limit: 100,
    pagination: false,
    sort: 'dateTime',
    overrideAccess: true,
    where: {
      buyer: {
        equals: String(user.id),
      },
    },
  })

  const viewings = result.docs
    .map((viewing): BuyerViewing | null => {
      const property = getProperty(viewing.property)

      if (!property) {
        return null
      }

      return {
        id: String(viewing.id),
        dateTime: viewing.dateTime,
        durationMinutes: viewing.durationMinutes || 60,
        status: viewing.status,
        contactName: viewing.contactName,
        contactEmail: viewing.contactEmail,
        contactPhone: viewing.contactPhone,
        property,
        agent: getAgent(viewing.agent),
        viewerRating: viewing.viewerRating,
        viewingOutcome: viewing.viewingOutcome,
        feedback: viewing.feedback,
      }
    })
    .filter((viewing): viewing is BuyerViewing => Boolean(viewing))

  const now = new Date().getTime()

  const upcomingViewings = viewings
    .filter(
      (viewing) =>
        new Date(viewing.dateTime).getTime() >= now &&
        viewing.status !== 'completed' &&
        viewing.status !== 'cancelled' &&
        viewing.status !== 'no-show',
    )
    .sort(
      (first, second) => new Date(first.dateTime).getTime() - new Date(second.dateTime).getTime(),
    )

  const pastViewings = viewings
    .filter((viewing) => !upcomingViewings.some((upcoming) => upcoming.id === viewing.id))
    .sort(
      (first, second) => new Date(second.dateTime).getTime() - new Date(first.dateTime).getTime(),
    )

  return (
    <div className="space-y-12">
      <header className="border-b border-black/10 pb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">Property Appointments</p>

        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-medium tracking-tight md:text-6xl">Viewings</h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
              Review upcoming appointments, contact your agent and revisit completed property
              viewings.
            </p>
          </div>

          <p className="text-sm text-black/50">
            {viewings.length} {viewings.length === 1 ? 'viewing' : 'viewings'}
          </p>
        </div>
      </header>

      {viewings.length === 0 ? (
        <BuyerViewingsEmptyState />
      ) : (
        <>
          <section>
            <div className="mb-5 flex items-center gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
                Upcoming
              </h2>

              <span className="h-px flex-1 bg-black/10" />

              <span className="text-sm text-black/45">{upcomingViewings.length}</span>
            </div>

            {upcomingViewings.length > 0 ? (
              <BuyerViewingsList viewings={upcomingViewings} />
            ) : (
              <BuyerViewingsEmptyState
                title="No upcoming viewings"
                description="Confirmed and requested future appointments will appear here."
              />
            )}
          </section>

          {pastViewings.length > 0 ? (
            <section>
              <div className="mb-5 flex items-center gap-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
                  Past
                </h2>

                <span className="h-px flex-1 bg-black/10" />

                <span className="text-sm text-black/45">{pastViewings.length}</span>
              </div>

              <BuyerViewingsList viewings={pastViewings} />
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}
