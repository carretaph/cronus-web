import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const contractDraftStorageKey = 'cronus_contract_draft_v1'

type YesNoOption = 'Yes' | 'No' | 'Unknown'
type OccupancyType =
  | 'Owner Occupied'
  | 'Tenant Occupied'
  | 'Vacant'
  | 'Other'

type PropertyType =
  | 'Single Family'
  | 'Townhouse'
  | 'Condominium'
  | 'Multi-Family'
  | 'Commercial'
  | 'Other'

type ContractProjectForm = {
  salesRepresentative: string
  salesManager: string
  projectManager: string
  leadSource: string
  contractDate: string

  propertyType: PropertyType
  occupancyType: OccupancyType
  yearBuilt: string
  numberOfStories: string

  permitRequired: YesNoOption
  hoaRequired: YesNoOption
  engineeringRequired: YesNoOption
  historicDistrict: YesNoOption

  measurementAppointmentDate: string
  measurementAppointmentTime: string
  measurementAppointmentType: 'In Person' | 'Virtual'
  preferredInstallationDate: string
  customerAvailability: string

  accessInstructions: string
  petsOnProperty: YesNoOption
  alarmSystem: YesNoOption
  gateCode: string
  parkingInstructions: string

  productionNotes: string
  installationNotes: string
  internalNotes: string
}

const emptyForm: ContractProjectForm = {
  salesRepresentative: '',
  salesManager: '',
  projectManager: '',
  leadSource: '',
  contractDate: new Date().toISOString().slice(0, 10),

  propertyType: 'Single Family',
  occupancyType: 'Owner Occupied',
  yearBuilt: '',
  numberOfStories: '1',

  permitRequired: 'Unknown',
  hoaRequired: 'Unknown',
  engineeringRequired: 'Unknown',
  historicDistrict: 'Unknown',

  measurementAppointmentDate: '',
  measurementAppointmentTime: '',
  measurementAppointmentType: 'In Person',
  preferredInstallationDate: '',
  customerAvailability: '',

  accessInstructions: '',
  petsOnProperty: 'Unknown',
  alarmSystem: 'Unknown',
  gateCode: '',
  parkingInstructions: '',

  productionNotes: '',
  installationNotes: '',
  internalNotes: '',
}

export default function ContractProject() {
  const navigate = useNavigate()

  const [form, setForm] =
    useState<ContractProjectForm>(emptyForm)

  useEffect(() => {
    const storedDraft = localStorage.getItem(
      contractDraftStorageKey,
    )

    if (!storedDraft) {
      return
    }

    try {
      const parsedDraft = JSON.parse(storedDraft)

      setForm((current) => ({
        ...current,
        ...parsedDraft.project,
      }))
    } catch {
      localStorage.removeItem(contractDraftStorageKey)
    }
  }, [])

  function updateField<
    Key extends keyof ContractProjectForm,
  >(
    field: Key,
    value: ContractProjectForm[Key],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function saveProjectDraft() {
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
      project: form,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(
      contractDraftStorageKey,
      JSON.stringify(updatedDraft),
    )
  }

  function handleBack() {
    saveProjectDraft()
    navigate('/portal/contracts/new')
  }

  function handleNext() {
    saveProjectDraft()
    navigate('/portal/contracts/products')
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
              Project Information
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#777777]">
              Enter the sales, property, permitting and
              installation information for this project.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E4DD] bg-white px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#999999]">
              Step 2 of 8
            </p>

            <p className="mt-1 text-sm font-medium text-[#555555]">
              Project
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#E8E4DD] bg-white p-6 shadow-sm sm:p-8">
          <SectionTitle
            title="Sales Information"
            description="Team members and lead information associated with this contract."
          />

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <Field
              label="Sales Representative"
              value={form.salesRepresentative}
              required
              onChange={(value) =>
                updateField('salesRepresentative', value)
              }
            />

            <Field
              label="Sales Manager"
              value={form.salesManager}
              onChange={(value) =>
                updateField('salesManager', value)
              }
            />

            <Field
              label="Project Manager"
              value={form.projectManager}
              onChange={(value) =>
                updateField('projectManager', value)
              }
            />

            <Field
              label="Lead Source"
              value={form.leadSource}
              placeholder="Referral, Website, Home Show..."
              onChange={(value) =>
                updateField('leadSource', value)
              }
            />

            <Field
              label="Contract Date"
              type="date"
              value={form.contractDate}
              required
              onChange={(value) =>
                updateField('contractDate', value)
              }
            />
          </div>

          <Divider />

          <SectionTitle
            title="Property Information"
            description="Basic information about the home or building where the work will be completed."
          />

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <SelectField
              label="Property Type"
              value={form.propertyType}
              options={[
                'Single Family',
                'Townhouse',
                'Condominium',
                'Multi-Family',
                'Commercial',
                'Other',
              ]}
              onChange={(value) =>
                updateField(
                  'propertyType',
                  value as PropertyType,
                )
              }
            />

            <SelectField
              label="Occupancy"
              value={form.occupancyType}
              options={[
                'Owner Occupied',
                'Tenant Occupied',
                'Vacant',
                'Other',
              ]}
              onChange={(value) =>
                updateField(
                  'occupancyType',
                  value as OccupancyType,
                )
              }
            />

            <Field
              label="Year Built"
              type="number"
              value={form.yearBuilt}
              placeholder="Example: 2005"
              onChange={(value) =>
                updateField('yearBuilt', value)
              }
            />

            <Field
              label="Number of Stories"
              type="number"
              value={form.numberOfStories}
              onChange={(value) =>
                updateField('numberOfStories', value)
              }
            />
          </div>

          <Divider />

          <SectionTitle
            title="Permits and Approvals"
            description="Requirements that must be completed before production or installation."
          />

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <YesNoField
              label="Permit Required"
              value={form.permitRequired}
              onChange={(value) =>
                updateField('permitRequired', value)
              }
            />

            <YesNoField
              label="HOA Approval Required"
              value={form.hoaRequired}
              onChange={(value) =>
                updateField('hoaRequired', value)
              }
            />

            <YesNoField
              label="Engineering Required"
              value={form.engineeringRequired}
              onChange={(value) =>
                updateField('engineeringRequired', value)
              }
            />

            <YesNoField
              label="Historic District"
              value={form.historicDistrict}
              onChange={(value) =>
                updateField('historicDistrict', value)
              }
            />
          </div>

          <Divider />

          <SectionTitle
            title="Measurement and Scheduling"
            description="Schedule the precise measurement appointment and record installation preferences."
          />

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <Field
              label="Precise Measurement Date"
              type="date"
              value={form.measurementAppointmentDate}
              onChange={(value) =>
                updateField(
                  'measurementAppointmentDate',
                  value,
                )
              }
            />

            <Field
              label="Precise Measurement Time"
              type="time"
              value={form.measurementAppointmentTime}
              onChange={(value) =>
                updateField(
                  'measurementAppointmentTime',
                  value,
                )
              }
            />

            <SelectField
              label="Appointment Type"
              value={form.measurementAppointmentType}
              options={['In Person', 'Virtual']}
              onChange={(value) =>
                updateField(
                  'measurementAppointmentType',
                  value as 'In Person' | 'Virtual',
                )
              }
            />

            <Field
              label="Preferred Installation Date"
              type="date"
              value={form.preferredInstallationDate}
              onChange={(value) =>
                updateField(
                  'preferredInstallationDate',
                  value,
                )
              }
            />

            <div className="md:col-span-2">
              <TextArea
                label="Customer Availability"
                value={form.customerAvailability}
                placeholder="Preferred days, times or scheduling restrictions..."
                onChange={(value) =>
                  updateField('customerAvailability', value)
                }
              />
            </div>
          </div>

          <Divider />

          <SectionTitle
            title="Property Access"
            description="Important information for measurement, delivery and installation crews."
          />

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <YesNoField
              label="Pets on Property"
              value={form.petsOnProperty}
              onChange={(value) =>
                updateField('petsOnProperty', value)
              }
            />

            <YesNoField
              label="Alarm System"
              value={form.alarmSystem}
              onChange={(value) =>
                updateField('alarmSystem', value)
              }
            />

            <Field
              label="Gate or Access Code"
              value={form.gateCode}
              onChange={(value) =>
                updateField('gateCode', value)
              }
            />

            <Field
              label="Parking Instructions"
              value={form.parkingInstructions}
              onChange={(value) =>
                updateField('parkingInstructions', value)
              }
            />

            <div className="md:col-span-2">
              <TextArea
                label="Access Instructions"
                value={form.accessInstructions}
                placeholder="Locked gates, side entrance, tenant coordination, restricted areas..."
                onChange={(value) =>
                  updateField('accessInstructions', value)
                }
              />
            </div>
          </div>

          <Divider />

          <SectionTitle
            title="Project Notes"
            description="Operational notes that will remain attached to the project record."
          />

          <div className="mt-7 grid gap-5">
            <TextArea
              label="Production Notes"
              value={form.productionNotes}
              placeholder="Product preparation, manufacturing or ordering notes..."
              onChange={(value) =>
                updateField('productionNotes', value)
              }
            />

            <TextArea
              label="Installation Notes"
              value={form.installationNotes}
              placeholder="Removal conditions, wall construction, flooring, access or installation concerns..."
              onChange={(value) =>
                updateField('installationNotes', value)
              }
            />

            <TextArea
              label="Internal Notes"
              value={form.internalNotes}
              placeholder="Private company notes. These will not appear on the customer contract."
              onChange={(value) =>
                updateField('internalNotes', value)
              }
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse justify-between gap-4 sm:flex-row">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-xl border border-[#D9D4CB] bg-white px-7 py-3.5 text-sm font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#8C754A]"
          >
            Back
          </button>

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
  type?: 'text' | 'date' | 'time' | 'number'
  required?: boolean
  placeholder?: string
  onChange: (value: string) => void
}

function Field({
  label,
  value,
  type = 'text',
  required = false,
  placeholder,
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
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-xl border border-[#DDD8CF] bg-[#FCFBF9] px-4 text-sm text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
      />
    </label>
  )
}

type SelectFieldProps = {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#555555]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-xl border border-[#DDD8CF] bg-[#FCFBF9] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

type YesNoFieldProps = {
  label: string
  value: YesNoOption
  onChange: (value: YesNoOption) => void
}

function YesNoField({
  label,
  value,
  onChange,
}: YesNoFieldProps) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-[#555555]">
        {label}
      </span>

      <div className="grid grid-cols-3 gap-2">
        {(['Yes', 'No', 'Unknown'] as YesNoOption[]).map(
          (option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`h-12 rounded-xl border px-3 text-sm font-medium transition ${
                value === option
                  ? 'border-[#B59A68] bg-[#F7F2E9] text-[#8C754A]'
                  : 'border-[#DDD8CF] bg-[#FCFBF9] text-[#666666] hover:border-[#B59A68]'
              }`}
            >
              {option}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

type TextAreaProps = {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

function TextArea({
  label,
  value,
  placeholder,
  onChange,
}: TextAreaProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#555555]">
        {label}
      </span>

      <textarea
        value={value}
        placeholder={placeholder}
        rows={4}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full resize-y rounded-xl border border-[#DDD8CF] bg-[#FCFBF9] px-4 py-3 text-sm leading-6 text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
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