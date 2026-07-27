import { workspaceError } from '@/lib/propertyWorkspace/error'
import { requirePropertyAccess } from '@/lib/propertyWorkspace/requirePropertyAccess'
import { workspaceSuccess } from '@/lib/propertyWorkspace/success'
import { uploadMediaFile } from '@/lib/propertyWorkspace/uploadMedia'

import type {
  DocumentCategory,
  DocumentVisibility,
  PropertyDocumentInput,
  PropertyDocumentType,
} from '../types'
import { validateCreateDocument } from '../lib/validators'

function optionalString(value: FormDataEntryValue | null) {
  const stringValue = String(value || '').trim()
  return stringValue || undefined
}

function optionalNumber(value: FormDataEntryValue | null) {
  const stringValue = String(value || '').trim()

  if (!stringValue) {
    return undefined
  }

  const numberValue = Number(stringValue)

  return Number.isFinite(numberValue) ? numberValue : undefined
}

export async function createPropertyDocument(request: Request) {
  try {
    const formData = await request.formData()

    const propertyId = String(formData.get('propertyId') || '').trim()
    const title = String(formData.get('title') || '').trim()

    const category = String(formData.get('category') || '') as DocumentCategory

    const documentType = String(formData.get('documentType') || '') as PropertyDocumentType

    const visibility = String(formData.get('visibility') || 'agency') as DocumentVisibility

    if (!propertyId) {
      return workspaceError(new Error('Property is required.'), {
        status: 400,
      })
    }

    const { payload, property, user } = await requirePropertyAccess(propertyId)

    if (!property.agency) {
      return workspaceError(new Error('Property is not assigned to an agency.'), {
        status: 400,
      })
    }

    const agencyId = typeof property.agency === 'string' ? property.agency : property.agency.id

    const uploadedFileId = await uploadMediaFile(
      payload,
      formData.get('file'),
      title || 'Property document',
    )

    const existingFileId = optionalString(formData.get('fileId'))
    const fileId = uploadedFileId || existingFileId

    const input: PropertyDocumentInput = {
      propertyId,
      title,
      category,
      documentType,
      visibility,
      description: optionalString(formData.get('description')),
      version: optionalNumber(formData.get('version')) ?? 1,
      fileId,
    }

    const errors = validateCreateDocument(input)

    if (errors.length > 0) {
      return workspaceError(new Error(errors.join(' ')), {
        status: 400,
      })
    }

    const document = await payload.create({
      collection: 'property-documents',
      overrideAccess: false,
      user,
      data: {
        property: input.propertyId,
        agency: agencyId,
        title: input.title,
        category: input.category,
        documentType: input.documentType,
        visibility: input.visibility,
        description: input.description,
        version: input.version ?? 1,
        file: input.fileId!,
      },
    })

    return workspaceSuccess(
      {
        document,
      },
      201,
    )
  } catch (error) {
    return workspaceError(error, {
      fallback: 'The document could not be created.',
    })
  }
}
