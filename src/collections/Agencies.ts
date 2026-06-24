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
      name: 'subscriptionPlan',
      type: 'select',
      defaultValue: 'starter',
      options: [
        {
          label: 'Starter',
          value: 'starter',
        },
        {
          label: 'Professional',
          value: 'professional',
        },
        {
          label: 'Premium',
          value: 'premium',
        },
      ],
      admin: {
        description: 'Controls agency listing limits and platform features.',
      },
    },

    {
      name: 'subscriptionStatus',
      type: 'select',
      defaultValue: 'trial',
      options: [
        {
          label: 'Trial',
          value: 'trial',
        },
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Past Due',
          value: 'past-due',
        },
        {
          label: 'Cancelled',
          value: 'cancelled',
        },
      ],
      admin: {
        description: 'Current billing/subscription status for this agency.',
      },
    },

    {
      name: 'trialEndsAt',
      type: 'date',
      admin: {
        description: 'Optional date when the agency trial ends.',
      },
    },

    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: {
        description: 'Stripe customer ID. Used later when billing is connected.',
        readOnly: true,
      },
    },

    {
      name: 'stripeSubscriptionId',
      type: 'text',
      admin: {
        description: 'Stripe subscription ID. Used later when billing is connected.',
        readOnly: true,
      },
    },

    {
      name: 'coveragePostcodes',
      type: 'array',
      label: 'Coverage Postcodes',
      admin: {
        description: 'Postcode areas this agency covers. Example: EH1, EH2, G1, AB10',
      },
      fields: [
        {
          name: 'postcode',
          type: 'text',
          required: true,
        },
      ],
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
