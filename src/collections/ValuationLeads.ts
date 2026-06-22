import type { CollectionConfig } from 'payload'

const isSuperAdmin = ({ req }: any) => req.user?.role === 'super-admin'

const agencyOnly = ({ req }: any) => {
  if (req.user?.role === 'super-admin') return true

  if (req.user?.agency) {
    return {
      assignedAgency: {
        equals: typeof req.user.agency === 'object' ? req.user.agency.id : req.user.agency,
      },
    }
  }

  return false
}

export const ValuationLeads: CollectionConfig = {
  slug: 'valuation-leads',

  admin: {
    useAsTitle: 'name',
    group: 'Leads',
    defaultColumns: ['name', 'email', 'postcode', 'propertyType', 'status', 'createdAt'],
  },

  access: {
    read: agencyOnly,
    create: () => true,
    update: agencyOnly,
    delete: isSuperAdmin,
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
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'postcode',
      type: 'text',
      required: true,
    },
    {
      name: 'propertyType',
      type: 'select',
      options: [
        { label: 'House', value: 'house' },
        { label: 'Flat / Apartment', value: 'flat' },
        { label: 'Estate', value: 'estate' },
        { label: 'Land', value: 'land' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'estimatedValue',
      type: 'number',
      admin: {
        description: 'Optional estimated value entered by the owner.',
      },
    },
    {
      name: 'message',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Valuation Booked', value: 'valuation-booked' },
        { label: 'Instruction Won', value: 'instruction-won' },
        { label: 'Lost', value: 'lost' },
      ],
    },
    {
      name: 'assignedAgency',
      type: 'relationship',
      relationTo: 'agencies',
      admin: {
        description: 'Optional agency assigned to this valuation lead.',
      },
    },
  ],
}
