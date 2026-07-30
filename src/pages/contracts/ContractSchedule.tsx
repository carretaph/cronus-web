import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const contractHandoffStorageKey =
  'cronus_contract_handoff_v1'

const contractDraftStorageKey =
  'cronus_contract_draft_v1'

type YesNoUnknown = 'Yes' | 'No' | 'Unknown'

type ScheduleForm = {
  permitRequired: YesNoUnknown
  permitStatus: string
  permitNumber: string
  permitSubmittedDate: string
  permitApprovedDate: string

  hoaRequired: YesNoUnknown
  hoaStatus: string
  hoaContactName: string
  hoaContactPhone: string
  hoaSubmittedDate: string
  hoaApprovedDate: string

  propertyOccupied: YesNoUnknown
  gateCode: string
  alarmInstructions: string
  petsOnProperty: YesNoUnknown
  petInstructions: string
  parkingInstructions: string
  accessInstructions: string

  customerScheduleNotes: string
  internalScheduleNotes: string
}

type ContractProjectData = {
  projectAddress?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  zipcode?: string
  measurementAppointmentDate?: string
  measurementAppointmentTime?: string
  measurementAppointmentType?: string
}

type ContractHandoff = {
  contractNumber?: string
  estimateNumber?: string
  customerName?: string
  projectForm?: ContractProjectData
}

const defaultScheduleForm: ScheduleForm = {
  permitRequired: 'Unknown',
  permitStatus: 'Not Started',
  permitNumber: '',
  permitSubmittedDate: '',
  permitApprovedDate: '',

  hoaRequired: 'Unknown',
  hoaStatus: 'Not Started',
  hoaContactName: '',
  hoaContactPhone: '',
  hoaSubmittedDate: '',
  hoaApprovedDate: '',

  propertyOccupied: 'Yes',
  gateCode: '',
  alarmInstructions: '',
  petsOnProperty: 'Unknown',
  petInstructions: '',
  parkingInstructions: '',
  accessInstructions: '',

  customerScheduleNotes: '',
  internalScheduleNotes: '',
}

function formatDate(value: string) {
  if (!value) {
    return 'Not scheduled'
  }

  const date = new Date(`${value}T12:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function getProjectAddress(
  handoff: ContractHandoff | null,
) {
  const projectForm = handoff?.projectForm

  if (!projectForm) {
    return 'Not specified'
  }

  const street =
    projectForm.projectAddress ||
    projectForm.address ||
    ''

  const cityStateZip = [
    projectForm.city,
    projectForm.state,
    projectForm.zipCode || projectForm.zipcode,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    [street, cityStateZip]
      .filter(Boolean)
      .join(' · ') || 'Not specified'
  )
}

export default function ContractSchedule() {
  const navigate = useNavigate()

  const [handoff, setHandoff] =
    useState<ContractHandoff | null>(null)

  const [scheduleForm, setScheduleForm] =
    useState<ScheduleForm>(defaultScheduleForm)

  const [saveStatus, setSaveStatus] = useState<
    'saving' | 'saved'
  >('saved')

  useEffect(() => {
    const storedHandoff = localStorage.getItem(
      contractHandoffStorageKey,
    )

    const storedDraft = localStorage.getItem(
      contractDraftStorageKey,
    )

    let parsedHandoff: ContractHandoff = {}
    let savedSchedule: Partial<ScheduleForm> = {}

    if (storedHandoff) {
      try {
        parsedHandoff = JSON.parse(
          storedHandoff,
        ) as ContractHandoff
      } catch {
        localStorage.removeItem(
          contractHandoffStorageKey,
        )
      }
    }

    if (storedDraft) {
      try {
        const parsedDraft = JSON.parse(storedDraft)

        parsedHandoff = {
          ...parsedHandoff,
          contractNumber:
            parsedDraft.contractNumber ??
            parsedHandoff.contractNumber,
          estimateNumber:
            parsedDraft.estimateNumber ??
            parsedHandoff.estimateNumber,
          customerName:
            parsedDraft.customerName ??
            parsedHandoff.customerName,
          projectForm: {
            ...(parsedHandoff.projectForm ?? {}),
            ...(parsedDraft.projectForm ?? {}),
            ...(parsedDraft.project ?? {}),
          },
        }

        if (
          parsedDraft.schedule &&
          typeof parsedDraft.schedule === 'object'
        ) {
          savedSchedule =
            parsedDraft.schedule as Partial<ScheduleForm>
        }
      } catch {
        localStorage.removeItem(
          contractDraftStorageKey,
        )
      }
    }

    setHandoff(parsedHandoff)

    setScheduleForm({
      ...defaultScheduleForm,
      ...savedSchedule,
    })
  }, [])

  useEffect(() => {
    setSaveStatus('saving')

    const timer = window.setTimeout(() => {
      saveScheduleDraft(false)
      setSaveStatus('saved')
    }, 400)

    return () => window.clearTimeout(timer)
  }, [scheduleForm, handoff])

  const projectAddress = useMemo(
    () => getProjectAddress(handoff),
    [handoff],
  )

  function updateField<Field extends keyof ScheduleForm>(
    field: Field,
    value: ScheduleForm[Field],
  ) {
    setScheduleForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function saveScheduleDraft(
    updateTimestamp = true,
  ) {
    const storedDraft = localStorage.getItem(
      contractDraftStorageKey,
    )

    let parsedDraft: Record<string, unknown> = {}

    if (storedDraft) {
      try {
        parsedDraft = JSON.parse(storedDraft)
      } catch {
        parsedDraft = {}
      }
    }

    const updatedDraft = {
      ...parsedDraft,
      contractNumber:
        handoff?.contractNumber ?? '',
      estimateNumber:
        handoff?.estimateNumber ?? '',
      customerName:
        handoff?.customerName ?? '',
      schedule: {
        ...scheduleForm,
      },
      ...(updateTimestamp
        ? {
            updatedAt: new Date().toISOString(),
          }
        : {}),
    }

    localStorage.setItem(
      contractDraftStorageKey,
      JSON.stringify(updatedDraft),
    )
  }

  function handleBack() {
    saveScheduleDraft()
    navigate('/portal/contracts/payment')
  }

  function handleNext() {
    saveScheduleDraft()
    navigate('/portal/contracts/terms')
  }

  const measurementDate =
    handoff?.projectForm?.measurementAppointmentDate ?? ''

  const measurementTime =
    handoff?.projectForm?.measurementAppointmentTime ?? ''

  const measurementType =
    handoff?.projectForm?.measurementAppointmentType ??
    'Not specified'

  const measurementStatus = measurementDate
    ? 'Scheduled'
    : 'Not Scheduled'

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Contract Wizard
            </p>

            <h1 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              Project Readiness
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#777777]">
              Track permits, HOA requirements, property access
              and the items needed before manufacturing can begin.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E4DD] bg-white px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#999999]">
              Step 5 of 8
            </p>

            <p className="mt-1 text-sm font-medium text-[#555555]">
              Project Readiness
            </p>
          </div>
        </div>

        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Contract"
            value={handoff?.contractNumber || 'Not assigned'}
          />

          <SummaryCard
            label="Customer"
            value={handoff?.customerName || 'Not specified'}
          />

          <SummaryCard
            label="Measurement Date"
            value={formatDate(measurementDate)}
          />

          <SummaryCard
            label="Measurement Type"
            value={measurementType}
          />
        </div>

        <div className="grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-7">
            <FormSection
              eyebrow="Permits"
              title="Permit information"
              description="Track permit requirements, submission and approval."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="Permit required"
                  value={scheduleForm.permitRequired}
                  onChange={(value) =>
                    updateField(
                      'permitRequired',
                      value as YesNoUnknown,
                    )
                  }
                  options={yesNoUnknownOptions}
                />

                <SelectField
                  label="Permit status"
                  value={scheduleForm.permitStatus}
                  onChange={(value) =>
                    updateField('permitStatus', value)
                  }
                  options={[
                    { value: 'Not Started', label: 'Not Started' },
                    { value: 'Documents Needed', label: 'Documents Needed' },
                    { value: 'Submitted', label: 'Submitted' },
                    { value: 'Approved', label: 'Approved' },
                    { value: 'Not Required', label: 'Not Required' },
                  ]}
                />

                <TextField
                  label="Permit number"
                  value={scheduleForm.permitNumber}
                  placeholder="Permit number"
                  onChange={(value) =>
                    updateField('permitNumber', value)
                  }
                />

                <DateField
                  label="Submitted date"
                  value={scheduleForm.permitSubmittedDate}
                  onChange={(value) =>
                    updateField('permitSubmittedDate', value)
                  }
                />

                <DateField
                  label="Approved date"
                  value={scheduleForm.permitApprovedDate}
                  onChange={(value) =>
                    updateField('permitApprovedDate', value)
                  }
                />
              </div>
            </FormSection>

            <FormSection
              eyebrow="HOA"
              title="Homeowners association"
              description="Track HOA application and approval requirements."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="HOA approval required"
                  value={scheduleForm.hoaRequired}
                  onChange={(value) =>
                    updateField(
                      'hoaRequired',
                      value as YesNoUnknown,
                    )
                  }
                  options={yesNoUnknownOptions}
                />

                <SelectField
                  label="HOA status"
                  value={scheduleForm.hoaStatus}
                  onChange={(value) =>
                    updateField('hoaStatus', value)
                  }
                  options={[
                    { value: 'Not Started', label: 'Not Started' },
                    { value: 'Documents Needed', label: 'Documents Needed' },
                    { value: 'Submitted', label: 'Submitted' },
                    { value: 'Approved', label: 'Approved' },
                    { value: 'Not Required', label: 'Not Required' },
                  ]}
                />

                <TextField
                  label="HOA contact name"
                  value={scheduleForm.hoaContactName}
                  placeholder="Contact name"
                  onChange={(value) =>
                    updateField('hoaContactName', value)
                  }
                />

                <TextField
                  label="HOA contact phone"
                  value={scheduleForm.hoaContactPhone}
                  placeholder="Phone number"
                  inputMode="tel"
                  onChange={(value) =>
                    updateField('hoaContactPhone', value)
                  }
                />

                <DateField
                  label="Submitted date"
                  value={scheduleForm.hoaSubmittedDate}
                  onChange={(value) =>
                    updateField('hoaSubmittedDate', value)
                  }
                />

                <DateField
                  label="Approved date"
                  value={scheduleForm.hoaApprovedDate}
                  onChange={(value) =>
                    updateField('hoaApprovedDate', value)
                  }
                />
              </div>
            </FormSection>

            <FormSection
              eyebrow="Property Access"
              title="Access and site conditions"
              description="Record instructions needed by measurement and field teams."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="Property occupied"
                  value={scheduleForm.propertyOccupied}
                  onChange={(value) =>
                    updateField(
                      'propertyOccupied',
                      value as YesNoUnknown,
                    )
                  }
                  options={yesNoUnknownOptions}
                />

                <SelectField
                  label="Pets on property"
                  value={scheduleForm.petsOnProperty}
                  onChange={(value) =>
                    updateField(
                      'petsOnProperty',
                      value as YesNoUnknown,
                    )
                  }
                  options={yesNoUnknownOptions}
                />

                <TextField
                  label="Gate code"
                  value={scheduleForm.gateCode}
                  placeholder="Gate or community code"
                  onChange={(value) =>
                    updateField('gateCode', value)
                  }
                />

                <TextField
                  label="Alarm instructions"
                  value={scheduleForm.alarmInstructions}
                  placeholder="Alarm instructions"
                  onChange={(value) =>
                    updateField('alarmInstructions', value)
                  }
                />
              </div>

              <div className="mt-5 space-y-5">
                <TextAreaField
                  label="Pet instructions"
                  value={scheduleForm.petInstructions}
                  placeholder="Where pets will be secured..."
                  onChange={(value) =>
                    updateField('petInstructions', value)
                  }
                />

                <TextAreaField
                  label="Parking instructions"
                  value={scheduleForm.parkingInstructions}
                  placeholder="Parking location, driveway restrictions..."
                  onChange={(value) =>
                    updateField('parkingInstructions', value)
                  }
                />

                <TextAreaField
                  label="Special access instructions"
                  value={scheduleForm.accessInstructions}
                  placeholder="Keys, tenant contact, restricted areas..."
                  onChange={(value) =>
                    updateField('accessInstructions', value)
                  }
                />
              </div>
            </FormSection>

            <FormSection
              eyebrow="Notes"
              title="Project readiness notes"
              description="Add customer-facing instructions and internal project notes."
            >
              <div className="space-y-5">
                <TextAreaField
                  label="Customer notes"
                  value={scheduleForm.customerScheduleNotes}
                  placeholder="Customer availability or project requirements..."
                  onChange={(value) =>
                    updateField('customerScheduleNotes', value)
                  }
                />

                <TextAreaField
                  label="Internal notes"
                  value={scheduleForm.internalScheduleNotes}
                  placeholder="Internal notes for operations..."
                  onChange={(value) =>
                    updateField('internalScheduleNotes', value)
                  }
                />
              </div>
            </FormSection>
          </div>

          <aside className="h-fit rounded-[28px] border border-[#E8E4DD] bg-white p-6 shadow-sm sm:p-8 xl:sticky xl:top-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
              Readiness Summary
            </p>

            <h2 className="mt-3 text-2xl font-light text-[#555555]">
              Project readiness
            </h2>

            <div className="mt-8 space-y-5">
              <SummaryLine
                label="Project address"
                value={projectAddress}
              />

              <SummaryLine
                label="Measurement date"
                value={formatDate(measurementDate)}
              />

              <SummaryLine
                label="Measurement time"
                value={measurementTime || 'Not selected'}
              />

              <SummaryLine
                label="Appointment type"
                value={measurementType}
              />

              <SummaryLine
                label="Measurement status"
                value={measurementStatus}
              />

              <SummaryLine
                label="Permit"
                value={scheduleForm.permitStatus}
              />

              <SummaryLine
                label="HOA"
                value={scheduleForm.hoaStatus}
              />
            </div>

            <div className="mt-8 rounded-2xl bg-[#1C2D36] p-6 text-white">
              <p className="text-xs uppercase tracking-[0.16em] text-white/60">
                Current Status
              </p>

              <p className="mt-3 text-2xl font-light">
                {getReadinessStatus(
                  scheduleForm,
                  measurementStatus,
                )}
              </p>

              <p className="mt-4 text-sm leading-6 text-white/65">
                Manufacturing can begin once precise
                measurements, permits and HOA requirements
                are completed.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-[#E8E4DD] bg-[#FCFBF9] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#999999]">
                Save Status
              </p>

              <p className="mt-2 text-sm font-medium text-[#555555]">
                {saveStatus === 'saving'
                  ? 'Saving changes...'
                  : 'All changes saved'}
              </p>
            </div>
          </aside>
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
            className="rounded-xl bg-[#222222] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#B59A68]"
          >
            Save and Continue
          </button>
        </div>
      </div>
    </section>
  )
}

const yesNoUnknownOptions = [
  {
    value: 'Unknown',
    label: 'Unknown',
  },
  {
    value: 'Yes',
    label: 'Yes',
  },
  {
    value: 'No',
    label: 'No',
  },
]

function getReadinessStatus(
  schedule: ScheduleForm,
  measurementStatus: string,
) {
  const permitReady = [
    'Approved',
    'Not Required',
  ].includes(schedule.permitStatus)

  const hoaReady = [
    'Approved',
    'Not Required',
  ].includes(schedule.hoaStatus)

  if (
    measurementStatus === 'Scheduled' &&
    permitReady &&
    hoaReady
  ) {
    return 'Ready for Production Review'
  }

  if (
    measurementStatus === 'Scheduled' ||
    schedule.permitStatus === 'Submitted' ||
    schedule.hoaStatus === 'Submitted'
  ) {
    return 'In Progress'
  }

  return 'Pending Requirements'
}

function FormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-[#E8E4DD] bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-2xl font-light text-[#555555]">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#888888]">
        {description}
      </p>

      <div className="mt-7">{children}</div>
    </section>
  )
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[#E8E4DD] bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#999999]">
        {label}
      </p>

      <p className="mt-2 truncate text-lg font-medium text-[#555555]">
        {value}
      </p>
    </div>
  )
}

function SummaryLine({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[#EEEAE4] pb-5 last:border-b-0 last:pb-0">
      <p className="text-sm text-[#888888]">
        {label}
      </p>

      <p className="max-w-[60%] text-right text-sm font-medium leading-6 text-[#555555]">
        {value}
      </p>
    </div>
  )
}

function TextField({
  label,
  value,
  placeholder,
  suffix,
  inputMode = 'text',
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  suffix?: string
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel'
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="text-sm font-medium text-[#666666]">
        {label}
      </label>

      <div className="relative mt-2">
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white ${
            suffix ? 'pr-20' : ''
          }`}
        />

        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-medium uppercase tracking-[0.1em] text-[#999999]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="text-sm font-medium text-[#666666]">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{
    value: string
    label: string
  }>
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="text-sm font-medium text-[#666666]">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function TextAreaField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="text-sm font-medium text-[#666666]">
        {label}
      </label>

      <textarea
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full resize-none rounded-2xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 py-4 text-sm leading-6 text-[#555555] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
      />
    </div>
  )
}