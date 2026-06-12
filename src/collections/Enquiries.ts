import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

const isSuperAdmin = ({ req }: any) => req.user?.role === 'super-admin'

const enquiryAccess = ({ req }: any) => {
  if (req.user?.role === 'super-admin') return true

  if (req.user?.agency) {
    return {
      agency: {
        equals: typeof req.user.agency === 'object' ? req.user.agency.id : req.user.agency,
      },
    }
  }

  return false
}

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  timestamps: true,

  access: {
    read: enquiryAccess,
    create: () => true,
    update: enquiryAccess,
    delete: isSuperAdmin,
  },

  admin: {
    useAsTitle: 'name',
    group: 'Agency Dashboard',
    defaultColumns: ['createdAt', 'name', 'property', 'email', 'phone', 'status'],
  },

  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (!data?.property) return data

        const property = await req.payload.findByID({
          collection: 'properties',
          id: data.property,
        })

        if (property?.agency) {
          data.agency = typeof property.agency === 'object' ? property.agency.id : property.agency
        }

        return data
      },
    ],

    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation !== 'create') return

        console.log('New enquiry created:', doc.name)
      },
    ],
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },

    {
      name: 'email',
      type: 'email',
      required: true,
    },

    {
      name: 'phone',
      type: 'text',
    },

    {
      name: 'message',
      type: 'textarea',
      required: true,
    },

    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
    },

    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      required: true,
      admin: {
        hidden: true,
      },
    },

    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      admin: {
        position: 'sidebar',
      },
      options: [
        {
          label: 'New',
          value: 'new',
        },
        {
          label: 'Contacted',
          value: 'contacted',
        },
        {
          label: 'Viewing Booked',
          value: 'viewing-booked',
        },
        {
          label: 'Offer Made',
          value: 'offer-made',
        },
        {
          label: 'Closed',
          value: 'closed',
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal agency notes. Not visible to the public.',
      },
    },
  ],
}
