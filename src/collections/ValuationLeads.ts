import type { CollectionConfig } from 'payload'
import { emailTemplate } from '@/lib/emailTemplates'

const isSuperAdmin = ({ req }: any) => req.user?.role === 'super-admin'

const agencyOnly = ({ req }: any) => {
  if (req.user?.role === 'super-admin') return true

  if (req.user?.agency) {
    return {
      assignedAgency: {
        equals: typeof req.user.agency === 'object' ? req.user.agency.id : req.user.agency,
      },
    }
  }

  return false
}

function getPostcodeArea(postcode?: string) {
  if (!postcode) return null

  const clean = postcode.toUpperCase().trim()

  const match = clean.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)/)

  return match?.[1] || null
}

function formatMoney(value?: number) {
  if (!value) return 'Not provided'

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

export const ValuationLeads: CollectionConfig = {
  slug: 'valuation-leads',

  admin: {
    useAsTitle: 'name',
    group: 'Leads',
    defaultColumns: ['name', 'postcode', 'estimatedValue', 'status', 'assignedAgency', 'createdAt'],
  },

  access: {
    read: agencyOnly,
    create: () => true,
    update: agencyOnly,
    delete: isSuperAdmin,
  },

  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation !== 'create') return data
        if (data.assignedAgency) return data

        const postcodeArea = getPostcodeArea(data.postcode)

        if (!postcodeArea) return data

        const agencies = await req.payload.find({
          collection: 'agencies',
          limit: 100,
          overrideAccess: true,
        })

        const matchingAgency = agencies.docs.find((agency: any) => {
          const coveragePostcodes = agency.coveragePostcodes || []

          return coveragePostcodes.some((item: any) => {
            return item?.postcode?.toUpperCase().trim() === postcodeArea
          })
        })

        if (matchingAgency) {
          return {
            ...data,
            assignedAgency: matchingAgency.id,
          }
        }

        return data
      },
    ],

    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation !== 'create') return
        if (!doc.assignedAgency) return

        const agencyId =
          typeof doc.assignedAgency === 'object' ? doc.assignedAgency.id : doc.assignedAgency

        const agency = await req.payload.findByID({
          collection: 'agencies',
          id: agencyId,
          overrideAccess: true,
        })

        if (!agency?.email) return

        await req.payload.sendEmail({
          to: agency.email,
          subject: `New valuation lead: ${doc.postcode}`,
          html: emailTemplate({
            title: 'New Valuation Lead',
            content: `
      <p><strong>Name:</strong> ${doc.name}</p>

      <p><strong>Email:</strong> ${doc.email}</p>

      <p><strong>Phone:</strong> ${doc.phone || 'Not provided'}</p>

      <p><strong>Postcode:</strong> ${doc.postcode}</p>

      <p><strong>Property type:</strong> ${doc.propertyType || 'Not provided'}</p>

      <p><strong>Estimated value:</strong> ${formatMoney(doc.estimatedValue)}</p>

      ${doc.message ? `<p><strong>Message:</strong><br />${doc.message}</p>` : ''}

      <p style="margin-top:40px;">
        Please log in to the dashboard to manage this lead.
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
      name: 'postcode',
      type: 'text',
      required: true,
    },
    {
      name: 'propertyType',
      type: 'select',
      options: [
        { label: 'House', value: 'house' },
        { label: 'Flat / Apartment', value: 'flat' },
        { label: 'Estate', value: 'estate' },
        { label: 'Land', value: 'land' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'estimatedValue',
      type: 'number',
      admin: {
        description: 'Optional estimated value entered by the owner.',
      },
    },
    {
      name: 'message',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Valuation Booked', value: 'valuation-booked' },
        { label: 'Instruction Won', value: 'instruction-won' },
        { label: 'Lost', value: 'lost' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about calls, valuations and follow-ups.',
      },
    },
    {
      name: 'nextFollowUpAt',
      type: 'date',
      admin: {
        description: 'Next date/time this lead should be followed up.',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'd MMM yyyy HH:mm',
        },
      },
    },
    {
      name: 'nextFollowUpTask',
      type: 'text',
      admin: {
        description: 'Example: Call client, send valuation pack, chase instruction.',
      },
    },
    {
      name: 'followUpCompleted',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'website',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Google Ads', value: 'google-ads' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Agency Referral', value: 'agency-referral' },
      ],
    },
    {
      name: 'assignedAgency',
      type: 'relationship',
      relationTo: 'agencies',
      admin: {
        description: 'Optional agency assigned to this valuation lead.',
      },
    },
  ],
}
