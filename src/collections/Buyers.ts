import type { CollectionConfig } from 'payload'

const isSuperAdmin = ({ req }: any) => req.user?.role === 'super-admin'

const isSelfOrSuperAdmin = ({ req }: any) => {
  if (req.user?.role === 'super-admin') return true

  if (req.user?.collection === 'buyers') {
    return {
      id: {
        equals: req.user.id,
      },
    }
  }

  return false
}

export const Buyers: CollectionConfig = {
  slug: 'buyers',

  auth: true,

  access: {
    read: isSelfOrSuperAdmin,
    create: () => true,
    update: isSelfOrSuperAdmin,
    delete: isSuperAdmin,
  },

  admin: {
    useAsTitle: 'email',
    group: 'Buyer Activity',
    defaultColumns: ['email', 'name', 'alertsEnabled', 'createdAt'],
  },

  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'savedProperties',
      type: 'relationship',
      relationTo: 'properties',
      hasMany: true,
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
