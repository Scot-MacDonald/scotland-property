import { mongooseAdapter } from '@payloadcms/db-mongodb'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'

import { Countries } from './collections/Countries'
import { Regions } from './collections/Regions'
import { Towns } from './collections/Towns'
import { PropertyTypes } from './collections/PropertyTypes'
import { Amenities } from './collections/Amenities'
import { Agents } from './collections/Agents'
import { Properties } from './collections/Properties'
import { Agencies } from './collections/Agencies'
import { Enquiries } from './collections/Enquiries'
import { Buyers } from './collections/Buyers'
import { ImportLogs } from './collections/ImportLogs'
import { AlertLogs } from './collections/AlertLogs'
import { ValuationLeads } from './collections/ValuationLeads'
import { Viewings } from './collections/Viewings'
import { Activities } from './collections/Activities'
import { Tasks } from './collections/Tasks'

import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { resendAdapter } from '@payloadcms/email-resend'
import { UserInvitations } from './components/DashboardV2/Collection/UserInvitations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      // beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      // beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),

  email: resendAdapter({
    defaultFromAddress: process.env.FROM_EMAIL || 'onboarding@resend.dev',
    defaultFromName: process.env.FROM_NAME || 'Scotland Luxury Estates',
    apiKey: process.env.RESEND_API_KEY || '',
  }),

  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    Countries,
    Regions,
    Towns,
    PropertyTypes,
    Amenities,
    Agencies,
    Agents,
    Properties,
    Enquiries,
    Buyers,
    ImportLogs,
    AlertLogs,
    ValuationLeads,
    Viewings,
    Activities,
    UserInvitations,
    Tasks,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
