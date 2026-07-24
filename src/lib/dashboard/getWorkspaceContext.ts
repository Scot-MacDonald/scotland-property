import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import { getRelationshipId } from './workspaceHelpers'

export async function getWorkspaceContext() {
  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'users') {
    redirect('/login')
  }

  const agencyId = getRelationshipId(user.agency)
  const isSuperAdmin = user.role === 'super-admin'

  if (!isSuperAdmin && !agencyId) {
    redirect('/dashboard')
  }

  return {
    payload,
    user,
    agencyId,
    isSuperAdmin,
  }
}

type AssertWorkspaceOwnershipArgs = {
  recordAgency: unknown
  agencyId: string | null
  isSuperAdmin: boolean
}

export function assertWorkspaceOwnership({
  recordAgency,
  agencyId,
  isSuperAdmin,
}: AssertWorkspaceOwnershipArgs): void {
  if (isSuperAdmin) {
    return
  }

  const recordAgencyId = getRelationshipId(
    recordAgency as
      | string
      | number
      | {
          id?: string | number
        }
      | null
      | undefined,
  )

  if (!agencyId || recordAgencyId !== agencyId) {
    notFound()
  }
}
