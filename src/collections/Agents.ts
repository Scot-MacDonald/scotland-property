import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

const isPayloadUser = (
  user: unknown,
): user is {
  collection: 'users'
  role?: string | null
  agency?: string | { id: string } | null
} => {
  return (
    typeof user === 'object' && user !== null && 'collection' in user && user.collection === 'users'
  )
}

const isSuperAdmin = ({ req }: any) => {
  return isPayloadUser(req.user) && req.user.role === 'super-admin'
}

const agencyOnly = ({ req }: any) => {
  const user = req.user

  if (!isPayloadUser(user)) {
    return false
  }

  if (user.role === 'super-admin') {
    return true
  }

  if (!user.agency) {
    return false
  }

  return {
    agency: {
      equals: typeof user.agency === 'object' ? user.agency.id : user.agency,
    },
  }
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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
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
        if (!isPayloadUser(user)) {
          return undefined
        }

        if (user.role === 'super-admin' || !user.agency) {
          return undefined
        }

        return typeof user.agency === 'object' ? user.agency.id : user.agency
      },
      admin: {
        condition: (_, __, { user }) => {
          return isPayloadUser(user) && user.role === 'super-admin'
        },
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
