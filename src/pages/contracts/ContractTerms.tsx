import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const contractHandoffStorageKey =
  'cronus_contract_handoff_v1'

const contractDraftStorageKey =
  'cronus_contract_draft_v1'

type TermsForm = {
  contractTermsAccepted: boolean

  cancellationNoticeReceived: boolean
  cancellationDeadline: string
  cancellationDeliveryMethod: string
  cancellationCustomerInitials: string

  lienNoticeReceived: boolean
  lienCustomerInitials: string

  noticeOfCommencementRequired: boolean
  noticeOfCommencementAcknowledged: boolean
  noticeOfCommencementStatus: string
  noticeOfCommencementCustomerInitials: string

  permitResponsibilityAcknowledged: boolean
  hoaResponsibilityAcknowledged: boolean

  paymentTermsAcknowledged: boolean
  financingTermsAcknowledged: boolean
  financingCustomerInitials: string

  changeOrderTermsAcknowledged: boolean
  concealedConditionsAcknowledged: boolean
  schedulingTermsAcknowledged: boolean
  warrantyTermsAcknowledged: boolean
  propertyAccessAcknowledged: boolean

  photoAuthorization: boolean
  marketingAuthorization: boolean

  additionalTerms: string
}

type ContractHandoff = {
  contractNumber?: string
  estimateNumber?: string
  customerName?: string
  projectTotal?: number
}

const defaultTermsForm: TermsForm = {
  contractTermsAccepted: false,

  cancellationNoticeReceived: false,
  cancellationDeadline: '',
  cancellationDeliveryMethod:
    'Written notice delivered according to the contract instructions',
  cancellationCustomerInitials: '',

  lienNoticeReceived: false,
  lienCustomerInitials: '',

  noticeOfCommencementRequired: false,
  noticeOfCommencementAcknowledged: false,
  noticeOfCommencementStatus: 'Not Started',
  noticeOfCommencementCustomerInitials: '',

  permitResponsibilityAcknowledged: false,
  hoaResponsibilityAcknowledged: false,

  paymentTermsAcknowledged: false,
  financingTermsAcknowledged: false,
  financingCustomerInitials: '',

  changeOrderTermsAcknowledged: false,
  concealedConditionsAcknowledged: false,
  schedulingTermsAcknowledged: false,
  warrantyTermsAcknowledged: false,
  propertyAccessAcknowledged: false,

  photoAuthorization: false,
  marketingAuthorization: false,

  additionalTerms: '',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function safeNumber(value: unknown) {
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : 0
}

export default function ContractTerms() {
  const navigate = useNavigate()

  const [handoff, setHandoff] =
    useState<ContractHandoff | null>(null)

  const [termsForm, setTermsForm] =
    useState<TermsForm>(defaultTermsForm)

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
    let savedTerms: Partial<TermsForm> = {}

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
          projectTotal:
            parsedDraft.products?.projectTotal ??
            parsedHandoff.projectTotal,
        }

        if (
          parsedDraft.terms &&
          typeof parsedDraft.terms === 'object'
        ) {
          savedTerms =
            parsedDraft.terms as Partial<TermsForm>
        }
      } catch {
        localStorage.removeItem(
          contractDraftStorageKey,
        )
      }
    }

    setHandoff(parsedHandoff)

    setTermsForm({
      ...defaultTermsForm,
      ...savedTerms,
    })
  }, [])

  useEffect(() => {
    setSaveStatus('saving')

    const timer = window.setTimeout(() => {
      saveTermsDraft(false)
      setSaveStatus('saved')
    }, 400)

    return () => window.clearTimeout(timer)
  }, [termsForm, handoff])

  const requiredAcknowledgments = useMemo(
    () => [
      termsForm.contractTermsAccepted,
      termsForm.cancellationNoticeReceived,
      termsForm.lienNoticeReceived,
      termsForm.permitResponsibilityAcknowledged,
      termsForm.hoaResponsibilityAcknowledged,
      termsForm.paymentTermsAcknowledged,
      termsForm.changeOrderTermsAcknowledged,
      termsForm.concealedConditionsAcknowledged,
      termsForm.schedulingTermsAcknowledged,
      termsForm.warrantyTermsAcknowledged,
      termsForm.propertyAccessAcknowledged,
      ...(termsForm.noticeOfCommencementRequired
        ? [
            termsForm.noticeOfCommencementAcknowledged,
          ]
        : []),
    ],
    [termsForm],
  )

  const completedAcknowledgments =
    requiredAcknowledgments.filter(Boolean).length

  const totalAcknowledgments =
    requiredAcknowledgments.length

  const allRequiredAccepted =
    completedAcknowledgments === totalAcknowledgments

  function updateField<Field extends keyof TermsForm>(
    field: Field,
    value: TermsForm[Field],
  ) {
    setTermsForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function saveTermsDraft(
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
      terms: {
        ...termsForm,
        requiredAcknowledgmentsComplete:
          allRequiredAccepted,
        completedAcknowledgments,
        totalAcknowledgments,
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
    saveTermsDraft()
    navigate('/portal/contracts/schedule')
  }

  function handleNext() {
    saveTermsDraft()
    navigate('/portal/contracts/signatures')
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Contract Wizard
            </p>

            <h1 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              Terms
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-[#777777]">
              Review the contract disclosures,
              cancellation notice, lien notice, payment
              terms and project responsibilities.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E4DD] bg-white px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#999999]">
              Step 6 of 8
            </p>

            <p className="mt-1 text-sm font-medium text-[#555555]">
              Terms
            </p>
          </div>
        </div>

        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Contract"
            value={
              handoff?.contractNumber ||
              'Not assigned'
            }
          />

          <SummaryCard
            label="Customer"
            value={
              handoff?.customerName ||
              'Not specified'
            }
          />

          <SummaryCard
            label="Contract Total"
            value={formatCurrency(
              safeNumber(handoff?.projectTotal),
            )}
          />

          <SummaryCard
            label="Acknowledgments"
            value={`${completedAcknowledgments} of ${totalAcknowledgments}`}
          />
        </div>

        <div className="grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-7">
            <TermsSection
              eyebrow="Contract"
              title="General contract terms"
              description="The customer confirms that the contract, product schedule, pricing and project information have been reviewed."
            >
              <Acknowledgment
                title="Contract Terms"
                description="I acknowledge that I have reviewed the contract documents, project scope, products, pricing and payment obligations."
                checked={
                  termsForm.contractTermsAccepted
                }
                onChange={(checked) =>
                  updateField(
                    'contractTermsAccepted',
                    checked,
                  )
                }
              />
            </TermsSection>

            <TermsSection
              eyebrow="Cancellation"
              title="Notice of cancellation"
              description="Record delivery and acknowledgment of the applicable cancellation notice."
              emphasized
            >
              <NoticeBox>
                The customer must receive the applicable
                cancellation disclosure and instructions
                required for this transaction. The final
                legal notice should be inserted from the
                company-approved contract document.
              </NoticeBox>

              <div className="mt-6">
                <Acknowledgment
                  title="Cancellation Notice Received"
                  description="I acknowledge that I received a copy of the applicable cancellation notice and instructions explaining how to cancel."
                  checked={
                    termsForm.cancellationNoticeReceived
                  }
                  onChange={(checked) =>
                    updateField(
                      'cancellationNoticeReceived',
                      checked,
                    )
                  }
                />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <DateField
                  label="Cancellation deadline"
                  value={
                    termsForm.cancellationDeadline
                  }
                  onChange={(value) =>
                    updateField(
                      'cancellationDeadline',
                      value,
                    )
                  }
                />

                <TextField
                  label="Customer initials"
                  value={
                    termsForm.cancellationCustomerInitials
                  }
                  placeholder="Initials"
                  onChange={(value) =>
                    updateField(
                      'cancellationCustomerInitials',
                      value.toUpperCase(),
                    )
                  }
                />
              </div>

              <div className="mt-5">
                <TextAreaField
                  label="Cancellation delivery method"
                  value={
                    termsForm.cancellationDeliveryMethod
                  }
                  placeholder="Delivery instructions..."
                  onChange={(value) =>
                    updateField(
                      'cancellationDeliveryMethod',
                      value,
                    )
                  }
                />
              </div>
            </TermsSection>

            <TermsSection
              eyebrow="Construction Lien"
              title="Lien notice"
              description="Confirm delivery and acknowledgment of the company-approved construction lien disclosure."
              emphasized
            >
              <NoticeBox>
                The customer should receive the legally
                approved notice concerning potential
                construction lien rights, payments to
                contractors, subcontractors and material
                suppliers.
              </NoticeBox>

              <div className="mt-6">
                <Acknowledgment
                  title="Lien Notice Received"
                  description="I acknowledge that I received and reviewed the applicable construction lien notice."
                  checked={
                    termsForm.lienNoticeReceived
                  }
                  onChange={(checked) =>
                    updateField(
                      'lienNoticeReceived',
                      checked,
                    )
                  }
                />
              </div>

              <div className="mt-5 max-w-sm">
                <TextField
                  label="Customer initials"
                  value={
                    termsForm.lienCustomerInitials
                  }
                  placeholder="Initials"
                  onChange={(value) =>
                    updateField(
                      'lienCustomerInitials',
                      value.toUpperCase(),
                    )
                  }
                />
              </div>
            </TermsSection>

            <TermsSection
              eyebrow="Notice of Commencement"
              title="NOC acknowledgment"
              description="Track whether a Notice of Commencement is required and its current status."
            >
              <ToggleQuestion
                title="Notice of Commencement required"
                description="Enable this when an NOC is required for the project."
                checked={
                  termsForm.noticeOfCommencementRequired
                }
                onChange={(checked) =>
                  updateField(
                    'noticeOfCommencementRequired',
                    checked,
                  )
                }
              />

              {termsForm.noticeOfCommencementRequired && (
                <div className="mt-6 space-y-5">
                  <Acknowledgment
                    title="NOC Responsibility Acknowledged"
                    description="I acknowledge the Notice of Commencement requirements and agree to provide signatures, notarization or additional documents when required."
                    checked={
                      termsForm.noticeOfCommencementAcknowledged
                    }
                    onChange={(checked) =>
                      updateField(
                        'noticeOfCommencementAcknowledged',
                        checked,
                      )
                    }
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <SelectField
                      label="NOC status"
                      value={
                        termsForm.noticeOfCommencementStatus
                      }
                      onChange={(value) =>
                        updateField(
                          'noticeOfCommencementStatus',
                          value,
                        )
                      }
                      options={[
                        {
                          value: 'Not Started',
                          label: 'Not Started',
                        },
                        {
                          value: 'Awaiting Customer',
                          label: 'Awaiting Customer',
                        },
                        {
                          value: 'Awaiting Notarization',
                          label:
                            'Awaiting Notarization',
                        },
                        {
                          value: 'Completed',
                          label: 'Completed',
                        },
                        {
                          value: 'Recorded',
                          label: 'Recorded',
                        },
                      ]}
                    />

                    <TextField
                      label="Customer initials"
                      value={
                        termsForm.noticeOfCommencementCustomerInitials
                      }
                      placeholder="Initials"
                      onChange={(value) =>
                        updateField(
                          'noticeOfCommencementCustomerInitials',
                          value.toUpperCase(),
                        )
                      }
                    />
                  </div>
                </div>
              )}
            </TermsSection>

            <TermsSection
              eyebrow="Project Responsibilities"
              title="Permits and HOA"
              description="Confirm responsibilities for documentation, approvals and access."
            >
              <div className="space-y-4">
                <Acknowledgment
                  title="Permit Responsibility"
                  description="I agree to provide requested signatures, property documents and access needed to complete permit requirements."
                  checked={
                    termsForm.permitResponsibilityAcknowledged
                  }
                  onChange={(checked) =>
                    updateField(
                      'permitResponsibilityAcknowledged',
                      checked,
                    )
                  }
                />

                <Acknowledgment
                  title="HOA Responsibility"
                  description="I acknowledge that HOA approval may be required and agree to provide applications, supporting documents and approval before production or installation when applicable."
                  checked={
                    termsForm.hoaResponsibilityAcknowledged
                  }
                  onChange={(checked) =>
                    updateField(
                      'hoaResponsibilityAcknowledged',
                      checked,
                    )
                  }
                />
              </div>
            </TermsSection>

            <TermsSection
              eyebrow="Payments"
              title="Payment and financing terms"
              description="Confirm the payment schedule and applicable financing disclosures."
            >
              <div className="space-y-4">
                <Acknowledgment
                  title="Payment Terms"
                  description="I acknowledge the contract price, deposit, payment schedule and remaining balance stated in the contract."
                  checked={
                    termsForm.paymentTermsAcknowledged
                  }
                  onChange={(checked) =>
                    updateField(
                      'paymentTermsAcknowledged',
                      checked,
                    )
                  }
                />

                <Acknowledgment
                  title="Financing Terms"
                  description="When financing applies, I acknowledge that approval, lender conditions, loan documents and lender payments are separate from the contractor’s project obligations."
                  checked={
                    termsForm.financingTermsAcknowledged
                  }
                  onChange={(checked) =>
                    updateField(
                      'financingTermsAcknowledged',
                      checked,
                    )
                  }
                />
              </div>

              <div className="mt-5 max-w-sm">
                <TextField
                  label="Financing initials"
                  value={
                    termsForm.financingCustomerInitials
                  }
                  placeholder="Initials"
                  onChange={(value) =>
                    updateField(
                      'financingCustomerInitials',
                      value.toUpperCase(),
                    )
                  }
                />
              </div>
            </TermsSection>

            <TermsSection
              eyebrow="Project Conditions"
              title="Installation and change orders"
              description="Review conditions that may affect scope, timing or price."
            >
              <div className="space-y-4">
                <Acknowledgment
                  title="Change Orders"
                  description="Changes to the original scope, products, quantities or installation conditions may require a written change order and price adjustment."
                  checked={
                    termsForm.changeOrderTermsAcknowledged
                  }
                  onChange={(checked) =>
                    updateField(
                      'changeOrderTermsAcknowledged',
                      checked,
                    )
                  }
                />

                <Acknowledgment
                  title="Concealed Conditions"
                  description="Hidden damage, structural conditions, code issues or other concealed conditions may require additional work and charges."
                  checked={
                    termsForm.concealedConditionsAcknowledged
                  }
                  onChange={(checked) =>
                    updateField(
                      'concealedConditionsAcknowledged',
                      checked,
                    )
                  }
                />

                <Acknowledgment
                  title="Scheduling and Delays"
                  description="Installation dates are estimates and may change due to measurements, permits, HOA approvals, manufacturing, weather, inspections, materials or conditions outside the contractor’s control."
                  checked={
                    termsForm.schedulingTermsAcknowledged
                  }
                  onChange={(checked) =>
                    updateField(
                      'schedulingTermsAcknowledged',
                      checked,
                    )
                  }
                />

                <Acknowledgment
                  title="Warranty Terms"
                  description="I acknowledge that product and workmanship warranties are governed by the written warranty documents provided with the contract."
                  checked={
                    termsForm.warrantyTermsAcknowledged
                  }
                  onChange={(checked) =>
                    updateField(
                      'warrantyTermsAcknowledged',
                      checked,
                    )
                  }
                />

                <Acknowledgment
                  title="Property Access"
                  description="I agree to provide safe and reasonable access to the property for measurements, delivery, installation, inspections and service."
                  checked={
                    termsForm.propertyAccessAcknowledged
                  }
                  onChange={(checked) =>
                    updateField(
                      'propertyAccessAcknowledged',
                      checked,
                    )
                  }
                />
              </div>
            </TermsSection>

            <TermsSection
              eyebrow="Authorization"
              title="Photo authorization"
              description="These authorizations are optional and can be declined."
            >
              <div className="space-y-4">
                <ToggleQuestion
                  title="Project Documentation Photos"
                  description="Authorize photos of the property and completed work for project documentation, installation and warranty purposes."
                  checked={
                    termsForm.photoAuthorization
                  }
                  onChange={(checked) =>
                    updateField(
                      'photoAuthorization',
                      checked,
                    )
                  }
                />

                <ToggleQuestion
                  title="Marketing Authorization"
                  description="Authorize use of approved project photos for company marketing without displaying private customer information."
                  checked={
                    termsForm.marketingAuthorization
                  }
                  onChange={(checked) =>
                    updateField(
                      'marketingAuthorization',
                      checked,
                    )
                  }
                />
              </div>
            </TermsSection>

            <TermsSection
              eyebrow="Additional Terms"
              title="Contract additions"
              description="Record any approved terms specific to this project."
            >
              <TextAreaField
                label="Additional terms"
                value={termsForm.additionalTerms}
                placeholder="Add project-specific terms, exclusions or written agreements..."
                onChange={(value) =>
                  updateField(
                    'additionalTerms',
                    value,
                  )
                }
              />
            </TermsSection>
          </div>

          <aside className="h-fit rounded-[28px] border border-[#E8E4DD] bg-white p-6 shadow-sm sm:p-8 xl:sticky xl:top-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
              Terms Summary
            </p>

            <h2 className="mt-3 text-2xl font-light text-[#555555]">
              Required acknowledgments
            </h2>

            <div className="mt-8">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-4xl font-light text-[#444444]">
                    {completedAcknowledgments}
                  </p>

                  <p className="mt-1 text-sm text-[#888888]">
                    completed
                  </p>
                </div>

                <p className="text-sm font-medium text-[#777777]">
                  of {totalAcknowledgments}
                </p>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#EEEAE4]">
                <div
                  className="h-full rounded-full bg-[#B59A68] transition-all"
                  style={{
                    width: `${
                      totalAcknowledgments > 0
                        ? (completedAcknowledgments /
                            totalAcknowledgments) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div
              className={`mt-8 rounded-2xl p-6 ${
                allRequiredAccepted
                  ? 'bg-[#EAF3EE]'
                  : 'bg-[#F8F3E9]'
              }`}
            >
              <p
                className={`text-xs font-medium uppercase tracking-[0.16em] ${
                  allRequiredAccepted
                    ? 'text-[#4D755E]'
                    : 'text-[#9A8258]'
                }`}
              >
                Status
              </p>

              <p className="mt-3 text-xl font-medium text-[#555555]">
                {allRequiredAccepted
                  ? 'Ready for Signatures'
                  : 'Acknowledgments Pending'}
              </p>

              <p className="mt-3 text-sm leading-6 text-[#777777]">
                {allRequiredAccepted
                  ? 'All required contract acknowledgments have been selected.'
                  : 'Review the unchecked required acknowledgments before collecting signatures.'}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-[#E8E4DD] bg-[#FCFBF9] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#999999]">
                Legal Document Status
              </p>

              <p className="mt-2 text-sm font-medium text-[#555555]">
                Company-approved wording required
              </p>

              <p className="mt-2 text-xs leading-5 text-[#888888]">
                The final cancellation, lien and contract
                language should be inserted from the
                attorney-approved Cronus contract.
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

function TermsSection({
  eyebrow,
  title,
  description,
  emphasized = false,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  emphasized?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      className={`rounded-[28px] border bg-white p-6 shadow-sm sm:p-8 ${
        emphasized
          ? 'border-[#DCCBAA]'
          : 'border-[#E8E4DD]'
      }`}
    >
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

function Acknowledgment({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${
        checked
          ? 'border-[#B59A68] bg-[#F8F3E9]'
          : 'border-[#E8E4DD] bg-[#FCFBF9] hover:border-[#CFC8BA]'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="mt-1 h-5 w-5 accent-[#B59A68]"
      />

      <span>
        <span className="block text-sm font-medium text-[#555555]">
          {title}
        </span>

        <span className="mt-2 block text-sm leading-6 text-[#777777]">
          {description}
        </span>
      </span>
    </label>
  )
}

function ToggleQuestion({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-2xl border border-[#E8E4DD] bg-[#FCFBF9] p-5">
      <div>
        <p className="text-sm font-medium text-[#555555]">
          {title}
        </p>

        <p className="mt-2 text-sm leading-6 text-[#888888]">
          {description}
        </p>
      </div>

      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked
            ? 'bg-[#B59A68]'
            : 'bg-[#D8D4CB]'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

function NoticeBox({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[#DCCBAA] bg-[#FBF7EE] p-5">
      <p className="text-sm leading-7 text-[#6F624B]">
        {children}
      </p>
    </div>
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

function TextField({
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

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
      />
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
        rows={5}
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