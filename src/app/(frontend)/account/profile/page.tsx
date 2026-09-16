import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import {
  BuyerPasswordForm,
  BuyerProfileDetails,
  BuyerProfileForm,
} from '@/components/BuyerWorkspace/Profile'

function getAgencyName(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  if ('name' in value && typeof value.name === 'string') {
    return value.name
  }

  return null
}

export default async function BuyerProfilePage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'buyers') {
    redirect('/login')
  }

  const buyer = await payload.findByID({
    collection: 'buyers',
    id: user.id,
    depth: 1,
    overrideAccess: true,
  })

  return (
    <div className="space-y-10">
      <header className="border-b border-black/10 pb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">Account</p>

        <h1 className="mt-4 text-4xl font-medium tracking-tight md:text-6xl">Profile</h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
          Manage your personal information, property notifications and account preferences.
        </p>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <BuyerProfileForm
            buyer={{
              name: buyer.name,
              email: buyer.email,
              alertsEnabled: buyer.alertsEnabled,
            }}
          />

          <BuyerPasswordForm />
        </div>

        <div className="self-start xl:sticky xl:top-8">
          <BuyerProfileDetails
            email={buyer.email}
            agencyName={getAgencyName(buyer.agency)}
            lastActiveAt={buyer.lastActiveAt}
            createdAt={buyer.createdAt}
            updatedAt={buyer.updatedAt}
          />
        </div>
      </div>
    </div>
  )
}
