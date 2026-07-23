import type { Access, CollectionConfig, Where } from 'payload'

const isSuperAdmin: Access = ({ req }) =>
  req.user?.collection === 'users' && req.user.role === 'super-admin'

const buyerAccess: Access = ({ req }) => {
  if (req.user?.collection === 'users' && req.user.role === 'super-admin') {
    return true
  }

  if (req.user?.collection === 'buyers') {
    const selfWhere: Where = {
      id: {
        equals: req.user.id,
      },
    }

    return selfWhere
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

export const Buyers: CollectionConfig = {
  slug: 'buyers',

  auth: true,

  access: {
    read: buyerAccess,
    create: () => true,
    update: buyerAccess,
    delete: isSuperAdmin,
  },

  admin: {
    useAsTitle: 'email',
    group: 'Buyer Activity',
    defaultColumns: ['email', 'name', 'agency', 'alertsEnabled', 'lastActiveAt', 'createdAt'],
  },

  fields: [
    {
      name: 'name',
      type: 'text',
    },

    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      admin: {
        description: 'Agency responsible for managing this buyer.',
      },
    },

    {
      name: 'lastActiveAt',
      type: 'date',
      admin: {
        description: 'Updated automatically whenever the buyer uses the platform.',
      },
    },

    {
      name: 'savedProperties',
      type: 'relationship',
      relationTo: 'properties',
      hasMany: true,
    },

    {
      name: 'propertyEnquiries',
      type: 'relationship',
      relationTo: 'enquiries',
      hasMany: true,
      admin: {
        description: 'Property enquiries submitted by this buyer.',
      },
    },

    {
      name: 'savedSearches',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'queryString',
          type: 'text',
          required: true,
        },
        {
          name: 'createdAt',
          type: 'date',
        },
      ],
    },

    {
      name: 'alertsEnabled',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
