'use client'

import { useState } from 'react'

import { WorkspacePanel } from '@/components/DashboardV2/Workspace'
import {
  DocumentActions,
  EditDocumentPanel,
  UploadDocumentForm,
} from '@/modules/property-documents'

type PropertyDocumentFile = {
  id: string
  filename: string
  url: string
}

type PropertyDocument = {
  id: string
  title: string
  category: 'marketing' | 'legal' | 'compliance' | 'internal'
  documentType:
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
  visibility: 'public' | 'agency' | 'admin'
  version?: number | null
  description?: string | null
  updatedAt: string
  uploadedBy: string
  file: PropertyDocumentFile | null
}

type DocumentsTabProps = {
  propertyId: string
  documents: PropertyDocument[]
}

const categoryLabels: Record<PropertyDocument['category'], string> = {
  marketing: 'Marketing',
  legal: 'Legal',
  compliance: 'Compliance',
  internal: 'Internal',
}

const categoryOrder: PropertyDocument['category'][] = [
  'marketing',
  'legal',
  'compliance',
  'internal',
]

function formatLabel(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getVisibilityClasses(visibility: PropertyDocument['visibility']) {
  switch (visibility) {
    case 'public':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'agency':
      return 'border-blue-200 bg-blue-50 text-blue-700'

    case 'admin':
      return 'border-neutral-300 bg-neutral-100 text-neutral-700'
  }
}

export function DocumentsTab({ propertyId, documents }: DocumentsTabProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<PropertyDocument | null>(null)

  const groupedDocuments = categoryOrder.map((category) => ({
    category,
    documents: documents.filter((document) => document.category === category),
  }))

  function handleUploadSuccess() {
    setIsUploadOpen(false)
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Documents"
        description="Store brochures, certificates, contracts and supporting files."
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-neutral-950">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              Files are organised by purpose and access level.
            </p>
          </div>

          <button
            className="inline-flex h-10 items-center justify-center bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
            onClick={() => setIsUploadOpen((current) => !current)}
            type="button"
          >
            {isUploadOpen ? 'Close upload' : 'Add document'}
          </button>
        </div>
      </WorkspacePanel>

      {isUploadOpen ? (
        <WorkspacePanel
          title="Upload document"
          description="Add a new file to this property workspace."
        >
          <UploadDocumentForm
            propertyId={propertyId}
            onCancel={() => setIsUploadOpen(false)}
            onSuccess={handleUploadSuccess}
          />
        </WorkspacePanel>
      ) : null}

      {documents.length === 0 ? (
        <WorkspacePanel
          title="No documents yet"
          description="Add the first document for this property."
        >
          <p className="text-sm leading-7 text-neutral-600">
            Property documents such as brochures, home reports, EPCs and contracts will appear here.
          </p>
        </WorkspacePanel>
      ) : (
        groupedDocuments.map(({ category, documents: categoryDocuments }) => {
          if (categoryDocuments.length === 0) {
            return null
          }

          return (
            <WorkspacePanel
              key={category}
              title={categoryLabels[category]}
              description={`${categoryDocuments.length} ${
                categoryDocuments.length === 1 ? 'document' : 'documents'
              }`}
            >
              <div className="divide-y divide-neutral-200 border-y border-neutral-200">
                {categoryDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-neutral-950">
                          {document.title}
                        </h3>

                        <span
                          className={[
                            'inline-flex border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
                            getVisibilityClasses(document.visibility),
                          ].join(' ')}
                        >
                          {formatLabel(document.visibility)}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                        <span>{formatLabel(document.documentType)}</span>

                        {document.version ? <span>Version {document.version}</span> : null}

                        <span>Updated {formatDate(document.updatedAt)}</span>

                        <span>Uploaded by {document.uploadedBy || 'Unknown user'}</span>
                      </div>

                      {document.description ? (
                        <p className="mt-3 text-sm leading-6 text-neutral-600">
                          {document.description}
                        </p>
                      ) : null}
                    </div>

                    <DocumentActions
                      documentId={document.id}
                      fileUrl={document.file?.url || null}
                      filename={document.file?.filename}
                      onEdit={() => setEditingDocument(document)}
                      title={document.title}
                    />
                  </div>
                ))}
              </div>
            </WorkspacePanel>
          )
        })
      )}
      {editingDocument ? (
        <EditDocumentPanel document={editingDocument} onClose={() => setEditingDocument(null)} />
      ) : null}
    </div>
  )
}
