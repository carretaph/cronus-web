import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Customer } from '../../pages/customerdata'

type CustomerTableProps = {
  customers: Customer[]
  onDelete: (customerId: string) => void
}

export default function CustomerTable({
  customers,
  onDelete,
}: CustomerTableProps) {
  return (
    <div className="mt-6 overflow-hidden rounded-[22px] border border-[#E8E5DE] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse">
          <thead>
            <tr className="border-b border-[#E8E5DE] bg-[#FAF9F6]">
              <TableHeader>Customer</TableHeader>
              <TableHeader>Phone</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>City</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Quotes</TableHeader>
              <TableHeader align="right">
                Actions
              </TableHeader>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type CustomerRowProps = {
  customer: Customer
  onDelete: (customerId: string) => void
}

function CustomerRow({
  customer,
  onDelete,
}: CustomerRowProps) {
  const fullName =
    `${customer.firstName} ${customer.lastName}`.trim()

  const location = [
    customer.city,
    customer.state,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <tr className="border-b border-[#EFECE5] transition last:border-b-0 hover:bg-[#FCFBF8]">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0ECE3] text-sm font-medium text-[#8D7651]">
            {customer.firstName
              .charAt(0)
              .toUpperCase()}
            {customer.lastName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="font-medium text-[#3F3F3F]">
              {fullName}
            </p>

            <p className="mt-1 max-w-[250px] truncate text-xs text-[#999999]">
              {customer.address || 'No address provided'}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5 text-sm text-[#555555]">
        {customer.phone}
      </td>

      <td className="px-6 py-5 text-sm text-[#555555]">
        {customer.email || 'Not provided'}
      </td>

      <td className="px-6 py-5 text-sm text-[#555555]">
        {location || 'Not provided'}
      </td>

      <td className="px-6 py-5">
        <span className="inline-flex rounded-full bg-[#EEF5EC] px-3 py-1.5 text-xs font-medium text-[#56704F]">
          Customer
        </span>
      </td>

      <td className="px-6 py-5 text-sm text-[#555555]">
        0
      </td>

      <td className="px-6 py-5">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled
            className="rounded-lg border border-[#DDD9D0] px-3.5 py-2 text-xs font-medium text-[#777777] opacity-60"
          >
            View
          </button>

          <Link
            to="/portal/quotes/new"
            className="inline-flex items-center justify-center rounded-lg bg-[#222222] px-3.5 py-2 text-xs font-medium text-white transition hover:bg-[#B59A68]"
          >
            New quote
          </Link>

          <button
            type="button"
            onClick={() => onDelete(customer.id)}
            className="rounded-lg px-3 py-2 text-xs font-medium text-[#AAAAAA] transition hover:bg-red-50 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

type TableHeaderProps = {
  children: ReactNode
  align?: 'left' | 'right'
}

function TableHeader({
  children,
  align = 'left',
}: TableHeaderProps) {
  return (
    <th
      className={`px-6 py-4 text-xs font-medium uppercase tracking-[0.12em] text-[#999999] ${
        align === 'right'
          ? 'text-right'
          : 'text-left'
      }`}
    >
      {children}
    </th>
  )
}
