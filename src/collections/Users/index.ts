import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

const isSuperAdmin = ({ req }: any) => req.user?.role === 'super-admin'

const userAgencyOnly = ({ req }: any) => {
  if (req.user?.role === 'super-admin') return true

  if (req.user?.agency) {
    const agencyId = typeof req.user.agency === 'object' ? req.user.agency.id : req.user.agency

    return {
      agency: {
        equals: agencyId,
      },
    }
  }

  return false
}

export const Users: CollectionConfig = {
  slug: 'users',

  access: {
    admin: authenticated,
    create: authenticated,
    delete: isSuperAdmin,
    read: userAgencyOnly,
    update: userAgencyOnly,
  },

  admin: {
    defaultColumns: ['name', 'email', 'role', 'agency'],
    useAsTitle: 'name',
  },

  auth: true,

  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'agent',
      options: [
        {
          label: 'Super Admin',
          value: 'super-admin',
        },
        {
          label: 'Agency Admin',
          value: 'agency-admin',
        },
        {
          label: 'Agent',
          value: 'agent',
        },
      ],
      required: true,
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
    },
  ],

  timestamps: true,
}
