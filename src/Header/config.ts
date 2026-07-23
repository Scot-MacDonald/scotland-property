import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

const isSuperAdmin = (user: unknown) => {
  return (
    typeof user === 'object' &&
    user !== null &&
    'collection' in user &&
    user.collection === 'users' &&
    'role' in user &&
    user.role === 'super-admin'
  )
}

export const Header: GlobalConfig = {
  slug: 'header',

  admin: {
    hidden: ({ user }) => !isSuperAdmin(user),
  },

  access: {
    read: () => true,
  },

  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],

  hooks: {
    afterChange: [revalidateHeader],
  },
}
