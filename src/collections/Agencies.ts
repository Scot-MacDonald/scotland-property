import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

const isSuperAdmin = ({ req }: any) => req.user?.role === 'super-admin'

const agencyOnly = ({ req }: any) => {
  if (req.user?.role === 'super-admin') return true

  if (req.user?.agency) {
    const agencyId = typeof req.user.agency === 'object' ? req.user.agency.id : req.user.agency

    return {
      id: {
        equals: agencyId,
      },
    }
  }

  return false
}

export const Agencies: CollectionConfig = {
  slug: 'agencies',

  access: {
    read: () => true,
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
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },

    {
      name: 'website',
      type: 'text',
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
      name: 'description',
      type: 'textarea',
    },

    {
      name: 'address',
      type: 'group',
      fields: [
        {
          name: 'street',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
        },
        {
          name: 'postcode',
          type: 'text',
        },
        {
          name: 'country',
          type: 'text',
          defaultValue: 'Scotland',
        },
      ],
    },

    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'crm',
      type: 'group',
      admin: {
        description: 'Optional CRM/feed settings for automatic property imports.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            {
              label: 'Generic XML Feed',
              value: 'generic-xml',
            },
            {
              label: 'Manual / No CRM',
              value: 'manual',
            },
          ],
          defaultValue: 'manual',
        },
        {
          name: 'feedUrl',
          type: 'text',
          admin: {
            description: 'URL to the agency property feed.',
          },
        },
        {
          name: 'username',
          type: 'text',
        },
        {
          name: 'password',
          type: 'text',
          admin: {
            description: 'For MVP only. Later this should be encrypted.',
          },
        },
        {
          name: 'lastImportAt',
          type: 'date',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'lastImportStatus',
          type: 'textarea',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
  ],
}
