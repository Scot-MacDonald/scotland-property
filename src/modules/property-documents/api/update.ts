import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { workspaceError } from '@/lib/propertyWorkspace/error'
import { requirePropertyAccess } from '@/lib/propertyWorkspace/requirePropertyAccess'
import { workspaceSuccess } from '@/lib/propertyWorkspace/success'
import { createDocumentUpdatedActivity } from '@/lib/activity/createPropertyDocumentActivities'
import type { DocumentCategory, DocumentVisibility, PropertyDocumentType } from '../types'

type UpdateDocumentBody = {
  documentId?: string
  title?: string
  category?: DocumentCategory
  documentType?: PropertyDocumentType
  visibility?: DocumentVisibility
  version?: number
  description?: string | null
}

function getRelationshipId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null
  return typeof value === 'string' ? value : value.id
}

const validCategories: DocumentCategory[] = ['marketing', 'legal', 'compliance', 'internal']

const validDocumentTypes: PropertyDocumentType[] = [
  'brochure',
  'floorplan',
  'home-report',
  'epc',
  'planning',
  'title-deed',
  'lease',
  'survey',
  'valuation',
  'vendor-contract',
  'sales-memorandum',
  'aml',
  'identity',
  'certificate',
  'solicitor-correspondence',
  'other',
]

const validVisibilities: DocumentVisibility[] = ['public', 'agency', 'admin']

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UpdateDocumentBody
    const documentId = body.documentId?.trim()

    if (!documentId) {
      return workspaceError(new Error('Document ID is required.'), {
        status: 400,
      })
    }

    const title = body.title?.trim()

    if (!title) {
      return workspaceError(new Error('Document title is required.'), {
        status: 400,
      })
    }

    if (!body.category || !validCategories.includes(body.category)) {
      return workspaceError(new Error('A valid category is required.'), {
        status: 400,
      })
    }

    if (!body.documentType || !validDocumentTypes.includes(body.documentType)) {
      return workspaceError(new Error('A valid document type is required.'), {
        status: 400,
      })
    }

    if (!body.visibility || !validVisibilities.includes(body.visibility)) {
      return workspaceError(new Error('A valid visibility is required.'), {
        status: 400,
      })
    }

    const payload = await getPayload({
      config: configPromise,
    })

    /*
     * Use the headers from the incoming fetch request. This ensures the
     * Payload authentication cookie is passed into payload.auth().
     */
    const { user } = await payload.auth({
      headers: request.headers,
    })

    if (!user || user.collection !== 'users') {
      return workspaceError(new Error('You must be logged in.'), {
        status: 401,
      })
    }

    const propertyDocument = await payload.findByID({
      collection: 'property-documents',
      id: documentId,
      depth: 0,
      overrideAccess: true,
    })

    const propertyId = getRelationshipId(propertyDocument.property)

    if (!propertyId) {
      return workspaceError(new Error('This document is not assigned to a property.'), {
        status: 400,
      })
    }

    await requirePropertyAccess(propertyId, {
      payload,
      user,
    })

    const updatedDocument = await payload.update({
      collection: 'property-documents',
      id: documentId,
      overrideAccess: true,
      user,
      data: {
        title,
        category: body.category,
        documentType: body.documentType,
        visibility: body.visibility,

        description: body.description?.trim() || null,
      },
    })

    const agencyId = getRelationshipId(propertyDocument.agency)

    if (agencyId) {
      await createDocumentUpdatedActivity({
        propertyId,
        agencyId,
        userId: String(user.id),
        documentId,
        documentTitle: updatedDocument.title,
        updatedFields: ['title', 'category', 'documentType', 'visibility', 'description'],
      })
    }

    return workspaceSuccess({
      document: updatedDocument,
      message: 'Document updated successfully.',
    })
  } catch (error) {
    return workspaceError(error)
  }
}
