import type { CollectionConfig } from 'payload'
// import { isSuperAdmin } from '../../access/isSupperAdmin'
import { isTenantMember, filterByUserTenants } from '../Tenants/access'

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  access: {
    read: () => true,
    create: isTenantMember,
    update: isTenantMember,
    delete: isTenantMember,
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['user'],
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'User', value: 'user' },
      ],
    },
    {
      name: 'tenants',
      type: 'array',
      label: 'Tenants được giao',
      fields: [
        {
          name: 'tenant',
          type: 'relationship',
          relationTo: 'tenants',
          required: true,
          filterOptions: filterByUserTenants,
        },
        {
          name: 'roles',
          type: 'select',
          hasMany: true,
          defaultValue: ['viewer'],
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Viewer', value: 'viewer' },
          ],
        },
      ],
    },
  ],
}

export default Users
