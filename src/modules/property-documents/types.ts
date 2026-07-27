import type { PropertyDocument } from '@/payload-types'

export type DocumentVisibility = 'public' | 'agency' | 'admin'

export type DocumentCategory = 'marketing' | 'legal' | 'compliance' | 'internal'

export type PropertyDocumentType =
  | 'brochure'
  | 'floorplan'
  | 'home-report'
  | 'epc'
  | 'planning'
  | 'title-deed'
  | 'lease'
  | 'survey'
  | 'valuation'
  | 'vendor-contract'
  | 'sales-memorandum'
  | 'aml'
  | 'identity'
  | 'certificate'
  | 'solicitor-correspondence'
  | 'other'

export type PropertyDocumentInput = {
  propertyId: string
  title: string
  category: DocumentCategory
  documentType: PropertyDocumentType
  visibility: DocumentVisibility
  description?: string
  version: number
  fileId?: string
}

export type PropertyDocumentUpdateInput = Partial<PropertyDocumentInput> & {
  id: string
}

export type PropertyDocumentResponse = {
  document: PropertyDocument
}
