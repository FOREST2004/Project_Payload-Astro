import type { CollectionConfig } from 'payload'
// import { isSuperAdmin } from '../../access/isSupperAdmin'
import { isTenantMember, filterByUserTenants } from './access'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title' },
  access: {
    read: () => true,
    create: isTenantMember,
    update: isTenantMember,
    delete: isTenantMember,
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
      index: true,
      defaultValue: 'home',
    },
    {
      name: 'content',
      type: 'textarea',
      label: 'Nội dung',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
      filterOptions: filterByUserTenants,
    },
  ],
}
