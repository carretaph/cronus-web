import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import CustomerTable from '../components/customers/CustomerTable'

import {
  createCustomer,
  deleteCustomer,
  getCustomers,
} from './customerdata'

import type { Customer } from './customerdata'

type CustomerFormState = {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  notes: string
}

const emptyCustomerForm: CustomerFormState = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: 'FL',
  zipCode: '',
  notes: '',
}

export default function Customers() {
  const [customers, setCustomers] =
    useState<Customer[]>(getCustomers)

  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomerForm, setShowCustomerForm] =
    useState(false)

  const [form, setForm] =
    useState<CustomerFormState>(emptyCustomerForm)

  const [errorMessage, setErrorMessage] =
    useState('')

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase()

    if (!normalizedSearch) {
      return customers
    }

    return customers.filter((customer) => {
      const searchableText = [
        customer.firstName,
        customer.lastName,
        customer.phone,
        customer.email,
        customer.address,
        customer.city,
        customer.state,
        customer.zipCode,
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedSearch)
    })
  }, [customers, searchTerm])

  function updateForm(
    field: keyof CustomerFormState,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  function openCustomerForm() {
    setErrorMessage('')
    setForm(emptyCustomerForm)
    setShowCustomerForm(true)
  }

  function closeCustomerForm() {
    setErrorMessage('')
    setShowCustomerForm(false)
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setErrorMessage('')

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.phone.trim()
    ) {
      setErrorMessage(
        'First name, last name and phone are required.',
      )
      return
    }

    const newCustomer = createCustomer({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
      zipCode: form.zipCode.trim(),
      notes: form.notes.trim(),
    })

    setCustomers((currentCustomers) => [
      newCustomer,
      ...currentCustomers,
    ])

    setForm(emptyCustomerForm)
    setShowCustomerForm(false)
  }

  function handleDelete(customerId: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this customer?',
    )

    if (!confirmed) {
      return
    }

    deleteCustomer(customerId)

    setCustomers((currentCustomers) =>
      currentCustomers.filter(
        (customer) => customer.id !== customerId,
      ),
    )
  }

  return (
    <section className="px-5 py-9 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              CRM
            </p>

            <h2 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              Customers
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#777777]">
              Search customer records, review contact
              information and begin new quotes.
            </p>
          </div>

          <button
            type="button"
            onClick={openCustomerForm}
            className="inline-flex h-14 items-center justify-center rounded-xl bg-[#222222] px-7 text-sm font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#B59A68]"
          >
            + New customer
          </button>
        </div>

        <div className="mt-9 rounded-[22px] border border-[#E8E5DE] bg-white p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-2xl">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]">
                <SearchIcon />
              </span>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by name, phone, email, city or address"
                className="w-full rounded-xl border border-[#DDD9D0] bg-[#FAF9F6] py-3.5 pl-12 pr-4 text-sm text-[#333333] outline-none transition focus:border-[#B59A68] focus:ring-2 focus:ring-[#B59A68]/15"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#F3EFE6] px-3 py-1.5 text-xs font-medium text-[#8D7651]">
                {filteredCustomers.length}
              </span>

              <p className="text-sm text-[#888888]">
                {filteredCustomers.length === 1
                  ? 'customer'
                  : 'customers'}
              </p>
            </div>
          </div>
        </div>

        {filteredCustomers.length > 0 ? (
          <CustomerTable
            customers={filteredCustomers}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyCustomers
            hasSearch={Boolean(searchTerm.trim())}
            onCreateCustomer={openCustomerForm}
          />
        )}
      </div>

      {showCustomerForm && (
        <CustomerFormModal
          form={form}
          errorMessage={errorMessage}
          onUpdateForm={updateForm}
          onClose={closeCustomerForm}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  )
}

type EmptyCustomersProps = {
  hasSearch: boolean
  onCreateCustomer: () => void
}

function EmptyCustomers({
  hasSearch,
  onCreateCustomer,
}: EmptyCustomersProps) {
  return (
    <div className="mt-6 flex min-h-[360px] items-center justify-center rounded-[24px] border border-dashed border-[#D8D3C8] bg-white px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F2EEE5] text-[#9A8258]">
          <CustomerIcon />
        </div>

        <h3 className="mt-6 text-2xl font-light text-[#444444]">
          {hasSearch
            ? 'No matching customers'
            : 'No customers created yet'}
        </h3>

        <p className="mt-3 text-sm leading-7 text-[#888888]">
          {hasSearch
            ? 'Try another name, phone number, email, city or address.'
            : 'Create the first customer record to begin preparing Cronus quotes.'}
        </p>

        {!hasSearch && (
          <button
            type="button"
            onClick={onCreateCustomer}
            className="mt-7 rounded-xl bg-[#222222] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#B59A68]"
          >
            Create first customer
          </button>
        )}
      </div>
    </div>
  )
}

type CustomerFormModalProps = {
  form: CustomerFormState
  errorMessage: string
  onUpdateForm: (
    field: keyof CustomerFormState,
    value: string,
  ) => void
  onClose: () => void
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void
}

function CustomerFormModal({
  form,
  errorMessage,
  onUpdateForm,
  onClose,
  onSubmit,
}: CustomerFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-[26px] bg-white shadow-[0_35px_100px_rgba(0,0,0,0.25)]">
          <div className="flex items-start justify-between border-b border-[#ECE8DF] px-6 py-6 sm:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#B59A68]">
                Customer record
              </p>

              <h3 className="mt-3 text-3xl font-light tracking-[-0.03em] text-[#444444]">
                New customer
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F3EE] text-xl text-[#777777] transition hover:bg-[#ECE8DF]"
              aria-label="Close customer form"
            >
              ×
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="grid gap-5 px-6 py-7 sm:grid-cols-2 sm:px-8">
              <FormField
                label="First name"
                required
                value={form.firstName}
                onChange={(value) =>
                  onUpdateForm('firstName', value)
                }
              />

              <FormField
                label="Last name"
                required
                value={form.lastName}
                onChange={(value) =>
                  onUpdateForm('lastName', value)
                }
              />

              <FormField
                label="Phone"
                required
                type="tel"
                value={form.phone}
                onChange={(value) =>
                  onUpdateForm('phone', value)
                }
              />

              <FormField
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) =>
                  onUpdateForm('email', value)
                }
              />

              <div className="sm:col-span-2">
                <FormField
                  label="Property address"
                  value={form.address}
                  onChange={(value) =>
                    onUpdateForm('address', value)
                  }
                />
              </div>

              <FormField
                label="City"
                value={form.city}
                onChange={(value) =>
                  onUpdateForm('city', value)
                }
              />

              <div className="grid grid-cols-[0.45fr_0.55fr] gap-4">
                <FormField
                  label="State"
                  value={form.state}
                  maxLength={2}
                  onChange={(value) =>
                    onUpdateForm('state', value)
                  }
                />

                <FormField
                  label="ZIP code"
                  value={form.zipCode}
                  onChange={(value) =>
                    onUpdateForm('zipCode', value)
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#555555]">
                  Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    onUpdateForm(
                      'notes',
                      event.target.value,
                    )
                  }
                  rows={4}
                  placeholder="Customer preferences, project details or additional information"
                  className="w-full resize-none rounded-xl border border-[#DDD9D0] bg-white px-4 py-3 text-sm text-[#333333] outline-none transition focus:border-[#B59A68] focus:ring-2 focus:ring-[#B59A68]/15"
                />
              </div>

              {errorMessage && (
                <div className="sm:col-span-2">
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#ECE8DF] bg-[#FAF9F6] px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#D9D4CA] bg-white px-6 py-3.5 text-sm font-medium text-[#666666] transition hover:border-[#B59A68] hover:text-[#B59A68]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-[#222222] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#B59A68]"
              >
                Save customer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

type FormFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  maxLength?: number
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  maxLength,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#555555]">
        {label}

        {required && (
          <span className="ml-1 text-[#B59A68]">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        maxLength={maxLength}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-[#DDD9D0] bg-white px-4 py-3.5 text-sm text-[#333333] outline-none transition focus:border-[#B59A68] focus:ring-2 focus:ring-[#B59A68]/15"
      />
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

function CustomerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="31"
      height="31"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.5-4 2.5-6 5.5-6s5 2 5.5 6" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.5 14.2c3.2-.8 5.1.9 5.5 4.3" />
    </svg>
  )
}