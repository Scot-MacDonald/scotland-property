import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { BuyerWorkspaceLayout } from '@/components/BuyerWorkspace/Layout'

type AccountLayoutProps = {
  children: ReactNode
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'buyers') {
    redirect('/login')
  }

  const [buyer, viewingsResult, offersResult] = await Promise.all([
    payload.findByID({
      collection: 'buyers',
      id: user.id,
      depth: 0,
      overrideAccess: true,
    }),

    payload.find({
      collection: 'viewings',
      depth: 0,
      limit: 0,
      pagination: true,
      overrideAccess: true,
      where: {
        buyer: {
          equals: String(user.id),
        },
      },
    }),

    payload.find({
      collection: 'offers',
      depth: 0,
      limit: 0,
      pagination: true,
      overrideAccess: true,
      where: {
        buyer: {
          equals: String(user.id),
        },
      },
    }),
  ])

  const savedPropertiesCount = Array.isArray(buyer.savedProperties)
    ? buyer.savedProperties.length
    : 0

  const savedSearchesCount = Array.isArray(buyer.savedSearches) ? buyer.savedSearches.length : 0

  const recentlyViewedCount = Array.isArray(buyer.recentlyViewed) ? buyer.recentlyViewed.length : 0

  const viewingsCount = viewingsResult.totalDocs

  const offersCount = offersResult.totalDocs

  return (
    <>
      <style>{`
        [data-public-site-chrome='admin-bar'],
        [data-public-site-chrome='header'],
        [data-public-site-chrome='footer'] {
          display: none !important;
        }
      `}</style>

      <BuyerWorkspaceLayout
        buyerName={buyer.name}
        buyerEmail={buyer.email}
        navigationCounts={{
          savedProperties: savedPropertiesCount,
          savedSearches: savedSearchesCount,
          recentlyViewed: recentlyViewedCount,
          viewings: viewingsCount,
          offers: offersCount,
        }}
      >
        {children}
      </BuyerWorkspaceLayout>
    </>
  )
}
