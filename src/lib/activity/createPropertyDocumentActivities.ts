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
  return createActivity({
    type: ActivityTypes.DOCUMENT_UPLOADED,
    title: 'Document uploaded',
    description: `${documentTitle} was uploaded as Version ${version}.`,
    severity: ActivitySeverities.SUCCESS,
    entityType: ActivityEntityTypes.PROPERTY,
    entityId: propertyId,
    agency: agencyId,
    user: userId,
    metadata: {
      documentId,
      documentTitle,
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
  return createActivity({
    type: ActivityTypes.DOCUMENT_REPLACED,
    title: 'Document replaced',
    description: `${documentTitle} was replaced. Version ${previousVersion} was archived and Version ${currentVersion} is now current.`,
    severity: ActivitySeverities.SUCCESS,
    entityType: ActivityEntityTypes.PROPERTY,
    entityId: propertyId,
    agency: agencyId,
    user: userId,
    metadata: {
      documentId,
      documentTitle,
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
  return createActivity({
    type: ActivityTypes.DOCUMENT_RESTORED,
    title: 'Document restored',
    description: `${documentTitle} Version ${restoredVersion} was restored. Version ${previousCurrentVersion} was archived and Version ${currentVersion} is now current.`,
    severity: ActivitySeverities.SUCCESS,
    entityType: ActivityEntityTypes.PROPERTY,
    entityId: propertyId,
    agency: agencyId,
    user: userId,
    metadata: {
      documentId,
      documentTitle,
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
  return createActivity({
    type: ActivityTypes.DOCUMENT_DELETED,
    title: 'Document deleted',
    description:
      typeof version === 'number'
        ? `${documentTitle} Version ${version} was deleted.`
        : `${documentTitle} was deleted.`,
    severity: ActivitySeverities.WARNING,
    entityType: ActivityEntityTypes.PROPERTY,
    entityId: propertyId,
    agency: agencyId,
    user: userId,
    metadata: {
      documentId,
      documentTitle,
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
  const fieldDescription =
    updatedFields.length === 1
      ? updatedFields[0]
      : `${updatedFields.slice(0, -1).join(', ')} and ${updatedFields[updatedFields.length - 1]}`

  return createActivity({
    type: ActivityTypes.DOCUMENT_UPDATED,
    title: 'Document updated',
    description: `${documentTitle} was updated: ${fieldDescription}.`,
    severity: ActivitySeverities.INFO,
    entityType: ActivityEntityTypes.PROPERTY,
    entityId: propertyId,
    agency: agencyId,
    user: userId,
    metadata: {
      documentId,
      documentTitle,
      updatedFields,
    },
  })
}
