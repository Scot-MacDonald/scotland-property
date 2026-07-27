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

async function getPropertyAgencyId(req: PayloadRequest, propertyValue: RelationshipValue) {
  const propertyId = getRelationshipId(propertyValue)

  if (!propertyId) {
    return null
  }

  try {
    const property = await req.payload.findByID({
      collection: 'properties',
      id: propertyId,
      depth: 0,
      overrideAccess: true,
      req,
    })

    return getRelationshipId(property.agency)
  } catch {
    throw new APIError('The selected property could not be found.', 400)
  }
}

export const PropertyDocuments: CollectionConfig = {
  slug: 'property-documents',

  admin: {
    useAsTitle: 'title',
    group: 'Properties',
    defaultColumns: [
      'title',
      'property',
      'documentType',
      'category',
      'visibility',
      'version',
      'updatedAt',
    ],
  },

  access: {
    read: agencyOnly,
    create: authenticated,
    update: agencyOnly,
    delete: isSuperAdmin,
  },

  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) {
          return data
        }

        const propertyValue = data.property ?? originalDoc?.property
        const propertyAgencyId = await getPropertyAgencyId(req, propertyValue)

        if (!propertyAgencyId) {
          throw new APIError('The selected property must belong to an agency.', 400)
        }

        if (!req.user || req.user.collection !== 'users') {
          throw new APIError('You must be signed in to manage property documents.', 401)
        }

        const userAgencyId = getRelationshipId(req.user.agency)
        const userIsSuperAdmin = req.user.role === 'super-admin'

        if (!userIsSuperAdmin) {
          if (!userAgencyId) {
            throw new APIError('Your account is not assigned to an agency.', 403)
          }

          if (userAgencyId !== propertyAgencyId) {
            throw new APIError('You cannot create or update documents for another agency.', 403)
          }
        }

        data.agency = propertyAgencyId

        return data
      },
    ],

    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && req.user?.collection === 'users' && !data.uploadedBy) {
          data.uploadedBy = req.user.id
        }

        return data
      },
    ],
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'A clear name for the document, such as Property Brochure.',
      },
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
      index: true,
      admin: {
        width: '50%',
      },
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      required: true,
      index: true,
      admin: {
        width: '50%',
        readOnly: true,
        description: 'Automatically inherited from the selected property.',
      },
    },
    {
      name: 'file',
      type: 'relationship',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'The uploaded PDF, image or other document file.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'select',
          required: true,
          defaultValue: 'internal',
          index: true,
          options: [
            {
              label: 'Marketing',
              value: 'marketing',
            },
            {
              label: 'Legal',
              value: 'legal',
            },
            {
              label: 'Compliance',
              value: 'compliance',
            },
            {
              label: 'Internal',
              value: 'internal',
            },
          ],
          admin: {
            width: '33%',
          },
        },
        {
          name: 'documentType',
          type: 'select',
          required: true,
          defaultValue: 'other',
          index: true,
          options: [
            {
              label: 'Property Brochure',
              value: 'brochure',
            },
            {
              label: 'Floorplan',
              value: 'floorplan',
            },
            {
              label: 'Home Report',
              value: 'home-report',
            },
            {
              label: 'Energy Performance Certificate',
              value: 'epc',
            },
            {
              label: 'Planning Document',
              value: 'planning',
            },
            {
              label: 'Title Deed',
              value: 'title-deed',
            },
            {
              label: 'Lease',
              value: 'lease',
            },
            {
              label: 'Survey',
              value: 'survey',
            },
            {
              label: 'Valuation Report',
              value: 'valuation',
            },
            {
              label: 'Vendor Contract',
              value: 'vendor-contract',
            },
            {
              label: 'Sales Memorandum',
              value: 'sales-memorandum',
            },
            {
              label: 'AML Document',
              value: 'aml',
            },
            {
              label: 'Identity Document',
              value: 'identity',
            },
            {
              label: 'Certificate',
              value: 'certificate',
            },
            {
              label: 'Solicitor Correspondence',
              value: 'solicitor-correspondence',
            },
            {
              label: 'Other',
              value: 'other',
            },
          ],
          admin: {
            width: '34%',
          },
        },
        {
          name: 'visibility',
          type: 'select',
          required: true,
          defaultValue: 'agency',
          index: true,
          options: [
            {
              label: 'Public',
              value: 'public',
            },
            {
              label: 'Agency Only',
              value: 'agency',
            },
            {
              label: 'Super Admin Only',
              value: 'admin',
            },
          ],
          admin: {
            width: '33%',
            description: 'Controls who may eventually access the document.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'version',
          type: 'number',
          required: true,
          defaultValue: 1,
          min: 1,
          admin: {
            width: '50%',
            step: 1,
          },
        },
        {
          name: 'uploadedBy',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            width: '50%',
            readOnly: true,
            description: 'Automatically recorded when the document is created.',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional internal context or notes about this document.',
      },
    },
  ],

  timestamps: true,
}
