import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'

const contractHandoffStorageKey =
  'cronus_contract_handoff_v1'

const contractDraftStorageKey =
  'cronus_contract_draft_v1'

const completedContractsStorageKey =
  'cronus_completed_contracts_v1'

const activeCompletedContractStorageKey =
  'cronus_active_completed_contract_v1'

type SignatureRecord = {
  fullName?: string
  email?: string
  initials?: string
  signatureDataUrl?: string
  signedDate?: string
  signedTime?: string
  signedAt?: string
}

type ContractDraft = {
  contractNumber?: string
  estimateNumber?: string
  customerName?: string
  customerEmail?: string
  projectTotal?: number

  customer?: Record<string, unknown>
  customerForm?: Record<string, unknown>

  project?: Record<string, unknown>
  projectForm?: Record<string, unknown>

  products?: Record<string, unknown>
  payment?: Record<string, unknown>
  schedule?: Record<string, unknown>
  terms?: Record<string, unknown>

  signatures?: {
    primaryOwner?: SignatureRecord
    secondaryOwner?: SignatureRecord
    salesRepresentative?: SignatureRecord
    companyApproval?: SignatureRecord

    secondaryOwnerRequired?: boolean
    companyApprovalRequired?: boolean

    acknowledgmentsComplete?: boolean
    requiredSignaturesComplete?: boolean
    readyToComplete?: boolean

    [key: string]: unknown
  }

  createdAt?: string
  updatedAt?: string

  [key: string]: unknown
}

type ContractHandoff = {
  contractNumber?: string
  estimateNumber?: string
  customerName?: string
  customerEmail?: string
  projectTotal?: number

  [key: string]: unknown
}

type CompletedContract = ContractDraft & {
  id: string
  contractNumber: string
  status: 'Executed'
  workflowStatus: 'Pending Production'
  completedAt: string
  executedAt: string
  source: 'contract-wizard'
  version: number
}

function safeString(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

function safeNumber(value: unknown) {
  const parsed = Number(value)

  return Number.isFinite(parsed)
    ? parsed
    : 0
}

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(safeNumber(value))
}

function formatDateTime(value: unknown) {
  const stringValue = safeString(value)

  if (!stringValue) {
    return 'Not available'
  }

  const date = new Date(stringValue)

  if (Number.isNaN(date.getTime())) {
    return stringValue
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function createContractNumber() {
  const now = new Date()

  const year = now.getFullYear()

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    now.getDate(),
  ).padStart(2, '0')

  const randomCode = Math.floor(
    1000 + Math.random() * 9000,
  )

  return `CON-${year}${month}${day}-${randomCode}`
}

function createContractId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `contract-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

function getObject(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>
  }

  return {}
}

function firstAvailableString(
  ...values: unknown[]
) {
  for (const value of values) {
    const result = safeString(value)

    if (result) {
      return result
    }
  }

  return ''
}

function getCustomerData(
  draft: ContractDraft,
) {
  return {
    ...getObject(draft.customer),
    ...getObject(draft.customerForm),
  }
}

function getProjectData(
  draft: ContractDraft,
) {
  return {
    ...getObject(draft.project),
    ...getObject(draft.projectForm),
  }
}

function getCustomerName(
  draft: ContractDraft,
  handoff: ContractHandoff,
) {
  const customer = getCustomerData(draft)

  const firstName = safeString(
    customer.firstName,
  )

  const lastName = safeString(
    customer.lastName,
  )

  const combinedName = [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(' ')

  return firstAvailableString(
    customer.fullName,
    combinedName,
    draft.customerName,
    handoff.customerName,
  )
}

function getCustomerEmail(
  draft: ContractDraft,
  handoff: ContractHandoff,
) {
  const customer = getCustomerData(draft)

  return firstAvailableString(
    customer.email,
    draft.customerEmail,
    handoff.customerEmail,
  )
}

function getCustomerPhone(
  draft: ContractDraft,
) {
  const customer = getCustomerData(draft)

  return firstAvailableString(
    customer.phone,
    customer.phoneNumber,
    customer.mobilePhone,
  )
}

function getProjectAddress(
  draft: ContractDraft,
) {
  const project = getProjectData(draft)
  const customer = getCustomerData(draft)

  const street = firstAvailableString(
    project.address,
    project.streetAddress,
    project.projectAddress,
    customer.address,
    customer.streetAddress,
  )

  const city = firstAvailableString(
    project.city,
    customer.city,
  )

  const state = firstAvailableString(
    project.state,
    customer.state,
  )

  const zipCode = firstAvailableString(
    project.zipCode,
    project.zipcode,
    customer.zipCode,
    customer.zipcode,
  )

  const cityStateZip = [
    city,
    state,
    zipCode,
  ]
    .filter(Boolean)
    .join(', ')
    .replace(', ,', ',')

  return [street, cityStateZip]
    .filter(Boolean)
    .join(', ')
}

function findProjectTotal(
  draft: ContractDraft,
  handoff: ContractHandoff,
) {
  const products = getObject(draft.products)
  const payment = getObject(draft.payment)

  const possibleValues = [
    products.projectTotal,
    products.contractTotal,
    products.total,
    payment.projectTotal,
    payment.contractTotal,
    payment.total,
    draft.projectTotal,
    handoff.projectTotal,
  ]

  for (const value of possibleValues) {
    const parsed = safeNumber(value)

    if (parsed > 0) {
      return parsed
    }
  }

  return 0
}

function getPaymentMethod(
  draft: ContractDraft,
) {
  const payment = getObject(draft.payment)

  return firstAvailableString(
    payment.paymentMethod,
    payment.method,
    payment.paymentType,
    payment.financingType,
  )
}

function getScheduleSummary(
  draft: ContractDraft,
) {
  const schedule = getObject(draft.schedule)

  return firstAvailableString(
    schedule.preferredInstallationDate,
    schedule.installationDate,
    schedule.estimatedInstallationDate,
    schedule.finalMeasurementDate,
  )
}

function getSignatureName(
  record: SignatureRecord | undefined,
) {
  return safeString(record?.fullName)
}

function getSignatureDate(
  record: SignatureRecord | undefined,
) {
  return firstAvailableString(
    record?.signedAt,
    record?.signedDate,
  )
}

export default function ContractComplete() {
  const navigate = useNavigate()

  const [handoff, setHandoff] =
    useState<ContractHandoff>({})

  const [draft, setDraft] =
    useState<ContractDraft>({})

  const [
    completedContract,
    setCompletedContract,
  ] = useState<CompletedContract | null>(
    null,
  )

  const [isLoaded, setIsLoaded] =
    useState(false)

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

    const storedCompletedContract =
      localStorage.getItem(
        activeCompletedContractStorageKey,
      )

    let parsedHandoff: ContractHandoff = {}
    let parsedDraft: ContractDraft = {}

    if (storedHandoff) {
      try {
        parsedHandoff = JSON.parse(
          storedHandoff,
        ) as ContractHandoff
      } catch {
        parsedHandoff = {}
      }
    }

    if (storedDraft) {
      try {
        parsedDraft = JSON.parse(
          storedDraft,
        ) as ContractDraft
      } catch {
        parsedDraft = {}
      }
    }

    if (storedCompletedContract) {
      try {
        const parsedCompletedContract =
          JSON.parse(
            storedCompletedContract,
          ) as CompletedContract

        const draftContractNumber =
          firstAvailableString(
            parsedDraft.contractNumber,
            parsedHandoff.contractNumber,
          )

        if (
          parsedCompletedContract &&
          (!draftContractNumber ||
            parsedCompletedContract.contractNumber ===
            draftContractNumber)
        ) {
          setCompletedContract(
            parsedCompletedContract,
          )
        }
      } catch {
        localStorage.removeItem(
          activeCompletedContractStorageKey,
        )
      }
    }

    setHandoff(parsedHandoff)
    setDraft(parsedDraft)
    setIsLoaded(true)
  }, [])

  const contractNumber = useMemo(() => {
    return firstAvailableString(
      completedContract?.contractNumber,
      draft.contractNumber,
      handoff.contractNumber,
    )
  }, [
    completedContract,
    draft.contractNumber,
    handoff.contractNumber,
  ])

  const estimateNumber = useMemo(() => {
    return firstAvailableString(
      completedContract?.estimateNumber,
      draft.estimateNumber,
      handoff.estimateNumber,
    )
  }, [
    completedContract,
    draft.estimateNumber,
    handoff.estimateNumber,
  ])

  const customerName = useMemo(() => {
    const source =
      completedContract ?? draft

    return getCustomerName(
      source,
      handoff,
    )
  }, [
    completedContract,
    draft,
    handoff,
  ])

  const customerEmail = useMemo(() => {
    const source =
      completedContract ?? draft

    return getCustomerEmail(
      source,
      handoff,
    )
  }, [
    completedContract,
    draft,
    handoff,
  ])

  const customerPhone = useMemo(() => {
    return getCustomerPhone(
      completedContract ?? draft,
    )
  }, [completedContract, draft])

  const projectAddress = useMemo(() => {
    return getProjectAddress(
      completedContract ?? draft,
    )
  }, [completedContract, draft])

  const projectTotal = useMemo(() => {
    return findProjectTotal(
      completedContract ?? draft,
      handoff,
    )
  }, [
    completedContract,
    draft,
    handoff,
  ])

  const paymentMethod = useMemo(() => {
    return getPaymentMethod(
      completedContract ?? draft,
    )
  }, [completedContract, draft])

  const scheduleSummary = useMemo(() => {
    return getScheduleSummary(
      completedContract ?? draft,
    )
  }, [completedContract, draft])

  const signatures =
    completedContract?.signatures ??
    draft.signatures ??
    {}

  const primaryOwner =
    signatures.primaryOwner

  const secondaryOwner =
    signatures.secondaryOwner

  const salesRepresentative =
    signatures.salesRepresentative

  const companyApproval =
    signatures.companyApproval

  const isExecuted =
    completedContract !== null

  const signaturesReady =
    signatures.readyToComplete === true ||
    (signatures.acknowledgmentsComplete ===
      true &&
      signatures.requiredSignaturesComplete ===
      true)

  function finalizeContract() {
    setValidationMessage('')

    if (!signaturesReady) {
      setValidationMessage(
        'The required acknowledgments and signatures must be completed before finalizing the contract.',
      )

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      return
    }

    const now = new Date().toISOString()

    const finalContractNumber =
      contractNumber ||
      createContractNumber()

    const completed: CompletedContract = {
      ...draft,

      contractNumber:
        finalContractNumber,

      estimateNumber,

      customerName,
      customerEmail,

      projectTotal,

      id: createContractId(),

      status: 'Executed',

      workflowStatus:
        'Pending Production',

      completedAt: now,
      executedAt: now,

      updatedAt: now,

      source: 'contract-wizard',

      version: 1,
    }

    let storedContracts: CompletedContract[] =
      []

    const storedContractsValue =
      localStorage.getItem(
        completedContractsStorageKey,
      )

    if (storedContractsValue) {
      try {
        const parsed = JSON.parse(
          storedContractsValue,
        )

        if (Array.isArray(parsed)) {
          storedContracts =
            parsed as CompletedContract[]
        }
      } catch {
        storedContracts = []
      }
    }

    const existingContractIndex =
      storedContracts.findIndex(
        (contract) =>
          contract.contractNumber ===
          finalContractNumber,
      )

    if (existingContractIndex >= 0) {
      storedContracts[
        existingContractIndex
      ] = completed
    } else {
      storedContracts.unshift(completed)
    }

    localStorage.setItem(
      completedContractsStorageKey,
      JSON.stringify(storedContracts),
    )

    localStorage.setItem(
      activeCompletedContractStorageKey,
      JSON.stringify(completed),
    )

    localStorage.setItem(
      contractDraftStorageKey,
      JSON.stringify({
        ...completed,
        wizardCompleted: true,
      }),
    )

    setCompletedContract(completed)
    setDraft(completed)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function handlePrint() {
    navigate('/portal/contracts/document')
  }

  function handleEmail() {
    const subject = encodeURIComponent(
      `Executed Contract ${contractNumber || ''
      }`,
    )

    const body = encodeURIComponent(
      [
        `Hello ${customerName || 'Customer'},`,
        '',
        `Your Cronus contract ${contractNumber || ''
        } has been completed.`,
        '',
        `Contract total: ${formatCurrency(
          projectTotal,
        )}`,
        projectAddress
          ? `Project address: ${projectAddress}`
          : '',
        '',
        'A copy of the executed contract will be provided for your records.',
        '',
        'Thank you,',
        'Cronus Windows & Doors',
      ]
        .filter(
          (line) => line !== undefined,
        )
        .join('\n'),
    )

    window.location.href = `mailto:${customerEmail}?subject=${subject}&body=${body}`
  }

  function handleDownloadRecord() {
    const record =
      completedContract ?? {
        ...draft,
        contractNumber,
        estimateNumber,
        customerName,
        customerEmail,
        projectTotal,
      }

    const blob = new Blob(
      [
        JSON.stringify(
          record,
          null,
          2,
        ),
      ],
      {
        type: 'application/json',
      },
    )

    const url =
      URL.createObjectURL(blob)

    const anchor =
      document.createElement('a')

    anchor.href = url

    anchor.download = `${contractNumber ||
      'cronus-contract'
      }.json`

    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()

    URL.revokeObjectURL(url)
  }

  function handleBack() {
    navigate('/portal/contracts/signatures')
  }

  function handleContracts() {
    navigate('/portal/contracts')
  }

  if (!isLoaded) {
    return (
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="rounded-3xl border border-[#E8E4DD] bg-white p-10 text-center">
            <p className="text-sm text-[#777777]">
              Loading contract summary...
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-x-hidden px-4 py-8 print:px-0 print:py-0 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1180px]">
        <header className="mb-8 flex flex-col justify-between gap-5 print:mb-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#B59A68]">
              Contract Wizard
            </p>

            <h1 className="mt-3 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              {isExecuted
                ? 'Contract Complete'
                : 'Review and Complete'}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#777777]">
              {isExecuted
                ? 'The contract has been executed and saved as a permanent record.'
                : 'Review the contract information and finalize it when everything is correct.'}
            </p>
          </div>

          <div className="w-fit rounded-2xl border border-[#E8E4DD] bg-white px-5 py-4 print:hidden">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#999999]">
              Step 8 of 8
            </p>

            <p className="mt-1 text-sm font-medium text-[#555555]">
              Complete
            </p>
          </div>
        </header>

        {validationMessage && (
          <div className="mb-6 rounded-2xl border border-[#E6C6C2] bg-[#FFF6F4] px-5 py-4 print:hidden">
            <p className="text-sm font-medium text-[#9B4E45]">
              {validationMessage}
            </p>
          </div>
        )}

        <div
          className={`mb-7 rounded-[28px] border p-6 sm:p-8 ${isExecuted
              ? 'border-[#C9DDD1] bg-[#EDF6F1]'
              : 'border-[#E6D8BA] bg-[#FBF7ED]'
            }`}
        >
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl font-medium ${isExecuted
                    ? 'bg-[#D7EADF] text-[#47705A]'
                    : 'bg-[#F0E3C7] text-[#91784A]'
                  }`}
              >
                {isExecuted ? '✓' : '8'}
              </div>

              <div>
                <p
                  className={`text-xs font-medium uppercase tracking-[0.16em] ${isExecuted
                      ? 'text-[#527662]'
                      : 'text-[#91784A]'
                    }`}
                >
                  Contract Status
                </p>

                <h2 className="mt-2 text-2xl font-medium text-[#4F4F4F]">
                  {isExecuted
                    ? 'Executed'
                    : 'Ready for final review'}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#707070]">
                  {isExecuted
                    ? `Completed ${formatDateTime(
                      completedContract?.completedAt,
                    )}.`
                    : 'Finalizing creates the permanent contract record and changes its status to Executed.'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/70 px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#999999]">
                Contract Number
              </p>

              <p className="mt-2 text-lg font-medium text-[#555555]">
                {contractNumber ||
                  'Assigned at completion'}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Customer"
            value={
              customerName ||
              'Not specified'
            }
          />

          <SummaryCard
            label="Estimate"
            value={
              estimateNumber ||
              'Not specified'
            }
          />

          <SummaryCard
            label="Contract Total"
            value={formatCurrency(
              projectTotal,
            )}
          />

          <SummaryCard
            label="Workflow"
            value={
              isExecuted
                ? 'Pending Production'
                : 'Final Review'
            }
          />
        </div>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="min-w-0 space-y-6">
            <SectionCard
              eyebrow="Customer"
              title="Customer information"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <DetailItem
                  label="Customer name"
                  value={customerName}
                />

                <DetailItem
                  label="Email"
                  value={customerEmail}
                />

                <DetailItem
                  label="Phone"
                  value={customerPhone}
                />

                <DetailItem
                  label="Project address"
                  value={projectAddress}
                />
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Project"
              title="Contract summary"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <DetailItem
                  label="Contract number"
                  value={
                    contractNumber ||
                    'Assigned when finalized'
                  }
                />

                <DetailItem
                  label="Estimate number"
                  value={estimateNumber}
                />

                <DetailItem
                  label="Payment method"
                  value={paymentMethod}
                />

                <DetailItem
                  label="Preferred schedule"
                  value={scheduleSummary}
                />

                <DetailItem
                  label="Contract total"
                  value={formatCurrency(
                    projectTotal,
                  )}
                  prominent
                />

                <DetailItem
                  label="Production status"
                  value={
                    isExecuted
                      ? 'Pending Production'
                      : 'Not created'
                  }
                />
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Execution"
              title="Signatures"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <SignatureSummary
                  title="Primary homeowner"
                  name={getSignatureName(
                    primaryOwner,
                  )}
                  signedDate={getSignatureDate(
                    primaryOwner,
                  )}
                  signatureDataUrl={
                    primaryOwner?.signatureDataUrl
                  }
                  required
                />

                <SignatureSummary
                  title="Secondary homeowner"
                  name={getSignatureName(
                    secondaryOwner,
                  )}
                  signedDate={getSignatureDate(
                    secondaryOwner,
                  )}
                  signatureDataUrl={
                    secondaryOwner?.signatureDataUrl
                  }
                  required={
                    signatures.secondaryOwnerRequired ===
                    true
                  }
                />

                <SignatureSummary
                  title="Sales representative"
                  name={getSignatureName(
                    salesRepresentative,
                  )}
                  signedDate={getSignatureDate(
                    salesRepresentative,
                  )}
                  signatureDataUrl={
                    salesRepresentative?.signatureDataUrl
                  }
                  required
                />

                <SignatureSummary
                  title="Company approval"
                  name={getSignatureName(
                    companyApproval,
                  )}
                  signedDate={getSignatureDate(
                    companyApproval,
                  )}
                  signatureDataUrl={
                    companyApproval?.signatureDataUrl
                  }
                  required={
                    signatures.companyApprovalRequired ===
                    true
                  }
                />
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Documents"
              title="Contract documents"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <DocumentStatus
                  title="Terms and acknowledgments"
                  complete={
                    signatures.acknowledgmentsComplete ===
                    true
                  }
                />

                <DocumentStatus
                  title="Required signatures"
                  complete={
                    signatures.requiredSignaturesComplete ===
                    true
                  }
                />

                <DocumentStatus
                  title="Contract record"
                  complete={isExecuted}
                />

                <DocumentStatus
                  title="Production job"
                  complete={false}
                  pendingLabel="Pending conversion"
                />
              </div>
            </SectionCard>
          </main>

          <aside className="h-fit min-w-0 rounded-3xl border border-[#E8E4DD] bg-white p-6 shadow-sm print:hidden xl:sticky xl:top-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#B59A68]">
              Contract Actions
            </p>

            <h2 className="mt-3 text-2xl font-light text-[#555555]">
              {isExecuted
                ? 'Executed contract'
                : 'Complete contract'}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#888888]">
              {isExecuted
                ? 'Print, email or download the completed contract record.'
                : 'Once finalized, this contract becomes a permanent executed record.'}
            </p>

            {!isExecuted && (
              <button
                type="button"
                onClick={finalizeContract}
                className="mt-7 w-full rounded-xl bg-[#222222] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#B59A68]"
              >
                Finalize Contract
              </button>
            )}

            {isExecuted && (
              <div className="mt-7 space-y-3">
                <ActionButton
                  label="Print / Save as PDF"
                  onClick={handlePrint}
                />

                <ActionButton
                  label="Email Customer"
                  onClick={handleEmail}
                  disabled={!customerEmail}
                />

                <ActionButton
                  label="Download Contract Record"
                  onClick={handleDownloadRecord}
                />

                <ActionButton
                  label="View All Contracts"
                  onClick={handleContracts}
                />
              </div>
            )}

            <div className="mt-7 border-t border-[#EEEAE4] pt-6">
              <StatusLine
                label="Customer information"
                complete={Boolean(
                  customerName,
                )}
              />

              <StatusLine
                label="Project total"
                complete={projectTotal > 0}
              />

              <StatusLine
                label="Acknowledgments"
                complete={
                  signatures.acknowledgmentsComplete ===
                  true
                }
              />

              <StatusLine
                label="Required signatures"
                complete={
                  signatures.requiredSignaturesComplete ===
                  true
                }
              />
            </div>

            <div
              className={`mt-7 rounded-2xl p-5 ${isExecuted
                  ? 'bg-[#EAF3EE]'
                  : signaturesReady
                    ? 'bg-[#F8F3E9]'
                    : 'bg-[#FFF2EF]'
                }`}
            >
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8A7550]">
                Final Status
              </p>

              <p className="mt-3 text-lg font-medium text-[#555555]">
                {isExecuted
                  ? 'Contract Executed'
                  : signaturesReady
                    ? 'Ready to Finalize'
                    : 'Action Required'}
              </p>

              <p className="mt-2 text-sm leading-6 text-[#777777]">
                {isExecuted
                  ? 'The permanent contract record has been created.'
                  : signaturesReady
                    ? 'All required execution items are complete.'
                    : 'Return to Signatures and complete the required fields.'}
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-7 flex flex-col-reverse justify-between gap-4 print:hidden sm:flex-row">
          {!isExecuted ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-[#D9D4CB] bg-white px-7 py-3.5 text-sm font-medium text-[#555555] transition hover:border-[#B59A68]"
            >
              Back to Signatures
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContracts}
              className="rounded-xl border border-[#D9D4CB] bg-white px-7 py-3.5 text-sm font-medium text-[#555555] transition hover:border-[#B59A68]"
            >
              View Contracts
            </button>
          )}

          {!isExecuted && (
            <button
              type="button"
              onClick={finalizeContract}
              className="rounded-xl bg-[#222222] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#B59A68]"
            >
              Finalize Contract
            </button>
          )}

          {isExecuted && (
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-xl bg-[#222222] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#B59A68]"
            >
              Print Contract
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

function SectionCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="min-w-0 rounded-3xl border border-[#E8E4DD] bg-white p-5 shadow-sm print:break-inside-avoid sm:p-7">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#B59A68]">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-2xl font-light text-[#555555]">
        {title}
      </h2>

      <div className="mt-6">
        {children}
      </div>
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

function DetailItem({
  label,
  value,
  prominent = false,
}: {
  label: string
  value: string
  prominent?: boolean
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#EEEAE4] bg-[#FCFBF9] p-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#999999]">
        {label}
      </p>

      <p
        className={`mt-2 break-words font-medium text-[#555555] ${prominent
            ? 'text-xl'
            : 'text-sm'
          }`}
      >
        {value || 'Not specified'}
      </p>
    </div>
  )
}

function SignatureSummary({
  title,
  name,
  signedDate,
  signatureDataUrl,
  required,
}: {
  title: string
  name: string
  signedDate: string
  signatureDataUrl?: string
  required: boolean
}) {
  const complete = Boolean(
    name && signatureDataUrl,
  )

  return (
    <div className="min-w-0 rounded-2xl border border-[#E8E4DD] bg-[#FCFBF9] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#555555]">
            {title}
          </p>

          <p className="mt-1 text-xs text-[#999999]">
            {required
              ? 'Required'
              : 'Optional'}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${complete
              ? 'bg-[#EAF3EE] text-[#4D755E]'
              : required
                ? 'bg-[#F8F3E9] text-[#927A4B]'
                : 'bg-[#EFEFEF] text-[#888888]'
            }`}
        >
          {complete
            ? 'Signed'
            : required
              ? 'Pending'
              : 'Optional'}
        </span>
      </div>

      {signatureDataUrl ? (
        <div className="mt-4 flex h-24 items-center justify-center overflow-hidden rounded-xl border border-[#E5E0D8] bg-white p-2">
          <img
            src={signatureDataUrl}
            alt={`${title} signature`}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ) : (
        <div className="mt-4 flex h-24 items-center justify-center rounded-xl border border-dashed border-[#D8D2C8] bg-white">
          <p className="text-xs text-[#AAAAAA]">
            No signature
          </p>
        </div>
      )}

      <p className="mt-4 truncate text-sm font-medium text-[#555555]">
        {name || 'No signer'}
      </p>

      <p className="mt-1 text-xs text-[#999999]">
        {signedDate
          ? formatDateTime(signedDate)
          : 'Not signed'}
      </p>
    </div>
  )
}

function DocumentStatus({
  title,
  complete,
  pendingLabel = 'Pending',
}: {
  title: string
  complete: boolean
  pendingLabel?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#EEEAE4] bg-[#FCFBF9] p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${complete
              ? 'bg-[#EAF3EE] text-[#4D755E]'
              : 'bg-[#F8F3E9] text-[#927A4B]'
            }`}
        >
          {complete ? '✓' : '—'}
        </span>

        <p className="text-sm font-medium text-[#555555]">
          {title}
        </p>
      </div>

      <p
        className={`shrink-0 text-xs font-medium ${complete
            ? 'text-[#4D755E]'
            : 'text-[#927A4B]'
          }`}
      >
        {complete
          ? 'Complete'
          : pendingLabel}
      </p>
    </div>
  )
}

function StatusLine({
  label,
  complete,
}: {
  label: string
  complete: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <p className="text-sm text-[#777777]">
        {label}
      </p>

      <span
        className={`text-sm font-medium ${complete
            ? 'text-[#4D755E]'
            : 'text-[#A07E4A]'
          }`}
      >
        {complete ? 'Complete' : 'Pending'}
      </span>
    </div>
  )
}

function ActionButton({
  label,
  onClick,
  disabled = false,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl border border-[#D9D4CB] bg-white px-5 py-3 text-left text-sm font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#8C754A] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  )
}