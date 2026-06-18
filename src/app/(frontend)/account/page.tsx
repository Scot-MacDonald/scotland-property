import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'
import { BuyerHub } from '@/components/BuyerHub'

export default async function AccountPage() {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'buyers') {
    return (
      <main className="mx-auto w-full max-w-[720px] px-4 py-16">
        <div className="border p-8">
          <h1 className="text-3xl font-medium">Please log in</h1>

          <p className="mt-4 text-muted-foreground">
            Log in to view your saved properties, searches and alerts.
          </p>

          <div className="mt-6 flex gap-3">
            <Link href="/login" className="bg-black px-6 py-3 text-white">
              Login
            </Link>

            <Link href="/register" className="border px-6 py-3">
              Register
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const savedPropertiesCount = Array.isArray(user.savedProperties) ? user.savedProperties.length : 0

  const savedSearchesCount = Array.isArray(user.savedSearches) ? user.savedSearches.length : 0

  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">My Property Hub</p>

        <h1 className="mt-2 text-5xl font-medium tracking-tight">Your property activity</h1>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Welcome back{user.name ? `, ${user.name}` : ''}. Keep track of saved homes, saved searches
          and properties you recently viewed.
        </p>
      </div>

      <BuyerHub
        savedPropertiesCount={savedPropertiesCount}
        savedSearchesCount={savedSearchesCount}
      />
    </main>
  )
}
