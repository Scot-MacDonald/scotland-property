import type { Payload } from 'payload'
import type { PropertyDocument } from '@/payload-types'

import { getRelationshipLabel } from '@/lib/dashboard'

export async function getPropertyDocuments(payload: Payload, propertyId: string) {
  const result = await payload.find({
    collection: 'property-documents',
    depth: 2,
    limit: 250,
    sort: '-updatedAt',
    overrideAccess: true,
    where: {
      property: {
        equals: propertyId,
      },
    },
  })

  const versionsResult = await payload.find({
    collection: 'property-document-versions',
    depth: 2,
    limit: 1000,
    sort: '-version',
    overrideAccess: true,
    where: {
      property: {
        equals: propertyId,
      },
    },
  })

  const versionsByDocument = new Map<string, typeof versionsResult.docs>()

  for (const version of versionsResult.docs) {
    const documentId =
      typeof version.document === 'object' ? String(version.document.id) : String(version.document)

    const existing = versionsByDocument.get(documentId) ?? []

    existing.push(version)

    versionsByDocument.set(documentId, existing)
  }

  return result.docs.map((document: PropertyDocument) => ({
    id: String(document.id),
    title: document.title,
    category: document.category,
    documentType: document.documentType,
    visibility: document.visibility,
    version: document.version,
    description: document.description,
    updatedAt: document.updatedAt,
    uploadedBy: getRelationshipLabel(document.uploadedBy),
    file:
      document.file && typeof document.file === 'object'
        ? {
            id: String(document.file.id),
            filename: document.file.filename || document.title,
            url: document.file.url || '',
          }
        : null,
    versions: (versionsByDocument.get(String(document.id)) ?? []).map((version) => ({
      id: String(version.id),
      version: version.version,
      updatedAt: version.updatedAt,
      uploadedBy: getRelationshipLabel(version.uploadedBy),
      notes: version.notes,

      file:
        version.file && typeof version.file === 'object'
          ? {
              id: String(version.file.id),
              filename: version.file.filename || '',
              url: version.file.url || '',
            }
          : null,
    })),
  }))
}
