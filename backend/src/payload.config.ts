import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Tenants } from './collections/Tenants/Tenants'
import { Pages } from './collections/Pages/Pages'
import { Tickets } from './collections/Tickets/Tickets'
import { SiteSettings } from './collections/SiteSettings/SiteSettings'
import Users from './collections/Users/Users'
import { Media } from './collections/Medias/Medias'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  admin: {
    user: 'users',
    // access: ({ req }) => {
    //   return Boolean(req.user)
    // },
  },
  secret: process.env.PAYLOAD_SECRET as string,
  editor: lexicalEditor({}),
  collections: [Tenants, Pages, Tickets, SiteSettings, Users, Media],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    push: true,
    pool: {
      connectionString: process.env.DATABASE_URI as string,
    },
  }),
  cors: ['http://localhost:4321', process.env.FRONTEND_URL || ''].filter(Boolean),
})
