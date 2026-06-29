import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { emailTemplate } from '@/lib/emailTemplates'

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
        if (!doc.agency) return

        const agencyId = typeof doc.agency === 'object' ? doc.agency.id : doc.agency

        const agency = await req.payload.findByID({
          collection: 'agencies',
          id: agencyId,
          overrideAccess: true,
        })

        if (!agency?.email) return

        const propertyId = typeof doc.property === 'object' ? doc.property.id : doc.property

        const property = propertyId
          ? await req.payload.findByID({
              collection: 'properties',
              id: propertyId,
              overrideAccess: true,
            })
          : null

        await req.payload.sendEmail({
          to: agency.email,
          subject: `New enquiry${property?.title ? `: ${property.title}` : ''}`,
          html: emailTemplate({
            title: 'New Property Enquiry',
            content: `
              <p><strong>Name:</strong> ${doc.name}</p>

              <p><strong>Email:</strong> ${doc.email}</p>

              <p><strong>Phone:</strong> ${doc.phone || 'Not provided'}</p>

              ${property?.title ? `<p><strong>Property:</strong> ${property.title}</p>` : ''}

              <p><strong>Message:</strong><br />${doc.message}</p>

              <p style="margin-top:40px;">
                Please log in to the dashboard to manage this enquiry.
              </p>
            `,
          }),
        })
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
          label: 'Sale Agreed',
          value: 'sale-agreed',
        },
        {
          label: 'Completed',
          value: 'completed',
        },
        {
          label: 'Lost',
          value: 'lost',
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
