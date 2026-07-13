import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

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

export const Footer: GlobalConfig = {
  slug: 'footer',

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
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],

  hooks: {
    afterChange: [revalidateFooter],
  },
}
