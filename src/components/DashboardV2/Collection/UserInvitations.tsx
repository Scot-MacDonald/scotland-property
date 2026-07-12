import crypto from 'node:crypto'

import type { CollectionBeforeChangeHook, CollectionConfig, Where } from 'payload'

function getRelationshipId(value: unknown): string | null {
  if (!value) return null

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id

    return typeof id === 'string' ? id : null
  }

  return null
}

function createInvitationToken() {
  return crypto.randomBytes(32).toString('hex')
}

const setInvitationDefaults: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') {
    return data
  }

  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + 7)

  return {
    ...data,
    email: typeof data.email === 'string' ? data.email.trim().toLowerCase() : data.email,
    token: data.token || createInvitationToken(),
    status: data.status || 'pending',
    expiresAt: data.expiresAt || expiresAt.toISOString(),
    createdBy: data.createdBy || req.user?.id,
  }
}

const canCreateInvitation = ({ req }: any) => {
  if (!req.user || req.user.collection !== 'users') {
    return false
  }

  return (
    req.user.role === 'super-admin' ||
    req.user.role === 'agency-admin' ||
    req.user.role === 'agency-owner'
  )
}

const canReadInvitations = ({ req }: any): boolean | Where => {
  if (!req.user || req.user.collection !== 'users') {
    return false
  }

  if (req.user.role === 'super-admin') {
    return true
  }

  const agencyId = getRelationshipId(req.user.agency)

  if (!agencyId) {
    return false
  }

  return {
    agency: {
      equals: agencyId,
    },
  }
}

const canUpdateInvitations = ({ req }: any): boolean | Where => {
  if (!req.user || req.user.collection !== 'users') {
    return false
  }

  if (req.user.role === 'super-admin') {
    return true
  }

  if (req.user.role !== 'agency-admin' && req.user.role !== 'agency-owner') {
    return false
  }

  const agencyId = getRelationshipId(req.user.agency)

  if (!agencyId) {
    return false
  }

  return {
    agency: {
      equals: agencyId,
    },
  }
}

export const UserInvitations: CollectionConfig = {
  slug: 'user-invitations',

  access: {
    admin: ({ req }) => req.user?.collection === 'users' && req.user?.role === 'super-admin',

    create: canCreateInvitation,
    read: canReadInvitations,
    update: canUpdateInvitations,

    // Keep invitations for the audit trail.
    delete: () => false,
  },

  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'agency', 'status', 'expiresAt'],
  },

  hooks: {
    beforeChange: [setInvitationDefaults],
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
      required: true,
      index: true,
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      required: true,
      index: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'agency-staff',
      options: [
        {
          label: 'Agency Owner',
          value: 'agency-owner',
        },
        {
          label: 'Agency Staff',
          value: 'agency-staff',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Accepted',
          value: 'accepted',
        },
        {
          label: 'Expired',
          value: 'expired',
        },
        {
          label: 'Cancelled',
          value: 'cancelled',
        },
      ],
    },
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        hidden: true,
      },
      access: {
        read: ({ req }) => req.user?.collection === 'users' && req.user?.role === 'super-admin',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      index: true,
    },
    {
      name: 'acceptedAt',
      type: 'date',
    },
    {
      name: 'acceptedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
    },
  ],

  timestamps: true,
}
