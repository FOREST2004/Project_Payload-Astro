import type { CollectionConfig } from 'payload'
import { isTenantMember, filterByUserTenants } from "../Pages/access";

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderCode',
  },
  access: {
    read: isTenantMember,
    create: isTenantMember,
    update: isTenantMember,
    delete: isTenantMember,
  },

  fields: [
    {
      name: 'orderCode',
      type: 'text',
      label: 'Mã đơn hàng',
      required: true,
      index: true,
      unique: true,
      admin: { readOnly: true },
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
    {
      name: 'status',
      type: 'select',
      label: 'Trạng thái',
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Chờ xác nhận', value: 'pending' },
        { label: 'Đã xác nhận', value: 'confirmed' },
        { label: 'Đã hoàn thành', value: 'completed' },
        { label: 'Đã hủy', value: 'cancelled' },
      ],
    },
    {
      name: 'buyerName',
      type: 'text',
      label: 'Tên người mua',
      required: true,
    },
    {
      name: 'buyerEmail',
      type: 'email',
      label: 'Email',
      required: true,
    },
    {
      name: 'buyerPhone',
      type: 'text',
      label: 'Số điện thoại',
      required: true,
    },
    {
      name: 'ticket',
      type: 'relationship',
      label: 'Vé',
      relationTo: 'tickets',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'quantity',
      type: 'number',
      label: 'Số lượng vé',
      required: true,
      defaultValue: 1,
      min: 1,
    },
    {
      name: 'totalAmount',
      type: 'number',
      label: 'Tổng tiền (VNĐ)',
      required: true,
      min: 0,
    },
    {
      name: 'paymentMethod',
      type: 'select',
      label: 'Phương thức thanh toán',
      options: [
        { label: 'Tiền mặt', value: 'cash' },
        { label: 'Chuyển khoản', value: 'bank-transfer' },
        { label: 'VNPay', value: 'vnpay' },
        { label: 'MoMo', value: 'momo' },
        { label: 'ZaloPay', value: 'zalopay' },
      ],
    },
    {
      name: 'paymentStatus',
      type: 'select',
      label: 'Trạng thái thanh toán',
      defaultValue: 'unpaid',
      index: true,
      options: [
        { label: 'Chưa thanh toán', value: 'unpaid' },
        { label: 'Đã thanh toán', value: 'paid' },
        { label: 'Đã hoàn tiền', value: 'refunded' },
      ],
    },

  ],
}
