import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'

const contractHandoffStorageKey =
  'cronus_contract_handoff_v1'

const contractDraftStorageKey =
  'cronus_contract_draft_v1'

type SignatureRole =
  | 'primaryOwner'
  | 'secondaryOwner'
  | 'salesRepresentative'
  | 'companyApproval'

type SignatureRecord = {
  fullName: string
  email: string
  initials: string
  signatureDataUrl: string
  signedDate: string
  signedTime: string
  signedAt: string
}

type SignaturesForm = {
  electronicSignatureConsent: boolean
  customerIdentityConfirmed: boolean
  contractReviewedBeforeSigning: boolean
  cancellationNoticeAcknowledged: boolean
  lienNoticeAcknowledged: boolean

  secondaryOwnerRequired: boolean
  companyApprovalRequired: boolean

  primaryOwner: SignatureRecord
  secondaryOwner: SignatureRecord
  salesRepresentative: SignatureRecord
  companyApproval: SignatureRecord

  signatureNotes: string
}

type ContractHandoff = {
  contractNumber?: string
  estimateNumber?: string
  customerName?: string
  customerEmail?: string
  projectTotal?: number
}

type ContractDraft = {
  contractNumber?: string
  estimateNumber?: string
  customerName?: string
  customerEmail?: string

  customer?: {
    firstName?: string
    lastName?: string
    fullName?: string
    email?: string
    spouseName?: string
    secondaryOwnerName?: string
  }

  customerForm?: {
    firstName?: string
    lastName?: string
    fullName?: string
    email?: string
    spouseName?: string
    secondaryOwnerName?: string
  }

  products?: {
    projectTotal?: number
  }

  payment?: {
    projectTotal?: number
  }

  terms?: {
    cancellationNoticeReceived?: boolean
    lienNoticeReceived?: boolean
  }

  signatures?: Partial<SignaturesForm>
}

const emptySignatureRecord: SignatureRecord = {
  fullName: '',
  email: '',
  initials: '',
  signatureDataUrl: '',
  signedDate: '',
  signedTime: '',
  signedAt: '',
}

const defaultSignaturesForm: SignaturesForm = {
  electronicSignatureConsent: false,
  customerIdentityConfirmed: false,
  contractReviewedBeforeSigning: false,
  cancellationNoticeAcknowledged: false,
  lienNoticeAcknowledged: false,

  secondaryOwnerRequired: false,
  companyApprovalRequired: false,

  primaryOwner: {
    ...emptySignatureRecord,
  },

  secondaryOwner: {
    ...emptySignatureRecord,
  },

  salesRepresentative: {
    ...emptySignatureRecord,
  },

  companyApproval: {
    ...emptySignatureRecord,
  },

  signatureNotes: '',
}

function safeNumber(value: unknown) {
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : 0
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function getTodayDate() {
  const now = new Date()

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
}

function getCurrentTime() {
  const now = new Date()

  return [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join(':')
}

function getCustomerName(
  handoff: ContractHandoff,
  draft: ContractDraft,
) {
  const customer =
    draft.customerForm ?? draft.customer ?? {}

  const combinedName = [
    customer.firstName,
    customer.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  return (
    customer.fullName ||
    combinedName ||
    draft.customerName ||
    handoff.customerName ||
    ''
  )
}

function getCustomerEmail(
  handoff: ContractHandoff,
  draft: ContractDraft,
) {
  const customer =
    draft.customerForm ?? draft.customer ?? {}

  return (
    customer.email ||
    draft.customerEmail ||
    handoff.customerEmail ||
    ''
  )
}

function getSecondaryOwnerName(
  draft: ContractDraft,
) {
  const customer =
    draft.customerForm ?? draft.customer ?? {}

  return (
    customer.secondaryOwnerName ||
    customer.spouseName ||
    ''
  )
}

function mergeSignatureRecord(
  savedRecord:
    | Partial<SignatureRecord>
    | undefined,
  defaults?: Partial<SignatureRecord>,
): SignatureRecord {
  return {
    ...emptySignatureRecord,
    ...defaults,
    ...(savedRecord ?? {}),
  }
}

function isSignatureComplete(
  record: SignatureRecord,
) {
  return Boolean(
    record.fullName.trim() &&
      record.initials.trim() &&
      record.signatureDataUrl,
  )
}

export default function ContractSignatures() {
  const navigate = useNavigate()

  const [handoff, setHandoff] =
    useState<ContractHandoff>({})

  const [draftContext, setDraftContext] =
    useState<ContractDraft>({})

  const [signaturesForm, setSignaturesForm] =
    useState<SignaturesForm>(
      defaultSignaturesForm,
    )

  const [isLoaded, setIsLoaded] =
    useState(false)

  const [saveStatus, setSaveStatus] = useState<
    'saving' | 'saved'
  >('saved')

  const [
    validationMessage,
    setValidationMessage,
  ] = useState('')

  useEffect(() => {
    const storedHandoff = localStorage.getItem(
      contractHandoffStorageKey,
    )

    const storedDraft = localStorage.getItem(
      contractDraftStorageKey,
    )

    let parsedHandoff: ContractHandoff = {}
    let parsedDraft: ContractDraft = {}

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
        parsedDraft = JSON.parse(
          storedDraft,
        ) as ContractDraft
      } catch {
        localStorage.removeItem(
          contractDraftStorageKey,
        )
      }
    }

    const customerName = getCustomerName(
      parsedHandoff,
      parsedDraft,
    )

    const customerEmail = getCustomerEmail(
      parsedHandoff,
      parsedDraft,
    )

    const secondaryOwnerName =
      getSecondaryOwnerName(parsedDraft)

    const savedSignatures =
      parsedDraft.signatures ?? {}

    setHandoff({
      ...parsedHandoff,

      contractNumber:
        parsedDraft.contractNumber ??
        parsedHandoff.contractNumber,

      estimateNumber:
        parsedDraft.estimateNumber ??
        parsedHandoff.estimateNumber,

      customerName:
        customerName ||
        parsedHandoff.customerName,

      customerEmail:
        customerEmail ||
        parsedHandoff.customerEmail,

      projectTotal:
        parsedDraft.products?.projectTotal ??
        parsedDraft.payment?.projectTotal ??
        parsedHandoff.projectTotal,
    })

    setDraftContext(parsedDraft)

    setSignaturesForm({
      ...defaultSignaturesForm,
      ...savedSignatures,

      cancellationNoticeAcknowledged:
        savedSignatures
          .cancellationNoticeAcknowledged ??
        parsedDraft.terms
          ?.cancellationNoticeReceived ??
        false,

      lienNoticeAcknowledged:
        savedSignatures
          .lienNoticeAcknowledged ??
        parsedDraft.terms
          ?.lienNoticeReceived ??
        false,

      secondaryOwnerRequired:
        savedSignatures
          .secondaryOwnerRequired ??
        Boolean(secondaryOwnerName),

      primaryOwner: mergeSignatureRecord(
        savedSignatures.primaryOwner,
        {
          fullName: customerName,
          email: customerEmail,
        },
      ),

      secondaryOwner: mergeSignatureRecord(
        savedSignatures.secondaryOwner,
        {
          fullName: secondaryOwnerName,
        },
      ),

      salesRepresentative:
        mergeSignatureRecord(
          savedSignatures.salesRepresentative,
        ),

      companyApproval:
        mergeSignatureRecord(
          savedSignatures.companyApproval,
        ),
    })

    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    setSaveStatus('saving')

    const timer = window.setTimeout(() => {
      saveSignaturesDraft(false)
      setSaveStatus('saved')
    }, 500)

    return () => {
      window.clearTimeout(timer)
    }
  }, [signaturesForm, isLoaded])

  const projectTotal = useMemo(() => {
    return safeNumber(
      draftContext.products?.projectTotal ??
        draftContext.payment?.projectTotal ??
        handoff.projectTotal,
    )
  }, [draftContext, handoff])

  const signatureRequirements = useMemo(
    () => [
      {
        id: 'primary-owner',
        label: 'Primary homeowner',
        required: true,
        complete: isSignatureComplete(
          signaturesForm.primaryOwner,
        ),
      },
      {
        id: 'secondary-owner',
        label: 'Secondary homeowner',
        required:
          signaturesForm.secondaryOwnerRequired,
        complete: isSignatureComplete(
          signaturesForm.secondaryOwner,
        ),
      },
      {
        id: 'sales-representative',
        label: 'Sales representative',
        required: true,
        complete: isSignatureComplete(
          signaturesForm.salesRepresentative,
        ),
      },
      {
        id: 'company-approval',
        label: 'Company approval',
        required:
          signaturesForm.companyApprovalRequired,
        complete: isSignatureComplete(
          signaturesForm.companyApproval,
        ),
      },
    ],
    [signaturesForm],
  )

  const requiredSignatures =
    signatureRequirements.filter(
      (item) => item.required,
    )

  const completedRequiredSignatures =
    requiredSignatures.filter(
      (item) => item.complete,
    ).length

  const acknowledgments = [
    signaturesForm.electronicSignatureConsent,
    signaturesForm.customerIdentityConfirmed,
    signaturesForm.contractReviewedBeforeSigning,
    signaturesForm.cancellationNoticeAcknowledged,
    signaturesForm.lienNoticeAcknowledged,
  ]

  const completedAcknowledgments =
    acknowledgments.filter(Boolean).length

  const allAcknowledgmentsComplete =
    completedAcknowledgments ===
    acknowledgments.length

  const allRequiredSignaturesComplete =
    completedRequiredSignatures ===
    requiredSignatures.length

  const readyToComplete =
    allAcknowledgmentsComplete &&
    allRequiredSignaturesComplete

  function updateRootField<
    Field extends keyof SignaturesForm,
  >(
    field: Field,
    value: SignaturesForm[Field],
  ) {
    setValidationMessage('')

    setSignaturesForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateSignatureField(
    role: SignatureRole,
    field: keyof SignatureRecord,
    value: string,
  ) {
    setValidationMessage('')

    setSignaturesForm((current) => ({
      ...current,

      [role]: {
        ...current[role],
        [field]: value,
      },
    }))
  }

  function updateSignature(
    role: SignatureRole,
    signatureDataUrl: string,
  ) {
    setValidationMessage('')

    setSignaturesForm((current) => {
      const existingRecord = current[role]

      if (!signatureDataUrl) {
        return {
          ...current,

          [role]: {
            ...existingRecord,
            signatureDataUrl: '',
            signedDate: '',
            signedTime: '',
            signedAt: '',
          },
        }
      }

      return {
        ...current,

        [role]: {
          ...existingRecord,
          signatureDataUrl,

          signedDate:
            existingRecord.signedDate ||
            getTodayDate(),

          signedTime:
            existingRecord.signedTime ||
            getCurrentTime(),

          signedAt: new Date().toISOString(),
        },
      }
    })
  }

  function saveSignaturesDraft(
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

    localStorage.setItem(
      contractDraftStorageKey,
      JSON.stringify({
        ...parsedDraft,

        contractNumber:
          handoff.contractNumber ?? '',

        estimateNumber:
          handoff.estimateNumber ?? '',

        customerName:
          handoff.customerName ?? '',

        customerEmail:
          handoff.customerEmail ?? '',

        signatures: {
          ...signaturesForm,

          requiredSignaturesComplete:
            allRequiredSignaturesComplete,

          acknowledgmentsComplete:
            allAcknowledgmentsComplete,

          readyToComplete,

          completedRequiredSignatures,

          totalRequiredSignatures:
            requiredSignatures.length,

          completedAcknowledgments,

          totalAcknowledgments:
            acknowledgments.length,
        },

        ...(updateTimestamp
          ? {
              updatedAt:
                new Date().toISOString(),
            }
          : {}),
      }),
    )
  }

  function handleBack() {
    saveSignaturesDraft()
    navigate('/portal/contracts/terms')
  }

  function handleNext() {
    if (!allAcknowledgmentsComplete) {
      setValidationMessage(
        'Complete all required acknowledgments before continuing.',
      )

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      return
    }

    if (!allRequiredSignaturesComplete) {
      setValidationMessage(
        'Complete the required names, initials and signatures before continuing.',
      )

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      return
    }

    saveSignaturesDraft()
    navigate('/portal/contracts/complete')
  }

  if (!isLoaded) {
    return (
      <section className="px-5 py-8 sm:px-7">
        <div className="mx-auto max-w-[1180px]">
          <div className="rounded-3xl border border-[#E8E4DD] bg-white p-10 text-center">
            <p className="text-sm text-[#777777]">
              Loading signature information...
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1180px]">
        <header className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#B59A68]">
              Contract Wizard
            </p>

            <h1 className="mt-3 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              Signatures
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#777777]">
              Collect the customer and company
              signatures required to complete the
              contract.
            </p>
          </div>

          <div className="w-fit rounded-2xl border border-[#E8E4DD] bg-white px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#999999]">
              Step 7 of 8
            </p>

            <p className="mt-1 text-sm font-medium text-[#555555]">
              Signatures
            </p>
          </div>
        </header>

        {validationMessage && (
          <div className="mb-6 rounded-2xl border border-[#E6C6C2] bg-[#FFF6F4] px-5 py-4">
            <p className="text-sm font-medium text-[#9B4E45]">
              {validationMessage}
            </p>
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Contract"
            value={
              handoff.contractNumber ||
              'Not assigned'
            }
          />

          <SummaryCard
            label="Customer"
            value={
              handoff.customerName ||
              'Not specified'
            }
          />

          <SummaryCard
            label="Contract Total"
            value={formatCurrency(projectTotal)}
          />

          <SummaryCard
            label="Signatures"
            value={`${completedRequiredSignatures} of ${requiredSignatures.length}`}
          />
        </div>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="min-w-0 space-y-6">
            <FormSection
              eyebrow="Electronic Signature"
              title="Consent and acknowledgments"
              description="Complete these confirmations before signing the contract."
            >
              <div className="space-y-4">
                <Acknowledgment
                  title="Electronic Signature Consent"
                  description="I consent to use electronic signatures for this contract."
                  checked={
                    signaturesForm
                      .electronicSignatureConsent
                  }
                  onChange={(checked) =>
                    updateRootField(
                      'electronicSignatureConsent',
                      checked,
                    )
                  }
                />

                <Acknowledgment
                  title="Customer Identity Confirmed"
                  description="The signer confirms that the customer information shown in the contract is correct."
                  checked={
                    signaturesForm
                      .customerIdentityConfirmed
                  }
                  onChange={(checked) =>
                    updateRootField(
                      'customerIdentityConfirmed',
                      checked,
                    )
                  }
                />

                <Acknowledgment
                  title="Contract Reviewed Before Signing"
                  description="The customer reviewed the products, pricing, payment terms and project information."
                  checked={
                    signaturesForm
                      .contractReviewedBeforeSigning
                  }
                  onChange={(checked) =>
                    updateRootField(
                      'contractReviewedBeforeSigning',
                      checked,
                    )
                  }
                />

                <Acknowledgment
                  title="Cancellation Notice Acknowledged"
                  description="The customer confirms receipt of the applicable cancellation notice."
                  checked={
                    signaturesForm
                      .cancellationNoticeAcknowledged
                  }
                  onChange={(checked) =>
                    updateRootField(
                      'cancellationNoticeAcknowledged',
                      checked,
                    )
                  }
                />

                <Acknowledgment
                  title="Construction Lien Notice Acknowledged"
                  description="The customer confirms receipt of the applicable construction lien notice."
                  checked={
                    signaturesForm
                      .lienNoticeAcknowledged
                  }
                  onChange={(checked) =>
                    updateRootField(
                      'lienNoticeAcknowledged',
                      checked,
                    )
                  }
                />
              </div>
            </FormSection>

            <SignerSection
              eyebrow="Homeowner"
              title="Primary homeowner"
              description="The primary homeowner’s name, initials and signature are required."
              record={
                signaturesForm.primaryOwner
              }
              showEmail
              required
              onFieldChange={(field, value) =>
                updateSignatureField(
                  'primaryOwner',
                  field,
                  value,
                )
              }
              onSignatureChange={(value) =>
                updateSignature(
                  'primaryOwner',
                  value,
                )
              }
            />

            <FormSection
              eyebrow="Additional Homeowner"
              title="Secondary homeowner"
              description="Enable this section when a second property owner must sign."
            >
              <ToggleQuestion
                title="Secondary homeowner required"
                description="The contract will require the second homeowner’s signature."
                checked={
                  signaturesForm
                    .secondaryOwnerRequired
                }
                onChange={(checked) =>
                  updateRootField(
                    'secondaryOwnerRequired',
                    checked,
                  )
                }
              />

              {signaturesForm.secondaryOwnerRequired && (
                <div className="mt-6">
                  <SignerFields
                    record={
                      signaturesForm.secondaryOwner
                    }
                    showEmail
                    onFieldChange={(
                      field,
                      value,
                    ) =>
                      updateSignatureField(
                        'secondaryOwner',
                        field,
                        value,
                      )
                    }
                    onSignatureChange={(value) =>
                      updateSignature(
                        'secondaryOwner',
                        value,
                      )
                    }
                  />
                </div>
              )}
            </FormSection>

            <SignerSection
              eyebrow="Company Representative"
              title="Sales representative"
              description="The sales representative confirms execution of the contract."
              record={
                signaturesForm.salesRepresentative
              }
              required
              onFieldChange={(field, value) =>
                updateSignatureField(
                  'salesRepresentative',
                  field,
                  value,
                )
              }
              onSignatureChange={(value) =>
                updateSignature(
                  'salesRepresentative',
                  value,
                )
              }
            />

            <FormSection
              eyebrow="Company Approval"
              title="Authorized company approval"
              description="Enable this section only when manager approval is required."
            >
              <ToggleQuestion
                title="Company approval required"
                description="The contract will require an authorized company signature."
                checked={
                  signaturesForm
                    .companyApprovalRequired
                }
                onChange={(checked) =>
                  updateRootField(
                    'companyApprovalRequired',
                    checked,
                  )
                }
              />

              {signaturesForm.companyApprovalRequired && (
                <div className="mt-6">
                  <SignerFields
                    record={
                      signaturesForm.companyApproval
                    }
                    onFieldChange={(
                      field,
                      value,
                    ) =>
                      updateSignatureField(
                        'companyApproval',
                        field,
                        value,
                      )
                    }
                    onSignatureChange={(value) =>
                      updateSignature(
                        'companyApproval',
                        value,
                      )
                    }
                  />
                </div>
              )}
            </FormSection>

            <FormSection
              eyebrow="Internal Notes"
              title="Signature notes"
              description="Record information related to the signing process."
            >
              <TextAreaField
                label="Signature notes"
                value={
                  signaturesForm.signatureNotes
                }
                placeholder="Add internal notes..."
                onChange={(value) =>
                  updateRootField(
                    'signatureNotes',
                    value,
                  )
                }
              />
            </FormSection>
          </main>

          <aside className="h-fit min-w-0 rounded-3xl border border-[#E8E4DD] bg-white p-6 shadow-sm xl:sticky xl:top-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#B59A68]">
              Signature Summary
            </p>

            <h2 className="mt-3 text-2xl font-light text-[#555555]">
              Contract execution
            </h2>

            <div className="mt-7 space-y-3">
              {signatureRequirements.map(
                (item) => (
                  <StatusRow
                    key={item.id}
                    label={item.label}
                    complete={item.complete}
                    required={item.required}
                  />
                ),
              )}
            </div>

            <div className="mt-7 border-t border-[#EEEAE4] pt-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-light text-[#444444]">
                    {completedAcknowledgments}
                  </p>

                  <p className="mt-1 text-sm text-[#888888]">
                    acknowledgments
                  </p>
                </div>

                <p className="text-sm font-medium text-[#777777]">
                  of {acknowledgments.length}
                </p>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EEEAE4]">
                <div
                  className="h-full rounded-full bg-[#B59A68] transition-all"
                  style={{
                    width: `${
                      acknowledgments.length
                        ? (completedAcknowledgments /
                            acknowledgments.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div
              className={`mt-7 rounded-2xl p-5 ${
                readyToComplete
                  ? 'bg-[#EAF3EE]'
                  : 'bg-[#F8F3E9]'
              }`}
            >
              <p
                className={`text-xs font-medium uppercase tracking-[0.14em] ${
                  readyToComplete
                    ? 'text-[#4D755E]'
                    : 'text-[#9A8258]'
                }`}
              >
                Contract Status
              </p>

              <p className="mt-3 text-lg font-medium text-[#555555]">
                {readyToComplete
                  ? 'Ready to Complete'
                  : 'Signatures Pending'}
              </p>

              <p className="mt-2 text-sm leading-6 text-[#777777]">
                {readyToComplete
                  ? 'All required acknowledgments and signatures are complete.'
                  : 'Complete the remaining required information.'}
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-[#E8E4DD] bg-[#FCFBF9] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#999999]">
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

        <div className="mt-7 flex flex-col-reverse justify-between gap-4 sm:flex-row">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-xl border border-[#D9D4CB] bg-white px-7 py-3.5 text-sm font-medium text-[#555555] transition hover:border-[#B59A68]"
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

function SignerSection({
  eyebrow,
  title,
  description,
  record,
  showEmail = false,
  required = false,
  onFieldChange,
  onSignatureChange,
}: {
  eyebrow: string
  title: string
  description: string
  record: SignatureRecord
  showEmail?: boolean
  required?: boolean
  onFieldChange: (
    field: keyof SignatureRecord,
    value: string,
  ) => void
  onSignatureChange: (value: string) => void
}) {
  return (
    <FormSection
      eyebrow={eyebrow}
      title={title}
      description={description}
    >
      {required && (
        <div className="mb-5 inline-flex rounded-full bg-[#F8F3E9] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.1em] text-[#8B7448]">
          Required
        </div>
      )}

      <SignerFields
        record={record}
        showEmail={showEmail}
        onFieldChange={onFieldChange}
        onSignatureChange={onSignatureChange}
      />
    </FormSection>
  )
}

function SignerFields({
  record,
  showEmail = false,
  onFieldChange,
  onSignatureChange,
}: {
  record: SignatureRecord
  showEmail?: boolean
  onFieldChange: (
    field: keyof SignatureRecord,
    value: string,
  ) => void
  onSignatureChange: (value: string) => void
}) {
  return (
    <div className="min-w-0">
      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        <TextField
          label="Printed name"
          value={record.fullName}
          placeholder="Full legal name"
          onChange={(value) =>
            onFieldChange('fullName', value)
          }
        />

        {showEmail && (
          <TextField
            label="Email"
            value={record.email}
            placeholder="Email address"
            inputMode="email"
            onChange={(value) =>
              onFieldChange('email', value)
            }
          />
        )}

        <TextField
          label="Initials"
          value={record.initials}
          placeholder="Initials"
          maxLength={6}
          onChange={(value) =>
            onFieldChange(
              'initials',
              value.toUpperCase(),
            )
          }
        />

        <DateField
          label="Signed date"
          value={record.signedDate}
          onChange={(value) =>
            onFieldChange('signedDate', value)
          }
        />

        <TimeField
          label="Signed time"
          value={record.signedTime}
          onChange={(value) =>
            onFieldChange('signedTime', value)
          }
        />
      </div>

      <div className="mt-6 min-w-0">
        <SignaturePad
          value={record.signatureDataUrl}
          onChange={onSignatureChange}
        />
      </div>
    </div>
  )
}

function SignaturePad({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null)

  const isDrawingRef = useRef(false)

  const previousPointRef = useRef<{
    x: number
    y: number
  } | null>(null)

  const hasInkRef = useRef(Boolean(value))

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    function prepareCanvas() {
      const currentCanvas = canvasRef.current

      if (!currentCanvas) {
        return
      }

      const rect =
        currentCanvas.getBoundingClientRect()

      if (!rect.width) {
        return
      }

      const ratio =
        window.devicePixelRatio || 1

      currentCanvas.width =
        Math.round(rect.width * ratio)

      currentCanvas.height =
        Math.round(180 * ratio)

      const context =
        currentCanvas.getContext('2d')

      if (!context) {
        return
      }

      context.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0,
      )

      configureSignatureContext(context)

      if (value) {
        const image = new Image()

        image.onload = () => {
          context.clearRect(
            0,
            0,
            rect.width,
            180,
          )

          configureSignatureContext(context)

          context.drawImage(
            image,
            0,
            0,
            rect.width,
            180,
          )
        }

        image.src = value
      }
    }

    requestAnimationFrame(prepareCanvas)

    window.addEventListener(
      'resize',
      prepareCanvas,
    )

    return () => {
      window.removeEventListener(
        'resize',
        prepareCanvas,
      )
    }
  }, [])

  function getPoint(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) {
    const canvas = canvasRef.current

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      }
    }

    const rect = canvas.getBoundingClientRect()

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  function startDrawing(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    event.preventDefault()

    canvas.setPointerCapture(event.pointerId)

    const point = getPoint(event)

    isDrawingRef.current = true
    previousPointRef.current = point
    hasInkRef.current = true

    context.beginPath()
    context.arc(
      point.x,
      point.y,
      1.4,
      0,
      Math.PI * 2,
    )
    context.fill()
  }

  function draw(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) {
    if (!isDrawingRef.current) {
      return
    }

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    event.preventDefault()

    const currentPoint = getPoint(event)
    const previousPoint =
      previousPointRef.current

    if (!previousPoint) {
      previousPointRef.current =
        currentPoint
      return
    }

    context.beginPath()

    context.moveTo(
      previousPoint.x,
      previousPoint.y,
    )

    context.lineTo(
      currentPoint.x,
      currentPoint.y,
    )

    context.stroke()

    previousPointRef.current =
      currentPoint
  }

  function stopDrawing(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) {
    if (!isDrawingRef.current) {
      return
    }

    const canvas = canvasRef.current

    isDrawingRef.current = false
    previousPointRef.current = null

    if (!canvas) {
      return
    }

    if (
      canvas.hasPointerCapture(
        event.pointerId,
      )
    ) {
      canvas.releasePointerCapture(
        event.pointerId,
      )
    }

    if (hasInkRef.current) {
      onChange(
        canvas.toDataURL('image/png'),
      )
    }
  }

  function clearSignature() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    const rect =
      canvas.getBoundingClientRect()

    context.clearRect(
      0,
      0,
      rect.width,
      180,
    )

    configureSignatureContext(context)

    isDrawingRef.current = false
    previousPointRef.current = null
    hasInkRef.current = false

    onChange('')
  }

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-[#666666]">
          Signature
        </label>

        {value && (
          <span className="rounded-full bg-[#EAF3EE] px-3 py-1 text-xs font-medium text-[#4D755E]">
            Captured
          </span>
        )}
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-[#D9D4CB] bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          className="block h-[180px] w-full touch-none cursor-crosshair bg-white"
        />

        <div className="flex flex-col gap-3 border-t border-[#EEEAE4] bg-[#FCFBF9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[#999999]">
            Sign inside the box using your
            mouse, trackpad or touchscreen.
          </p>

          <button
            type="button"
            onClick={clearSignature}
            className="w-fit text-xs font-medium uppercase tracking-[0.1em] text-[#8C754A] transition hover:text-[#555555]"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

function configureSignatureContext(
  context: CanvasRenderingContext2D,
) {
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.lineWidth = 2.5
  context.strokeStyle = '#2F2F2F'
  context.fillStyle = '#2F2F2F'
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
  children: ReactNode
}) {
  return (
    <section className="min-w-0 rounded-3xl border border-[#E8E4DD] bg-white p-5 shadow-sm sm:p-7">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#B59A68]">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-2xl font-light text-[#555555]">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#888888]">
        {description}
      </p>

      <div className="mt-6 min-w-0">
        {children}
      </div>
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
      className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition sm:p-5 ${
        checked
          ? 'border-[#B59A68] bg-[#F8F3E9]'
          : 'border-[#E8E4DD] bg-[#FCFBF9]'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="mt-1 h-5 w-5 shrink-0 accent-[#B59A68]"
      />

      <span className="min-w-0">
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
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-[#E8E4DD] bg-[#FCFBF9] p-5">
      <div className="min-w-0">
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

function StatusRow({
  label,
  complete,
  required,
}: {
  label: string
  complete: boolean
  required: boolean
}) {
  const status = complete
    ? 'Complete'
    : required
      ? 'Required'
      : 'Optional'

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#EEEAE4] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            complete
              ? 'bg-[#EAF3EE] text-[#4D755E]'
              : required
                ? 'bg-[#F8F3E9] text-[#9A8258]'
                : 'bg-[#F1F1F1] text-[#888888]'
          }`}
        >
          {complete ? '✓' : '—'}
        </span>

        <p className="min-w-0 truncate text-sm font-medium text-[#555555]">
          {label}
        </p>
      </div>

      <p
        className={`shrink-0 text-[10px] font-medium uppercase tracking-[0.08em] ${
          complete
            ? 'text-[#4D755E]'
            : required
              ? 'text-[#9A8258]'
              : 'text-[#999999]'
        }`}
      >
        {status}
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
    <div className="min-w-0 rounded-2xl border border-[#E8E4DD] bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.13em] text-[#999999]">
        {label}
      </p>

      <p className="mt-2 truncate text-base font-medium text-[#555555]">
        {value}
      </p>
    </div>
  )
}

function TextField({
  label,
  value,
  placeholder,
  inputMode = 'text',
  maxLength,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  inputMode?: 'text' | 'email' | 'tel'
  maxLength?: number
  onChange: (value: string) => void
}) {
  return (
    <div className="min-w-0">
      <label className="text-sm font-medium text-[#666666]">
        {label}
      </label>

      <input
        type="text"
        inputMode={inputMode}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-12 w-full min-w-0 rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
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
    <div className="min-w-0">
      <label className="text-sm font-medium text-[#666666]">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-12 w-full min-w-0 rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
      />
    </div>
  )
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="min-w-0">
      <label className="text-sm font-medium text-[#666666]">
        {label}
      </label>

      <input
        type="time"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-12 w-full min-w-0 rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
      />
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
    <div className="min-w-0">
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
        className="mt-2 w-full min-w-0 resize-none rounded-2xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 py-4 text-sm leading-6 text-[#555555] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
      />
    </div>
  )
}