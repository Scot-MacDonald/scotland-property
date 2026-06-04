import type { CollectionConfig } from 'payload'

export const Properties: CollectionConfig = {
  slug: 'properties',

  admin: {
    useAsTitle: 'title',
  },

  fields: [
    {
      name: 'title',
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
      name: 'reference',
      type: 'text',
      unique: true,
    },

    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary shown on listing cards.',
      },
    },

    {
      name: 'status',
      type: 'select',
      defaultValue: 'for-sale',
      options: [
        {
          label: 'For Sale',
          value: 'for-sale',
        },
        {
          label: 'Sold',
          value: 'sold',
        },
        {
          label: 'Reserved',
          value: 'reserved',
        },
      ],
    },

    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },

    {
      name: 'internalArea',
      type: 'number',
      admin: {
        description: 'Interior size in square metres.',
      },
    },

    {
      name: 'landArea',
      type: 'number',
      admin: {
        description: 'Land size in acres or square metres.',
      },
    },

    {
      name: 'yearBuilt',
      type: 'number',
    },

    {
      name: 'energyRating',
      type: 'text',
    },

    {
      name: 'latitude',
      type: 'number',
    },

    {
      name: 'longitude',
      type: 'number',
    },

    {
      name: 'virtualTour',
      type: 'text',
    },

    {
      name: 'youtubeVideo',
      type: 'text',
    },

    {
      name: 'region',
      type: 'relationship',
      relationTo: 'regions',
      required: true,
    },

    {
      name: 'town',
      type: 'relationship',
      relationTo: 'towns',
      required: true,
    },

    {
      name: 'propertyType',
      type: 'relationship',
      relationTo: 'property-types',
    },

    {
      name: 'bedrooms',
      type: 'number',
    },

    {
      name: 'bathrooms',
      type: 'number',
    },

    {
      name: 'description',
      type: 'richText',
    },

    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },

    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'floorPlans',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },

    {
      name: 'amenities',
      type: 'relationship',
      relationTo: 'amenities',
      hasMany: true,
    },
    {
      name: 'propertyFeatures',
      type: 'array',
      fields: [
        {
          name: 'feature',
          type: 'text',
        },
      ],
    },
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'agents',
    },
  ],
}
