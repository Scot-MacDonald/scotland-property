import type { CollectionConfig } from 'payload'

const isSuperAdmin = ({ req }: any) =>
  req.user?.collection === 'users' && req.user?.role === 'super-admin'

const agencyOnly = ({ req }: any) => {
  if (isSuperAdmin({ req })) return true

  if (req.user?.collection === 'users' && req.user?.agency) {
    return {
      agency: {
        equals: typeof req.user.agency === 'object' ? req.user.agency.id : req.user.agency,
      },
    }
  }

  return false
}

function getRelationshipId(value: unknown) {
  if (!value) return undefined

  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String(value.id)
  }

  return String(value)
}

export const Viewings: CollectionConfig = {
  slug: 'viewings',

  admin: {
    useAsTitle: 'contactName',
    defaultColumns: ['dateTime', 'property', 'contactName', 'agent', 'status'],
  },

  access: {
    read: agencyOnly,
    create: ({ req }) =>
      req.user?.collection === 'users' &&
      (req.user.role === 'super-admin' || Boolean(req.user.agency)),
    update: agencyOnly,
    delete: isSuperAdmin,
  },

  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (!data) return data

        if (operation === 'create' && !data.agency && req.user?.agency) {
          data.agency = typeof req.user.agency === 'object' ? req.user.agency.id : req.user.agency
        }

        const enquiryId = getRelationshipId(data.enquiry)

        if (enquiryId) {
          const enquiry = await req.payload.findByID({
            collection: 'enquiries',
            id: enquiryId,
            depth: 1,
          })

          if (!data.property && enquiry.property) {
            data.property = getRelationshipId(enquiry.property)
          }

          if (!data.agency && enquiry.agency) {
            data.agency = getRelationshipId(enquiry.agency)
          }

          if (!data.contactName && enquiry.name) {
            data.contactName = enquiry.name
          }

          if (!data.contactEmail && enquiry.email) {
            data.contactEmail = enquiry.email
          }

          if (!data.contactPhone && enquiry.phone) {
            data.contactPhone = enquiry.phone
          }
        }

        const propertyId = getRelationshipId(data.property)

        if (propertyId) {
          const property = await req.payload.findByID({
            collection: 'properties',
            id: propertyId,
            depth: 1,
          })

          if (operation === 'create' && !data.agent && property.agent) {
            data.agent = getRelationshipId(property.agent)
          }

          if (!data.agency && property.agency) {
            data.agency = getRelationshipId(property.agency)
          }
        }

        return data
      },
    ],
  },

  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'dateTime',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
            width: '50%',
          },
        },
        {
          name: 'durationMinutes',
          type: 'number',
          required: true,
          defaultValue: 60,
          min: 15,
          admin: {
            width: '25%',
          },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'requested',
          options: [
            {
              label: 'Requested',
              value: 'requested',
            },
            {
              label: 'Confirmed',
              value: 'confirmed',
            },
            {
              label: 'Completed',
              value: 'completed',
            },
            {
              label: 'Cancelled',
              value: 'cancelled',
            },
            {
              label: 'No Show',
              value: 'no-show',
            },
          ],
          admin: {
            width: '25%',
          },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'property',
          type: 'relationship',
          relationTo: 'properties',
          required: true,
          admin: {
            width: '50%',
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
      ],
    },

    {
      type: 'row',
      fields: [
        {
          name: 'agency',
          type: 'relationship',
          relationTo: 'agencies',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'buyer',
          type: 'relationship',
          relationTo: 'buyers',
          admin: {
            width: '25%',
          },
        },
        {
          name: 'enquiry',
          type: 'relationship',
          relationTo: 'enquiries',
          admin: {
            width: '25%',
          },
        },
      ],
    },

    {
      type: 'collapsible',
      label: 'Contact Details',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'contactName',
              type: 'text',
              required: true,
              admin: {
                width: '33%',
              },
            },
            {
              name: 'contactEmail',
              type: 'email',
              required: true,
              admin: {
                width: '33%',
              },
            },
            {
              name: 'contactPhone',
              type: 'text',
              admin: {
                width: '33%',
              },
            },
          ],
        },
      ],
    },

    {
      name: 'internalNotes',
      type: 'textarea',
    },
    {
      type: 'collapsible',
      label: 'Viewing Feedback',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'viewerRating',
              type: 'number',
              min: 1,
              max: 5,
              admin: {
                width: '25%',
                description: 'Overall viewer interest from 1 to 5.',
              },
            },
            {
              name: 'viewingOutcome',
              type: 'select',
              options: [
                {
                  label: 'Not recorded',
                  value: 'not-recorded',
                },
                {
                  label: 'Interested',
                  value: 'interested',
                },
                {
                  label: 'Second viewing requested',
                  value: 'second-viewing',
                },
                {
                  label: 'Considering an offer',
                  value: 'considering-offer',
                },
                {
                  label: 'Offer expected',
                  value: 'offer-expected',
                },
                {
                  label: 'Not interested',
                  value: 'not-interested',
                },
              ],
              defaultValue: 'not-recorded',
              admin: {
                width: '35%',
              },
            },
            {
              name: 'followUpRequired',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                width: '40%',
              },
            },
          ],
        },
        {
          name: 'feedback',
          label: 'Viewer Feedback',
          type: 'textarea',
        },
        {
          name: 'vendorFeedback',
          type: 'textarea',
        },
        {
          name: 'followUpNotes',
          type: 'textarea',
        },
      ],
    },
  ],
}
