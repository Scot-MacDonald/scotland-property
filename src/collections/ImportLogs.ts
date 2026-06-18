import type { CollectionConfig } from 'payload'

export const ImportLogs: CollectionConfig = {
  slug: 'import-logs',

  admin: {
    useAsTitle: 'agencyName',
  },

  access: {
    read: () => true,
    create: () => true,
    update: () => false,
    delete: () => false,
  },

  fields: [
    {
      name: 'agencyName',
      type: 'text',
      required: true,
    },

    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Success',
          value: 'success',
        },
        {
          label: 'Failed',
          value: 'failed',
        },
      ],
    },

    {
      name: 'found',
      type: 'number',
    },

    {
      name: 'created',
      type: 'number',
    },

    {
      name: 'updated',
      type: 'number',
    },

    {
      name: 'skipped',
      type: 'number',
    },

    {
      name: 'imagesUploaded',
      type: 'number',
    },

    {
      name: 'imagesReused',
      type: 'number',
    },

    {
      name: 'agentsMatched',
      type: 'number',
    },

    {
      name: 'amenitiesMatched',
      type: 'number',
    },

    {
      name: 'errorMessage',
      type: 'textarea',
    },
  ],
}
