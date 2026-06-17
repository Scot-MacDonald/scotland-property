import type { CollectionConfig } from 'payload'

const isSuperAdmin = ({ req }: any) => req.user?.role === 'super-admin'

export const Buyers: CollectionConfig = {
  slug: 'buyers',

  access: {
    read: isSuperAdmin,
    create: () => true,
    update: isSuperAdmin,
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
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
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
