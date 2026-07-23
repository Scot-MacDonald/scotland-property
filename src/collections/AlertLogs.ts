import type { CollectionConfig } from 'payload'

const isSuperAdmin = (user: unknown) => {
  return (
    typeof user === 'object' &&
    user !== null &&
    'collection' in user &&
    user.collection === 'users' &&
    'role' in user &&
    user.role === 'super-admin'
  )
}

export const AlertLogs: CollectionConfig = {
  slug: 'alert-logs',

  admin: {
    useAsTitle: 'buyerEmail',
    group: 'Buyer Activity',
    defaultColumns: ['buyerEmail', 'propertyTitle', 'savedSearchLabel', 'sentAt'],
    hidden: ({ user }) => !isSuperAdmin(user),
  },

  access: {
    read: ({ req }) => isSuperAdmin(req.user),
    create: () => true,
    update: () => false,
    delete: ({ req }) => isSuperAdmin(req.user),
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
