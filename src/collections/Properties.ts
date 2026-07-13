import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { authenticated } from '../access/authenticated'
import { canAgencyUsePlatform, getAgencySubscriptionBlockReason } from '../lib/canAgencyUsePlatform'

const isSuperAdmin = ({ req }: any) =>
  req.user?.collection === 'users' && req.user?.role === 'super-admin'

const agencyOnly = ({ req }: any) => {
  if (req.user?.collection === 'users' && req.user?.role === 'super-admin') return true

  if (req.user?.collection === 'users' && req.user?.agency) {
    return {
      agency: {
        equals: typeof req.user.agency === 'object' ? req.user.agency.id : req.user.agency,
      },
    }
  }

  return false
}

function getAgencyId(value: any) {
  if (!value) return null
  return typeof value === 'object' ? value.id : value
}

function getListingLimit(agency: any) {
  if (agency.subscriptionStatus === 'trial') return 5

  if (agency.subscriptionPlan === 'starter') return 25
  if (agency.subscriptionPlan === 'professional') return null
  if (agency.subscriptionPlan === 'premium') return null

  return 5
}

async function enforceListingLimit({ data, req, operation }: any) {
  if (operation !== 'create') return data
  if (req.user?.collection === 'users' && req.user.role === 'super-admin') return data

  const agencyId =
    req.user?.collection === 'users'
      ? getAgencyId(data.agency || req.user.agency)
      : getAgencyId(data.agency)

  if (!agencyId) {
    throw new APIError('A property must be assigned to an agency.', 400)
  }

  const agency = await req.payload.findByID({
    collection: 'agencies',
    id: agencyId,
    overrideAccess: true,
  })

  if (!canAgencyUsePlatform(agency)) {
    throw new APIError(
      getAgencySubscriptionBlockReason(agency) || 'Your subscription does not allow new listings.',
      403,
    )
  }

  const listingLimit = getListingLimit(agency)
  if (listingLimit === null) return data

  const currentListings = await req.payload.count({
    collection: 'properties',
    where: {
      and: [
        {
          agency: {
            equals: agencyId,
          },
        },
        {
          status: {
            not_equals: 'sold',
          },
        },
      ],
    },
    overrideAccess: true,
  })

  if (currentListings.totalDocs >= listingLimit) {
    const planName =
      agency.subscriptionStatus === 'trial' ? 'trial' : agency.subscriptionPlan || 'starter'

    throw new APIError(
      `Listing limit reached. Your ${planName} plan allows ${listingLimit} active listings.`,
      403,
    )
  }

  return data
}

export const Properties: CollectionConfig = {
  slug: 'properties',

  access: {
    read: agencyOnly,
    create: authenticated,
    update: agencyOnly,
    delete: isSuperAdmin,
  },

  hooks: {
    beforeChange: [enforceListingLimit],
  },

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
      required: true,
      defaultValue: ({ user }) => {
        if (user?.collection !== 'users') return undefined
        if (user.role === 'super-admin') return undefined
        if (!user.agency) return undefined

        return typeof user.agency === 'object' ? user.agency.id : user.agency
      },
      admin: {
        condition: (_, __, { user }) => user?.collection === 'users' && user.role === 'super-admin',
      },
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'agents',
      admin: {
        condition: (_, siblingData: any) => Boolean(siblingData?.agency),
      },
      filterOptions: ({ siblingData }: any) => {
        if (!siblingData?.agency) return false

        return {
          agency: {
            equals:
              typeof siblingData.agency === 'object' ? siblingData.agency.id : siblingData.agency,
          },
        }
      },
    },
  ],
}
