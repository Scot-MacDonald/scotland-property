import type { CollectionConfig, PayloadRequest } from 'payload'
import { APIError } from 'payload'

import { ActivityEntityTypes, ActivityTypes, createActivity } from '@/lib/activity'
import { createOfferActivities } from '@/lib/activity/createOfferActivities'
import { getChangedFields } from '@/lib/activity/getChangedFields'
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

  const property = await req.payload.findByID({
    collection: 'properties',
    id: propertyId,
    depth: 0,
    overrideAccess: true,
    req,
  })

  return getRelationshipId(property.agency)
}

async function validateAgencyRelationship({
  req,
  collection,
  id,
  agencyId,
  label,
}: {
  req: PayloadRequest
  collection: 'agents' | 'buyers' | 'viewings' | 'enquiries'
  id: string | null
  agencyId: string
  label: string
}) {
  if (!id) {
    return
  }

  let relatedDocument

  try {
    relatedDocument = await req.payload.findByID({
      collection,
      id,
      depth: 0,
      overrideAccess: true,
      req,
    })
  } catch {
    throw new APIError(`${label} could not be found.`, 400)
  }

  const relatedAgencyId = getRelationshipId(relatedDocument.agency)

  /*
   * Some existing buyer records may not have an agency.
   * An unassigned buyer can still be linked to an offer, but a buyer
   * assigned to another agency cannot.
   */
  if (relatedAgencyId && relatedAgencyId !== agencyId) {
    throw new APIError(`${label} does not belong to this agency.`, 403)
  }
}

export const Offers: CollectionConfig = {
  slug: 'offers',

  admin: {
    useAsTitle: 'reference',
    defaultColumns: [
      'reference',
      'property',
      'buyer',
      'amount',
      'status',
      'confidence',
      'submittedAt',
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
      async ({ data, operation, originalDoc, req }) => {
        if (!data) {
          return data
        }

        const propertyValue = data.property ?? originalDoc?.property
        const propertyAgencyId = await getPropertyAgencyId(req, propertyValue)

        if (!propertyAgencyId) {
          throw new APIError('The selected property must belong to an agency.', 400)
        }

        const userAgencyId =
          req.user?.collection === 'users' ? getRelationshipId(req.user.agency) : null

        const isAdmin = req.user?.collection === 'users' && req.user.role === 'super-admin'

        if (!isAdmin && userAgencyId && userAgencyId !== propertyAgencyId) {
          throw new APIError('You cannot create or update an offer for another agency.', 403)
        }

        data.agency = propertyAgencyId

        if (operation === 'create' && !data.reference) {
          const timestamp = Date.now().toString().slice(-8)
          data.reference = `OFF-${timestamp}`
        }

        return data
      },
    ],

    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const agencyId = getRelationshipId(data.agency ?? originalDoc?.agency)

        if (!agencyId) {
          throw new APIError('Offer agency is required.', 400)
        }

        const buyerId = getRelationshipId(data.buyer ?? originalDoc?.buyer)

        const agentId = getRelationshipId(data.agent ?? originalDoc?.agent)

        const viewingId = getRelationshipId(data.viewing ?? originalDoc?.viewing)

        const enquiryId = getRelationshipId(data.enquiry ?? originalDoc?.enquiry)

        await validateAgencyRelationship({
          req,
          collection: 'buyers',
          id: buyerId,
          agencyId,
          label: 'The selected buyer',
        })

        await validateAgencyRelationship({
          req,
          collection: 'agents',
          id: agentId,
          agencyId,
          label: 'The selected agent',
        })

        await validateAgencyRelationship({
          req,
          collection: 'viewings',
          id: viewingId,
          agencyId,
          label: 'The selected viewing',
        })

        await validateAgencyRelationship({
          req,
          collection: 'enquiries',
          id: enquiryId,
          agencyId,
          label: 'The selected enquiry',
        })

        return data
      },
    ],

    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (!req.user || req.user.collection !== 'users') {
          return doc
        }

        const agencyId = getRelationshipId(doc.agency)

        if (!agencyId) {
          return doc
        }

        if (operation === 'create') {
          await createActivity({
            agency: agencyId,
            entityType: ActivityEntityTypes.OFFER,
            entityId: String(doc.id),
            type: ActivityTypes.OFFER_CREATED,
            title: 'Offer created',
            description: `An offer of £${Number(doc.amount).toLocaleString('en-GB')} was created.`,
            metadata: {
              amount: doc.amount,
              status: doc.status,
              property: getRelationshipId(doc.property),
              buyer: getRelationshipId(doc.buyer),
            },
            user: req.user.id,
          })

          return doc
        }

        const trackedFields = [
          'property',
          'buyer',
          'agent',
          'viewing',
          'enquiry',
          'amount',
          'status',
          'confidence',
          'submittedAt',
          'expiresAt',
          'conditions',
          'vendorResponse',
          'buyerResponse',
          'internalNotes',
        ]

        const changedFields = getChangedFields(previousDoc, doc, trackedFields)

        await createOfferActivities({
          previousOffer: previousDoc,
          offer: doc,
          changedFields,
          agencyId,
          userId: req.user.id,
        })

        return doc
      },
    ],
  },

  fields: [
    {
      name: 'reference',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        width: '33%',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Submitted',
          value: 'submitted',
        },
        {
          label: 'Negotiating',
          value: 'negotiating',
        },
        {
          label: 'Accepted',
          value: 'accepted',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
        {
          label: 'Withdrawn',
          value: 'withdrawn',
        },
      ],
      admin: {
        width: '33%',
      },
    },
    {
      name: 'confidence',
      type: 'select',
      required: true,
      defaultValue: 'medium',
      options: [
        {
          label: 'Low',
          value: 'low',
        },
        {
          label: 'Medium',
          value: 'medium',
        },
        {
          label: 'High',
          value: 'high',
        },
      ],
      admin: {
        width: '33%',
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
      name: 'buyer',
      type: 'relationship',
      relationTo: 'buyers',
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
      },
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'agents',
      required: false,
      admin: {
        width: '50%',
      },
    },
    {
      name: 'viewing',
      type: 'relationship',
      relationTo: 'viewings',
      required: false,
      admin: {
        width: '50%',
      },
    },
    {
      name: 'enquiry',
      type: 'relationship',
      relationTo: 'enquiries',
      required: false,
      admin: {
        width: '50%',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      index: true,
      admin: {
        width: '33%',
        step: 1000,
      },
    },
    {
      name: 'currency',
      type: 'select',
      required: true,
      defaultValue: 'GBP',
      options: [
        {
          label: 'GBP',
          value: 'GBP',
        },
      ],
      admin: {
        width: '33%',
        readOnly: true,
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      required: false,
      admin: {
        width: '33%',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: false,
      admin: {
        width: '33%',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'conditions',
      type: 'textarea',
      required: false,
      admin: {
        description:
          'Conditions attached to the offer, such as survey, finance or settlement requirements.',
      },
    },
    {
      name: 'vendorResponse',
      type: 'textarea',
      required: false,
    },
    {
      name: 'buyerResponse',
      type: 'textarea',
      required: false,
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Private notes visible only to the agency.',
      },
    },
  ],

  timestamps: true,
}
