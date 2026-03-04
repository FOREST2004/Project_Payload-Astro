import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    staticDir: path.resolve(dirname, '../../../publics/images'),
    staticURL: '/media',
  },
  hooks: {
    beforeOperation: [
      ({ args, operation }) => {
        if (operation === 'create' && args.req?.file) {
          const name = args.req.file.name as string
          const dotIndex = name.lastIndexOf('.')
          const base = dotIndex !== -1 ? name.slice(0, dotIndex) : name
          const ext = dotIndex !== -1 ? name.slice(dotIndex) : ''
          args.req.file.name = `${base}-${Date.now()}${ext}`
        }
        return args
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Mô tả ảnh',
    },
  ],
}
