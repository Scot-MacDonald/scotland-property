import type { CollectionConfig, Where } from 'payload'

type UserRole = 'super-admin' | 'agency-owner' | 'agency-staff'

function getRelationshipId(value: unknown): string | null {
  if (!value) return null

  if (typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'string' ? id : null
  }

  return typeof value === 'string' ? value : null
}

const isSuperAdmin = ({ req }: any) => {
  return req.user?.collection === 'users' && req.user?.role === 'super-admin'
}

const canAccessPayloadAdmin = ({ req }: any) => {
  return req.user?.collection === 'users' && req.user?.role === 'super-admin'
}

const canReadUsers = ({ req }: any): boolean | Where => {
  const user = req.user

  if (!user || user.collection !== 'users') {
    return false
  }

  if (user.role === 'super-admin') {
    return true
  }

  const agencyId = getRelationshipId(user.agency)

  if (!agencyId) {
    return {
      id: {
        equals: user.id,
      },
    }
  }

  return {
    agency: {
      equals: agencyId,
    },
  }
}

const canUpdateUsers = ({ req }: any): boolean | Where => {
  const user = req.user

  if (!user || user.collection !== 'users') {
    return false
  }

  if (user.role === 'super-admin') {
    return true
  }

  if (user.role === 'agency-owner') {
    const agencyId = getRelationshipId(user.agency)

    if (!agencyId) {
      return {
        id: {
          equals: user.id,
        },
      }
    }

    return {
      agency: {
        equals: agencyId,
      },
    }
  }

  // Agency staff can update only their own account.
  return {
    id: {
      equals: user.id,
    },
  }
}

export const Users: CollectionConfig = {
  slug: 'users',

  auth: true,

  access: {
    // Only super-admins may enter Payload Admin.
    admin: canAccessPayloadAdmin,

    // Keep user creation restricted until the secure Dashboard V2
    // staff-management route is added.
    create: isSuperAdmin,

    delete: isSuperAdmin,
    read: canReadUsers,
    update: canUpdateUsers,
  },

  admin: {
    defaultColumns: ['name', 'email', 'role', 'agency'],
    useAsTitle: 'name',
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'agency-staff',
      options: [
        {
          label: 'Super Admin',
          value: 'super-admin',
        },
        {
          label: 'Agency Owner',
          value: 'agency-owner',
        },
        {
          label: 'Agency Staff',
          value: 'agency-staff',
        },
      ],
      required: true,
      access: {
        // Prevent agency users from promoting themselves through the API.
        create: isSuperAdmin,
        update: isSuperAdmin,
      },
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      access: {
        // Agency assignment is controlled by super-admins for now.
        create: isSuperAdmin,
        update: isSuperAdmin,
      },
    },
  ],

  timestamps: true,
}
