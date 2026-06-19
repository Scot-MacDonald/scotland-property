import type { CollectionConfig } from 'payload'

export const AlertLogs: CollectionConfig = {
  slug: 'alert-logs',

  admin: {
    useAsTitle: 'buyerEmail',
    group: 'Buyer Activity',
    defaultColumns: ['buyerEmail', 'propertyTitle', 'savedSearchLabel', 'sentAt'],
    hidden: ({ user }) => user?.role !== 'super-admin',
  },

  access: {
    read: ({ req }) => req.user?.role === 'super-admin',
    create: () => true,
    update: () => false,
    delete: ({ req }) => req.user?.role === 'super-admin',
  },

  fields: [
    {
      name: 'buyer',
      type: 'relationship',
      relationTo: 'buyers',
      required: true,
    },
    {
      name: 'buyerEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
    },
    {
      name: 'propertyTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'savedSearchLabel',
      type: 'text',
      required: true,
    },
    {
      name: 'savedSearchQuery',
      type: 'text',
      required: true,
    },
    {
      name: 'sentAt',
      type: 'date',
      required: true,
    },
  ],
}
