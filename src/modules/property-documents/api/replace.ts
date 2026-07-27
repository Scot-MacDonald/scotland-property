import configPromise from '@payload-config'
import { createLocalReq, getPayload } from 'payload'

import { workspaceError } from '@/lib/propertyWorkspace/error'
import { requirePropertyAccess } from '@/lib/propertyWorkspace/requirePropertyAccess'
import { workspaceSuccess } from '@/lib/propertyWorkspace/success'

type RelationshipValue =
  | string
  | number
  | {
      id?: string | number
    }
  | null
  | undefined

function getRelationshipId(value: RelationshipValue): string | null {
  if (!value) {
    return null
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (value.id === undefined) {
    return null
  }

  return String(value.id)
}

export async function replacePropertyDocument(request: Request) {
  let uploadedMediaId: string | null = null
  let archivedVersionId: string | null = null

  try {
    const formData = await request.formData()

    const documentIdValue = formData.get('documentId')
    const documentId = typeof documentIdValue === 'string' ? documentIdValue.trim() : ''

    const file = formData.get('file')

    const notesValue = formData.get('notes')
    const notes = typeof notesValue === 'string' ? notesValue.trim() || null : null

    if (!documentId) {
      return workspaceError(new Error('Document ID is required.'), {
        status: 400,
      })
    }

    if (!(file instanceof File) || file.size === 0) {
      return workspaceError(new Error('Please select a replacement file.'), {
        status: 400,
      })
    }

    const payload = await getPayload({
      config: configPromise,
    })

    const { user } = await payload.auth({
      headers: request.headers,
    })

    if (!user || user.collection !== 'users') {
      return workspaceError(new Error('You must be logged in.'), {
        status: 401,
      })
    }

    const req = await createLocalReq(
      {
        user,
      },
      payload,
    )

    const propertyDocument = await payload.findByID({
      collection: 'property-documents',
      id: documentId,
      depth: 0,
      overrideAccess: true,
      req,
    })

    const propertyId = getRelationshipId(propertyDocument.property)
    const agencyId = getRelationshipId(propertyDocument.agency)
    const currentFileId = getRelationshipId(propertyDocument.file)
    const previousUploadedById = getRelationshipId(propertyDocument.uploadedBy)

    if (!propertyId || !agencyId) {
      return workspaceError(new Error('This document is not assigned to a property or agency.'), {
        status: 400,
      })
    }

    if (!currentFileId) {
      return workspaceError(new Error('This document does not currently have a file to archive.'), {
        status: 400,
      })
    }

    await requirePropertyAccess(propertyId, {
      payload,
      user,
    })

    const currentVersion =
      typeof propertyDocument.version === 'number' && Number.isFinite(propertyDocument.version)
        ? Math.max(1, Math.floor(propertyDocument.version))
        : 1

    const nextVersion = currentVersion + 1

    const buffer = Buffer.from(await file.arrayBuffer())

    /*
     * Upload the replacement media first.
     * The current document isn't touched until everything succeeds.
     */
    const uploadedMedia = await payload.create({
      collection: 'media',
      overrideAccess: true,
      user,
      req,
      data: {
        alt: `${propertyDocument.title} version ${nextVersion}`,
      },
      file: {
        data: buffer,
        mimetype: file.type || 'application/octet-stream',
        name: file.name,
        size: file.size,
      },
    })

    uploadedMediaId = String(uploadedMedia.id)

    /*
     * Archive the current live document.
     */
    const archivedVersion = await payload.create({
      collection: 'property-document-versions',
      overrideAccess: true,
      user,
      req,
      data: {
        label: `Version ${currentVersion}`,
        document: documentId,
        property: propertyId,
        agency: agencyId,
        file: currentFileId,
        version: currentVersion,
        uploadedBy: previousUploadedById || user.id,
        notes,
      },
    })

    archivedVersionId = String(archivedVersion.id)

    /*
     * Promote the new upload to become the live document.
     */
    const updatedDocument = await payload.update({
      collection: 'property-documents',
      id: documentId,
      overrideAccess: true,
      user,
      req,
      depth: 1,
      data: {
        file: uploadedMediaId,
        version: nextVersion,
        uploadedBy: user.id,
      },
    })

    return workspaceSuccess({
      document: updatedDocument,
      archivedVersion,
      message: `File replaced successfully. Version ${nextVersion} is now current.`,
    })
  } catch (error) {
    /*
     * Roll back anything created during this replacement attempt.
     * The existing live document is never deleted.
     */
    try {
      const payload = await getPayload({
        config: configPromise,
      })

      if (archivedVersionId) {
        await payload.delete({
          collection: 'property-document-versions',
          id: archivedVersionId,
          overrideAccess: true,
        })
      }

      if (uploadedMediaId) {
        await payload.delete({
          collection: 'media',
          id: uploadedMediaId,
          overrideAccess: true,
        })
      }
    } catch {
      // Preserve the original error.
    }

    return workspaceError(error)
  }
}
