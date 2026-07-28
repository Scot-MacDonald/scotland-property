import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'

import { createDocumentDeletedActivity } from '@/lib/activity/createPropertyDocumentActivities'
import { requirePropertyAccess } from '@/lib/propertyWorkspace/requirePropertyAccess'
import { workspaceError } from '@/lib/propertyWorkspace/error'
import { workspaceSuccess } from '@/lib/propertyWorkspace/success'

type DeleteDocumentBody = {
  documentId?: string
}

function getRelationshipId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null
  return typeof value === 'string' ? value : value.id
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DeleteDocumentBody
    const documentId = body.documentId?.trim()

    if (!documentId) {
      return workspaceError(new Error('Document ID is required.'), {
        status: 400,
      })
    }

    const payload = await getPayload({
      config: configPromise,
    })

    const requestHeaders = await headers()

    const { user } = await payload.auth({
      headers: requestHeaders,
    })

    if (!user) {
      return workspaceError(new Error('You must be logged in.'), {
        status: 401,
      })
    }

    const document = await payload.findByID({
      collection: 'property-documents',
      id: documentId,
      depth: 0,
      overrideAccess: false,
      user,
    })

    const propertyId = getRelationshipId(document.property)

    if (!propertyId) {
      return workspaceError(new Error('This document is not assigned to a property.'), {
        status: 400,
      })
    }

    await requirePropertyAccess(propertyId)

    const agencyId = getRelationshipId(document.agency)

    await payload.delete({
      collection: 'property-documents',
      id: documentId,
      overrideAccess: true,
      user,
    })

    if (agencyId) {
      await createDocumentDeletedActivity({
        propertyId,
        agencyId,
        userId: String(user.id),
        documentId,
        documentTitle: document.title,
        version: typeof document.version === 'number' ? document.version : undefined,
      })
    }

    return workspaceSuccess({
      documentId,
      message: 'Document deleted successfully.',
    })
  } catch (error) {
    return workspaceError(error)
  }
}
