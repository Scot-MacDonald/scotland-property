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

  const savedPropertiesCount = Array.isArray(user.savedProperties) ? user.savedProperties.length : 0

  const savedSearchesCount = Array.isArray(user.savedSearches) ? user.savedSearches.length : 0

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
        buyerName={user.name}
        buyerEmail={user.email}
        navigationCounts={{
          savedProperties: savedPropertiesCount,
          savedSearches: savedSearchesCount,
        }}
      >
        {children}
      </BuyerWorkspaceLayout>
    </>
  )
}
