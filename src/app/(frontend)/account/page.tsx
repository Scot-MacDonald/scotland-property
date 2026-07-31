import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { BuyerQuickActions, BuyerStatCard } from '@/components/BuyerWorkspace/Dashboard'
import { BuyerWorkspacePanel, BuyerWorkspaceSectionTitle } from '@/components/BuyerWorkspace/Shared'
import { RecentlyViewedPreview } from '@/components/RecentlyViewedPreview'
import { SavedPropertiesPreview } from '@/components/SavedPropertiesPreview'

export default async function AccountPage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'buyers') {
    redirect('/login')
  }

  const savedPropertiesCount = Array.isArray(user.savedProperties) ? user.savedProperties.length : 0

  const savedSearchesCount = Array.isArray(user.savedSearches) ? user.savedSearches.length : 0

  return (
    <div className="space-y-14">
      <header className="border-b border-black/10 pb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">My Property Hub</p>

        <h1 className="mt-4 max-w-4xl text-4xl font-medium tracking-tight md:text-6xl">
          Welcome back{user.name ? `, ${user.name}` : ''}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
          Keep track of the homes that interest you, manage searches and follow your property
          activity in one place.
        </p>
      </header>

      <section>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <BuyerStatCard
            eyebrow="Favourites"
            value={savedPropertiesCount}
            label="Saved properties"
            href="/account/saved-properties"
          />

          <BuyerStatCard
            eyebrow="Alerts"
            value={savedSearchesCount}
            label="Saved searches"
            href="/account/saved-searches"
          />

          <BuyerStatCard
            eyebrow="Appointments"
            value={0}
            label="Upcoming viewings"
            href="/account/viewings"
          />

          <BuyerStatCard
            eyebrow="Negotiations"
            value={0}
            label="Active offers"
            href="/account/offers"
          />
        </div>
      </section>

      <BuyerWorkspacePanel>
        <BuyerWorkspaceSectionTitle
          eyebrow="Favourites"
          title="Saved properties"
          description="Return to the homes you have shortlisted and compare your favourites."
          href="/account/saved-properties"
        />

        <div className="p-6">
          {savedPropertiesCount > 0 ? (
            <SavedPropertiesPreview />
          ) : (
            <div className="flex min-h-56 flex-col items-start justify-center border border-dashed border-black/20 p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-black/40">
                No saved properties
              </p>

              <h3 className="mt-3 text-2xl font-medium">Start building your shortlist</h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-black/55">
                Save properties while browsing and they will appear here for easy access.
              </p>

              <Link href="/properties" className="mt-6 bg-black px-5 py-3 text-sm text-white">
                Browse properties
              </Link>
            </div>
          )}
        </div>
      </BuyerWorkspacePanel>

      <BuyerQuickActions />

      <BuyerWorkspacePanel>
        <BuyerWorkspaceSectionTitle
          eyebrow="History"
          title="Recently viewed"
          description="Quickly return to properties you explored recently."
          href="/account/recently-viewed"
        />

        <div className="p-6">
          <RecentlyViewedPreview />
        </div>
      </BuyerWorkspacePanel>
    </div>
  )
}
