import type { CollectionConfig } from 'payload'

const isSuperAdmin = ({ req }: any) =>
  req.user?.collection === 'users' && req.user?.role === 'super-admin'

const agencyOnly = ({ req }: any) => {
  if (isSuperAdmin({ req })) return true

  const agency = req.user?.collection === 'users' ? req.user?.agency : null

  if (!agency) return false

  return {
    agency: {
      equals: typeof agency === 'object' ? agency.id : agency,
    },
  }
}

export const Activities: CollectionConfig = {
  slug: 'activities',

  admin: {
    useAsTitle: 'title',
    group: 'CRM',
    defaultColumns: ['title', 'entityType', 'type', 'agency', 'createdAt'],
  },

  access: {
    read: agencyOnly,

    // Activities must only be generated through our server-side helper.
    create: () => false,

    // Activity records are immutable.
    update: () => false,

    // Only a super-admin can remove an activity if absolutely necessary.
    delete: isSuperAdmin,
  },

  fields: [
    {
      name: 'type',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Machine-readable event type, for example viewing-status-changed.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'severity',
      type: 'select',
      required: true,
      defaultValue: 'info',
      options: [
        {
          label: 'Info',
          value: 'info',
        },
        {
          label: 'Success',
          value: 'success',
        },
        {
          label: 'Warning',
          value: 'warning',
        },
        {
          label: 'Error',
          value: 'error',
        },
      ],
    },
    {
      name: 'entityType',
      type: 'select',
      required: true,
      index: true,
      options: [
        {
          label: 'Property',
          value: 'property',
        },
        {
          label: 'Enquiry',
          value: 'enquiry',
        },
        {
          label: 'Valuation Lead',
          value: 'lead',
        },
        {
          label: 'Viewing',
          value: 'viewing',
        },
        {
          label: 'Offer',
          value: 'offer',
        },
        {
          label: 'Buyer',
          value: 'buyer',
        },
        {
          label: 'Agent',
          value: 'agent',
        },
        {
          label: 'Agency',
          value: 'agency',
        },
      ],
    },
    {
      name: 'entityId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'ID of the record associated with this activity.',
      },
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'The dashboard user who caused the activity.',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Structured information used by timelines, reports and analytics.',
      },
    },
  ],

  timestamps: true,
}
