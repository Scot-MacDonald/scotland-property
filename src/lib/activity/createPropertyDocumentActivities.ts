import { ActivityEntityTypes } from './activityEntityTypes'
import { ActivitySeverities } from './activitySeverity'
import { ActivityTypes } from './activityTypes'
import { createActivity } from './createActivity'

type BaseDocumentActivityArgs = {
  propertyId: string
  agencyId: string
  userId?: string
  documentId: string
  documentTitle: string
}

type CreateDocumentUploadedActivityArgs = BaseDocumentActivityArgs & {
  version: number
  category?: string
  documentType?: string
}

type CreateDocumentReplacedActivityArgs = BaseDocumentActivityArgs & {
  previousVersion: number
  currentVersion: number
}

type CreateDocumentRestoredActivityArgs = BaseDocumentActivityArgs & {
  restoredVersion: number
  previousCurrentVersion: number
  currentVersion: number
}

type CreateDocumentDeletedActivityArgs = BaseDocumentActivityArgs & {
  version?: number
}

type CreateDocumentUpdatedActivityArgs = BaseDocumentActivityArgs & {
  updatedFields: string[]
}

function formatDocumentTitle(documentTitle: string) {
  const trimmedTitle = documentTitle.trim()

  return trimmedTitle || 'Untitled document'
}

function formatFieldName(field: string) {
  const fieldNames: Record<string, string> = {
    documentType: 'document type',
    updatedAt: 'updated date',
  }

  return fieldNames[field] ?? field
}

export async function createDocumentUploadedActivity({
  propertyId,
  agencyId,
  userId,
  documentId,
  documentTitle,
  version,
  category,
  documentType,
}: CreateDocumentUploadedActivityArgs) {
  const title = formatDocumentTitle(documentTitle)

  return createActivity({
    type: ActivityTypes.DOCUMENT_UPLOADED,
    title: 'Document uploaded',
    description: `${title} · Version ${version}`,
    severity: ActivitySeverities.SUCCESS,
    entityType: ActivityEntityTypes.PROPERTY,
    entityId: propertyId,
    agency: agencyId,
    user: userId,
    metadata: {
      documentId,
      documentTitle: title,
      version,
      category,
      documentType,
    },
  })
}

export async function createDocumentReplacedActivity({
  propertyId,
  agencyId,
  userId,
  documentId,
  documentTitle,
  previousVersion,
  currentVersion,
}: CreateDocumentReplacedActivityArgs) {
  const title = formatDocumentTitle(documentTitle)

  return createActivity({
    type: ActivityTypes.DOCUMENT_REPLACED,
    title: 'Document replaced',
    description: `${title} · Version ${previousVersion} archived · Version ${currentVersion} now current`,
    severity: ActivitySeverities.SUCCESS,
    entityType: ActivityEntityTypes.PROPERTY,
    entityId: propertyId,
    agency: agencyId,
    user: userId,
    metadata: {
      documentId,
      documentTitle: title,
      previousVersion,
      currentVersion,
    },
  })
}

export async function createDocumentRestoredActivity({
  propertyId,
  agencyId,
  userId,
  documentId,
  documentTitle,
  restoredVersion,
  previousCurrentVersion,
  currentVersion,
}: CreateDocumentRestoredActivityArgs) {
  const title = formatDocumentTitle(documentTitle)

  return createActivity({
    type: ActivityTypes.DOCUMENT_RESTORED,
    title: 'Document restored',
    description: `${title} · Version ${restoredVersion} restored · Version ${previousCurrentVersion} archived · Version ${currentVersion} now current`,
    severity: ActivitySeverities.SUCCESS,
    entityType: ActivityEntityTypes.PROPERTY,
    entityId: propertyId,
    agency: agencyId,
    user: userId,
    metadata: {
      documentId,
      documentTitle: title,
      restoredVersion,
      previousCurrentVersion,
      currentVersion,
    },
  })
}

export async function createDocumentDeletedActivity({
  propertyId,
  agencyId,
  userId,
  documentId,
  documentTitle,
  version,
}: CreateDocumentDeletedActivityArgs) {
  const title = formatDocumentTitle(documentTitle)

  return createActivity({
    type: ActivityTypes.DOCUMENT_DELETED,
    title: 'Document deleted',
    description: typeof version === 'number' ? `${title} · Version ${version}` : title,
    severity: ActivitySeverities.WARNING,
    entityType: ActivityEntityTypes.PROPERTY,
    entityId: propertyId,
    agency: agencyId,
    user: userId,
    metadata: {
      documentId,
      documentTitle: title,
      version,
    },
  })
}

export async function createDocumentUpdatedActivity({
  propertyId,
  agencyId,
  userId,
  documentId,
  documentTitle,
  updatedFields,
}: CreateDocumentUpdatedActivityArgs) {
  const title = formatDocumentTitle(documentTitle)
  const formattedFields = updatedFields.map(formatFieldName)

  const fieldDescription =
    formattedFields.length === 0
      ? 'Document details'
      : formattedFields.length === 1
        ? formattedFields[0]
        : `${formattedFields.slice(0, -1).join(', ')} and ${
            formattedFields[formattedFields.length - 1]
          }`

  return createActivity({
    type: ActivityTypes.DOCUMENT_UPDATED,
    title: 'Document updated',
    description: `${title} · Updated ${fieldDescription}`,
    severity: ActivitySeverities.INFO,
    entityType: ActivityEntityTypes.PROPERTY,
    entityId: propertyId,
    agency: agencyId,
    user: userId,
    metadata: {
      documentId,
      documentTitle: title,
      updatedFields,
    },
  })
}
