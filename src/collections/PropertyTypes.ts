import type { CollectionConfig } from 'payload'

export const PropertyTypes: CollectionConfig = {
  slug: 'property-types',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
}
