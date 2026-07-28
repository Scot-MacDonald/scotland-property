import configPromise from '@payload-config'
import { createLocalReq, getPayload } from 'payload'
import { createDocumentRestoredActivity } from '@/lib/activity/createPropertyDocumentActivities'
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

type RestoreRequestBody = {
  documentId?: unknown
  versionId?: unknown
  notes?: unknown
}

export async function restorePropertyDocument(request: Request) {
  let archivedVersionId: string | null = null

  try {
    const body = (await request.json()) as RestoreRequestBody

    const documentId = typeof body.documentId === 'string' ? body.documentId.trim() : ''
    const versionId = typeof body.versionId === 'string' ? body.versionId.trim() : ''
    const notes = typeof body.notes === 'string' ? body.notes.trim() || null : null

    if (!documentId) {
      return workspaceError(new Error('Document ID is required.'), {
        status: 400,
      })
    }

    if (!versionId) {
      return workspaceError(new Error('Version ID is required.'), {
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

    const selectedVersion = await payload.findByID({
      collection: 'property-document-versions',
      id: versionId,
      depth: 0,
      overrideAccess: true,
      req,
    })

    const selectedDocumentId = getRelationshipId(selectedVersion.document)
    const selectedPropertyId = getRelationshipId(selectedVersion.property)
    const selectedAgencyId = getRelationshipId(selectedVersion.agency)
    const selectedFileId = getRelationshipId(selectedVersion.file)

    if (selectedDocumentId !== documentId) {
      return workspaceError(new Error('The selected version does not belong to this document.'), {
        status: 400,
      })
    }

    if (selectedPropertyId !== propertyId || selectedAgencyId !== agencyId) {
      return workspaceError(
        new Error('The selected version does not belong to this property or agency.'),
        {
          status: 400,
        },
      )
    }

    if (!selectedFileId) {
      return workspaceError(new Error('The selected version does not contain a restorable file.'), {
        status: 400,
      })
    }

    const currentVersion =
      typeof propertyDocument.version === 'number' && Number.isFinite(propertyDocument.version)
        ? Math.max(1, Math.floor(propertyDocument.version))
        : 1

    const restoredFromVersion =
      typeof selectedVersion.version === 'number' && Number.isFinite(selectedVersion.version)
        ? Math.max(1, Math.floor(selectedVersion.version))
        : null

    const nextVersion = currentVersion + 1

    const archiveNotes = restoredFromVersion
      ? `Archived automatically before restoring Version ${restoredFromVersion}.`
      : 'Archived automatically before restoring a previous version.'

    /*
     * Preserve the current file before changing anything on the live
     * property document.
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
        notes: archiveNotes,
      },
    })

    archivedVersionId = String(archivedVersion.id)

    /*
     * Promote the historical file back to the current document.
     * The document continues forward to the next version number rather
     * than reverting its version counter.
     */
    const updatedDocument = await payload.update({
      collection: 'property-documents',
      id: documentId,
      overrideAccess: true,
      user,
      req,
      depth: 1,
      data: {
        file: selectedFileId,
        version: nextVersion,
        uploadedBy: user.id,
      },
    })

    await createDocumentRestoredActivity({
      propertyId,
      agencyId,
      userId: String(user.id),
      documentId,
      documentTitle: propertyDocument.title,
      restoredVersion: restoredFromVersion ?? currentVersion,
      previousCurrentVersion: currentVersion,
      currentVersion: nextVersion,
    })

    const restoredVersionLabel = restoredFromVersion
      ? `Version ${restoredFromVersion}`
      : 'the selected version'

    return workspaceSuccess({
      document: updatedDocument,
      archivedVersion,
      restoredVersion: selectedVersion,
      message: `${restoredVersionLabel} restored successfully. Version ${nextVersion} is now current.`,
      notes,
    })
  } catch (error) {
    /*
     * If the current document could not be updated, remove the archive
     * record created during this attempt. No media files are deleted.
     */
    try {
      if (archivedVersionId) {
        const payload = await getPayload({
          config: configPromise,
        })

        await payload.delete({
          collection: 'property-document-versions',
          id: archivedVersionId,
          overrideAccess: true,
        })
      }
    } catch {
      // Preserve the original restore error.
    }

    return workspaceError(error)
  }
}
