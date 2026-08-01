import type { Access, CollectionConfig, Where } from 'payload'

const isSuperAdmin: Access = ({ req }) =>
  req.user?.collection === 'users' && req.user.role === 'super-admin'

const activityReadAccess: Access = ({ req }) => {
  if (req.user?.collection === 'users' && req.user.role === 'super-admin') {
    return true
  }

  if (req.user?.collection === 'buyers') {
    const buyerWhere: Where = {
      buyer: {
        equals: req.user.id,
      },
    }

    return buyerWhere
  }

  if (req.user?.collection === 'users' && req.user.agency) {
    const agencyId = typeof req.user.agency === 'object' ? req.user.agency.id : req.user.agency

    const agencyWhere: Where = {
      agency: {
        equals: agencyId,
      },
    }

    return agencyWhere
  }

  return false
}

export const Activities: CollectionConfig = {
  slug: 'activities',

  admin: {
    useAsTitle: 'title',
    group: 'CRM',
    defaultColumns: ['title', 'entityType', 'type', 'buyer', 'agency', 'createdAt'],
  },

  access: {
    read: activityReadAccess,

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
          label: 'Task',
          value: 'task',
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
      name: 'buyer',
      type: 'relationship',
      relationTo: 'buyers',
      index: true,
      admin: {
        description: 'Buyer who owns or is associated with this activity.',
      },
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      index: true,
      admin: {
        description: 'Agency associated with this activity, when applicable.',
      },
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
