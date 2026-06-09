import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

const isSuperAdmin = ({ req }: any) => req.user?.role === 'super-admin'

const agencyOnly = ({ req }: any) => {
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

export const Agents: CollectionConfig = {
  slug: 'agents',

  access: {
    read: agencyOnly,
    create: authenticated,
    update: agencyOnly,
    delete: isSuperAdmin,
  },

  admin: {
    useAsTitle: 'name',
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
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      required: true,
      defaultValue: ({ user }) => {
        if (user?.role === 'super-admin') return undefined
        if (!user?.agency) return undefined

        return typeof user.agency === 'object' ? user.agency.id : user.agency
      },
      admin: {
        readOnly: true,
        condition: (_, __, { user }) => user?.role === 'super-admin',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'jobTitle',
      type: 'text',
    },
  ],
}
