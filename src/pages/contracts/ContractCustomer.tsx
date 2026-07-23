import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const contractHandoffStorageKey = 'cronus_contract_handoff_v1'
const contractDraftStorageKey = 'cronus_contract_draft_v1'

type ContractCustomerForm = {
  contractNumber: string
  estimateNumber: string
  buyerFirstName: string
  buyerLastName: string
  coBuyerFirstName: string
  coBuyerLastName: string
  companyName: string
  email: string
  primaryPhone: string
  secondaryPhone: string
  billingAddress: string
  billingCity: string
  billingState: string
  billingZipCode: string
  projectSameAsBilling: boolean
  projectAddress: string
  projectCity: string
  projectState: string
  projectZipCode: string
}

const emptyForm: ContractCustomerForm = {
  contractNumber: '',
  estimateNumber: '',
  buyerFirstName: '',
  buyerLastName: '',
  coBuyerFirstName: '',
  coBuyerLastName: '',
  companyName: '',
  email: '',
  primaryPhone: '',
  secondaryPhone: '',
  billingAddress: '',
  billingCity: '',
  billingState: 'FL',
  billingZipCode: '',
  projectSameAsBilling: true,
  projectAddress: '',
  projectCity: '',
  projectState: 'FL',
  projectZipCode: '',
}

export default function ContractCustomer() {
  const navigate = useNavigate()

  const [form, setForm] =
    useState<ContractCustomerForm>(emptyForm)

  useEffect(() => {
    const storedDraft = localStorage.getItem(
      contractDraftStorageKey,
    )

    if (storedDraft) {
      try {
        const parsedDraft = JSON.parse(storedDraft)

        setForm((current) => ({
          ...current,
          ...parsedDraft.customer,
          contractNumber:
            parsedDraft.contractNumber ??
            current.contractNumber,
          estimateNumber:
            parsedDraft.estimateNumber ??
            current.estimateNumber,
        }))
      } catch {
        localStorage.removeItem(contractDraftStorageKey)
      }
    }

    const storedHandoff = localStorage.getItem(
      contractHandoffStorageKey,
    )

    if (!storedHandoff) {
      return
    }

    try {
      const parsedHandoff = JSON.parse(storedHandoff)

      const customer =
  parsedHandoff.customer ??
  parsedHandoff.customerData ??
  {}

const fullName =
  parsedHandoff.customerName ??
  customer.fullName ??
  ''

const nameParts = fullName
  .trim()
  .split(/\s+/)
  .filter(Boolean)

const buyerFirstName =
  customer.firstName ??
  nameParts[0] ??
  ''

const buyerLastName =
  customer.lastName ??
  nameParts.slice(1).join(' ')

const completeAddress =
  parsedHandoff.projectForm?.projectAddress ??
  ''

const addressParts = completeAddress
  .split(',')
  .map((part: string) => part.trim())

const streetAddress = addressParts[0] ?? ''
const city = addressParts[1] ?? ''
const state = addressParts[2] ?? 'FL'
const zipCode = addressParts[3] ?? ''

setForm((current) => ({
  ...current,

  contractNumber:
    parsedHandoff.contractNumber ??
    current.contractNumber,

  estimateNumber:
    parsedHandoff.estimateNumber ??
    current.estimateNumber,

  buyerFirstName:
    current.buyerFirstName ||
    buyerFirstName,

  buyerLastName:
    current.buyerLastName ||
    buyerLastName,

  companyName:
    current.companyName ||
    customer.companyName ||
    customer.company ||
    '',

  email:
    current.email ||
    parsedHandoff.customerEmail ||
    '',

  primaryPhone:
    current.primaryPhone ||
    parsedHandoff.customerPhone ||
    '',

  secondaryPhone:
    current.secondaryPhone ||
    customer.secondaryPhone ||
    '',

  billingAddress:
    current.billingAddress ||
    streetAddress,

  billingCity:
    current.billingCity ||
    city,

  billingState:
    current.billingState !== 'FL'
      ? current.billingState
      : state || 'FL',

  billingZipCode:
    current.billingZipCode ||
    zipCode,

  projectAddress:
    current.projectAddress ||
    streetAddress,

  projectCity:
    current.projectCity ||
    city,

  projectState:
    current.projectState !== 'FL'
      ? current.projectState
      : state || 'FL',

  projectZipCode:
    current.projectZipCode ||
    zipCode,
}))
    } catch {
      localStorage.removeItem(contractHandoffStorageKey)
    }
  }, [])

  function updateField<
    Key extends keyof ContractCustomerForm,
  >(
    field: Key,
    value: ContractCustomerForm[Key],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleNext() {
    const projectAddress = form.projectSameAsBilling
      ? form.billingAddress
      : form.projectAddress

    const projectCity = form.projectSameAsBilling
      ? form.billingCity
      : form.projectCity

    const projectState = form.projectSameAsBilling
      ? form.billingState
      : form.projectState

    const projectZipCode = form.projectSameAsBilling
      ? form.billingZipCode
      : form.projectZipCode

    const existingDraft = localStorage.getItem(
      contractDraftStorageKey,
    )

    let parsedDraft = {}

    if (existingDraft) {
      try {
        parsedDraft = JSON.parse(existingDraft)
      } catch {
        parsedDraft = {}
      }
    }

    const updatedDraft = {
      ...parsedDraft,
      contractNumber: form.contractNumber,
      estimateNumber: form.estimateNumber,
      customer: {
        ...form,
        projectAddress,
        projectCity,
        projectState,
        projectZipCode,
      },
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(
      contractDraftStorageKey,
      JSON.stringify(updatedDraft),
    )

    navigate('/portal/contracts/project')
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Contract Wizard
            </p>

            <h1 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              Customer Information
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#777777]">
              Confirm the buyer, contact and project
              address information before continuing.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E4DD] bg-white px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#999999]">
              Step 1 of 8
            </p>

            <p className="mt-1 text-sm font-medium text-[#555555]">
              Customer
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Field
            label="Contract Number"
            value={form.contractNumber}
            onChange={(value) =>
              updateField('contractNumber', value)
            }
          />

          <Field
            label="Estimate Number"
            value={form.estimateNumber}
            onChange={(value) =>
              updateField('estimateNumber', value)
            }
          />
        </div>

        <div className="rounded-[28px] border border-[#E8E4DD] bg-white p-6 shadow-sm sm:p-8">
          <SectionTitle
            title="Buyer Information"
            description="Primary customer responsible for the contract."
          />

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <Field
              label="Buyer First Name"
              value={form.buyerFirstName}
              required
              onChange={(value) =>
                updateField('buyerFirstName', value)
              }
            />

            <Field
              label="Buyer Last Name"
              value={form.buyerLastName}
              required
              onChange={(value) =>
                updateField('buyerLastName', value)
              }
            />

            <Field
              label="Co-Buyer First Name"
              value={form.coBuyerFirstName}
              onChange={(value) =>
                updateField('coBuyerFirstName', value)
              }
            />

            <Field
              label="Co-Buyer Last Name"
              value={form.coBuyerLastName}
              onChange={(value) =>
                updateField('coBuyerLastName', value)
              }
            />

            <div className="md:col-span-2">
              <Field
                label="Company Name"
                value={form.companyName}
                onChange={(value) =>
                  updateField('companyName', value)
                }
              />
            </div>
          </div>

          <Divider />

          <SectionTitle
            title="Contact Information"
            description="Email and phone numbers used for project communication."
          />

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <Field
              label="Email"
              type="email"
              value={form.email}
              required
              onChange={(value) =>
                updateField('email', value)
              }
            />

            <Field
              label="Primary Phone"
              type="tel"
              value={form.primaryPhone}
              required
              onChange={(value) =>
                updateField('primaryPhone', value)
              }
            />

            <Field
              label="Secondary Phone"
              type="tel"
              value={form.secondaryPhone}
              onChange={(value) =>
                updateField('secondaryPhone', value)
              }
            />
          </div>

          <Divider />

          <SectionTitle
            title="Billing Address"
            description="Customer billing and mailing address."
          />

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field
                label="Street Address"
                value={form.billingAddress}
                required
                onChange={(value) =>
                  updateField('billingAddress', value)
                }
              />
            </div>

            <Field
              label="City"
              value={form.billingCity}
              required
              onChange={(value) =>
                updateField('billingCity', value)
              }
            />

            <div className="grid grid-cols-[120px_1fr] gap-4">
              <Field
                label="State"
                value={form.billingState}
                required
                onChange={(value) =>
                  updateField('billingState', value)
                }
              />

              <Field
                label="ZIP Code"
                value={form.billingZipCode}
                required
                onChange={(value) =>
                  updateField('billingZipCode', value)
                }
              />
            </div>
          </div>

          <Divider />

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <SectionTitle
              title="Project Address"
              description="Address where the products will be installed."
            />

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E8E4DD] px-4 py-3">
              <input
                type="checkbox"
                checked={form.projectSameAsBilling}
                onChange={(event) =>
                  updateField(
                    'projectSameAsBilling',
                    event.target.checked,
                  )
                }
                className="h-4 w-4"
              />

              <span className="text-sm text-[#666666]">
                Same as billing address
              </span>
            </label>
          </div>

          {!form.projectSameAsBilling && (
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field
                  label="Street Address"
                  value={form.projectAddress}
                  required
                  onChange={(value) =>
                    updateField('projectAddress', value)
                  }
                />
              </div>

              <Field
                label="City"
                value={form.projectCity}
                required
                onChange={(value) =>
                  updateField('projectCity', value)
                }
              />

              <div className="grid grid-cols-[120px_1fr] gap-4">
                <Field
                  label="State"
                  value={form.projectState}
                  required
                  onChange={(value) =>
                    updateField('projectState', value)
                  }
                />

                <Field
                  label="ZIP Code"
                  value={form.projectZipCode}
                  required
                  onChange={(value) =>
                    updateField('projectZipCode', value)
                  }
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="rounded-xl bg-[#222222] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#3A3A3A]"
          >
            Save and Continue
          </button>
        </div>
      </div>
    </section>
  )
}

type FieldProps = {
  label: string
  value: string
  type?: 'text' | 'email' | 'tel'
  required?: boolean
  onChange: (value: string) => void
}

function Field({
  label,
  value,
  type = 'text',
  required = false,
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#555555]">
        {label}

        {required && (
          <span className="ml-1 text-[#B59A68]">*</span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-xl border border-[#DDD8CF] bg-[#FCFBF9] px-4 text-sm text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
      />
    </label>
  )
}

function SectionTitle({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h2 className="text-xl font-medium text-[#555555]">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-6 text-[#888888]">
        {description}
      </p>
    </div>
  )
}

function Divider() {
  return (
    <div className="my-9 border-t border-[#EEEAE4]" />
  )
}