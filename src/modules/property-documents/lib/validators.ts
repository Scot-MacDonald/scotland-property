import type { PropertyDocumentInput, PropertyDocumentUpdateInput } from '../types'

const validCategories = ['marketing', 'legal', 'compliance', 'internal'] as const

const validDocumentTypes = [
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
] as const

const validVisibilities = ['public', 'agency', 'admin'] as const

export function validateCreateDocument(input: PropertyDocumentInput): string[] {
  const errors: string[] = []

  if (!input.propertyId) {
    errors.push('Property is required.')
  }

  if (!input.title.trim()) {
    errors.push('Title is required.')
  }

  if (!validCategories.includes(input.category)) {
    errors.push('A valid category is required.')
  }

  if (!validDocumentTypes.includes(input.documentType)) {
    errors.push('A valid document type is required.')
  }

  if (!validVisibilities.includes(input.visibility)) {
    errors.push('A valid visibility is required.')
  }

  if (!input.fileId) {
    errors.push('A document must be uploaded.')
  }

  if (!Number.isFinite(input.version) || input.version < 1) {
    errors.push('Version must be at least 1.')
  }

  return errors
}

export function validateUpdateDocument(input: PropertyDocumentUpdateInput): string[] {
  const errors: string[] = []

  if (!input.id) {
    errors.push('Document ID is required.')
  }

  if (input.title !== undefined && !input.title.trim()) {
    errors.push('Title cannot be empty.')
  }

  if (input.category !== undefined && !validCategories.includes(input.category)) {
    errors.push('Category is invalid.')
  }

  if (input.documentType !== undefined && !validDocumentTypes.includes(input.documentType)) {
    errors.push('Document type is invalid.')
  }

  if (input.visibility !== undefined && !validVisibilities.includes(input.visibility)) {
    errors.push('Visibility is invalid.')
  }

  if (input.version !== undefined && (!Number.isFinite(input.version) || input.version < 1)) {
    errors.push('Version must be at least 1.')
  }

  return errors
}
