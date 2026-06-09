import type { CollectionConfig } from 'payload'

export const PropertyTypes: CollectionConfig = {
  slug: 'property-types',
  admin: {
    useAsTitle: 'name',
    hidden: ({ user }) => user?.role !== 'super-admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
}
