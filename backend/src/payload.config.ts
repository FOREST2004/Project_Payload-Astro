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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
  },
  secret: process.env.PAYLOAD_SECRET as string,
  editor: lexicalEditor({}),
  collections: [Tenants, Pages, Tickets, SiteSettings, Users],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI as string,
    },
  }),
  cors: ['http://localhost:4321', process.env.FRONTEND_URL || ''].filter(Boolean),
})
