import type { CollectionConfig } from 'payload'

export const Regions: CollectionConfig = {
  slug: 'regions',
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
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'country',
      type: 'relationship',
      relationTo: 'countries',
      required: true,
    },
  ],
}
