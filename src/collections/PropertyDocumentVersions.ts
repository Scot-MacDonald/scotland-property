import type { CollectionConfig, PayloadRequest } from 'payload'
import { APIError } from 'payload'

import { getRelationshipId } from '@/lib/dashboard/workspaceHelpers'

const isSuperAdmin = ({ req }: { req: PayloadRequest }) =>
  req.user?.collection === 'users' && req.user.role === 'super-admin'

const authenticated = ({ req }: { req: PayloadRequest }) =>
  Boolean(req.user?.collection === 'users')

const agencyOnly = ({ req }: { req: PayloadRequest }) => {
  if (!req.user || req.user.collection !== 'users') {
    return false
  }

  if (req.user.role === 'super-admin') {
    return true
  }

  const agencyId = getRelationshipId(req.user.agency)

  if (!agencyId) {
    return false
  }

  return {
    agency: {
      equals: agencyId,
    },
  }
}

type RelationshipValue =
  | string
  | number
  | {
      id?: string | number
    }
  | null
  | undefined

async function getDocumentDetails(req: PayloadRequest, documentValue: RelationshipValue) {
  const documentId = getRelationshipId(documentValue)

  if (!documentId) {
    throw new APIError('A property document is required.', 400)
  }

  try {
    const propertyDocument = await req.payload.findByID({
      collection: 'property-documents',
      id: documentId,
      depth: 0,
      overrideAccess: true,
      req,
    })

    const agencyId = getRelationshipId(propertyDocument.agency)
    const propertyId = getRelationshipId(propertyDocument.property)

    if (!agencyId || !propertyId) {
      throw new APIError('The selected document is missing its property or agency.', 400)
    }

    return {
      agencyId,
      propertyId,
    }
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }

    throw new APIError('The selected property document could not be found.', 400)
  }
}

export const PropertyDocumentVersions: CollectionConfig = {
  slug: 'property-document-versions',

  admin: {
    useAsTitle: 'label',
    group: 'Properties',
    defaultColumns: ['label', 'document', 'version', 'uploadedBy', 'createdAt'],
  },

  access: {
    read: agencyOnly,
    create: authenticated,
    update: isSuperAdmin,
    delete: isSuperAdmin,
  },

  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) {
          return data
        }

        if (!req.user || req.user.collection !== 'users') {
          throw new APIError('You must be signed in to manage document versions.', 401)
        }

        const documentValue = data.document ?? originalDoc?.document
        const { agencyId, propertyId } = await getDocumentDetails(req, documentValue)

        const userAgencyId = getRelationshipId(req.user.agency)
        const userIsSuperAdmin = req.user.role === 'super-admin'

        if (!userIsSuperAdmin) {
          if (!userAgencyId) {
            throw new APIError('Your account is not assigned to an agency.', 403)
          }

          if (userAgencyId !== agencyId) {
            throw new APIError('You cannot manage versions for another agency.', 403)
          }
        }

        data.agency = agencyId
        data.property = propertyId

        return data
      },
    ],

    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && req.user?.collection === 'users' && !data.uploadedBy) {
          data.uploadedBy = req.user.id
        }

        if (operation === 'create' && data.version && !data.label) {
          data.label = `Version ${data.version}`
        }

        return data
      },
    ],
  },

  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Automatically generated from the version number.',
        readOnly: true,
      },
    },
    {
      name: 'document',
      type: 'relationship',
      relationTo: 'property-documents',
      required: true,
      index: true,
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'file',
      type: 'relationship',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'The file retained for this archived version.',
      },
    },
    {
      name: 'version',
      type: 'number',
      required: true,
      min: 1,
      index: true,
      admin: {
        step: 1,
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Optional reason or context for the replacement.',
      },
    },
  ],

  timestamps: true,
}
