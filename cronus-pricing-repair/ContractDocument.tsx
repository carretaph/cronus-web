import { useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateCoreProductPrice,calculateSquareFeet,} from '../../services/pricingService'

const contractDraftStorageKey = 'cronus_contract_draft_v1'
const activeCompletedContractStorageKey =
  'cronus_active_completed_contract_v1'
const contractHandoffStorageKey = 'cronus_contract_handoff_v1'

const company = {
  displayName: 'Cronus Windows & Doors',
  legalName: 'Cronus Windows & Doors LLC',
  licenseNumber: 'LICENSE NUMBER',
  addressLine1: 'COMPANY ADDRESS',
  addressLine2: 'CITY, FL ZIP CODE',
  phone: 'COMPANY PHONE',
  email: 'COMPANY EMAIL',
  website: 'www.cronuswindows.com',
}

const assetModules = import.meta.glob(
  '../../assets/**/*.{png,jpg,jpeg,svg,webp}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, string>

function findCronusLogo() {
  const entries = Object.entries(assetModules)

  const preferred = entries.find(([path]) => {
    const normalized = path.toLowerCase()
    return normalized.includes('cronus') && normalized.includes('logo')
  })

  const fallback = entries.find(([path]) =>
    path.toLowerCase().includes('logo'),
  )

  return preferred?.[1] ?? fallback?.[1] ?? ''
}

const cronusLogoUrl = findCronusLogo()

type UnknownRecord = Record<string, unknown>

type Product = {
  id?: string
  label?: string
  productCategory?: string
  width?: string
  height?: string
  color?: string
  exteriorColor?: string
  interiorColor?: string
  glass?: string
  glassPackage?: string
  grid?: string
  grids?: string
  screen?: string
  screens?: string
  hardware?: string
  tempered?: boolean | string
  quantity?: number
  notes?: string
  [key: string]: unknown
}

type Opening = {
  id?: string
  openingNumber?: string
  location?: string
  impact?: boolean
  mullionCharge?: number
  notes?: string
  products?: Product[]
  [key: string]: unknown
}

type SignatureRecord = {
  fullName?: string
  email?: string
  initials?: string
  signatureDataUrl?: string
  signedDate?: string
  signedTime?: string
  signedAt?: string
}

type DiscountLine = {
  id: string
  label: string
  amount: number
  percentage?: number
  mode?: 'percent' | 'fixed'
  value?: number
  order?: number | null
}

type ContractRecord = {
  contractNumber?: string
  estimateNumber?: string
  customerName?: string
  customerEmail?: string
  projectTotal?: number
  customer?: UnknownRecord
  customerForm?: UnknownRecord
  project?: UnknownRecord
  projectForm?: UnknownRecord
  products?: {
    openings?: Opening[]
    retailPrice?: number
    discountTotal?: number
    projectTotal?: number
    windowCount?: number
    doorCount?: number
    totalProducts?: number
    discounts?: unknown
    [key: string]: unknown
  }
  discounts?: unknown
  payment?: UnknownRecord
  schedule?: UnknownRecord
  terms?: UnknownRecord
  signatures?: {
    primaryOwner?: SignatureRecord
    secondaryOwner?: SignatureRecord
    salesRepresentative?: SignatureRecord
    companyApproval?: SignatureRecord
    secondaryOwnerRequired?: boolean
    companyApprovalRequired?: boolean
    [key: string]: unknown
  }
  createdAt?: string
  updatedAt?: string
  completedAt?: string
  executedAt?: string
  [key: string]: unknown
}

type ProductLine = {
  rowId: string
  openingNumber: string
  location: string
  openingImpact: boolean
  openingNotes: string
  mullionCharge: number
  product: Product
  quantity: number
  width: number
  height: number
  squareFeet: number
  basePrice: number
  totalPrice: number
}

const doorCategories = new Set([
  'Sliding Door',
  'French Door',
  'Entry Door',
  'Patio Door',
])

function safeObject(value: unknown): UnknownRecord {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as UnknownRecord
  }

  return {}
}

function safeString(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim()
  }

  return ''
}

function safeNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const parsed = safeString(value)
    if (parsed) return parsed
  }

  return ''
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = safeNumber(value)
    if (parsed !== 0) return parsed
  }

  return 0
}

function parseMeasurement(value: unknown) {
  const normalized = safeString(value).replace(/[^0-9.]/g, '')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(safeNumber(value))
}

function formatDate(value: unknown) {
  const stringValue = safeString(value)
  if (!stringValue) return 'Not specified'

  const date = new Date(stringValue)
  if (Number.isNaN(date.getTime())) return stringValue

  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatDateTime(value: unknown) {
  const stringValue = safeString(value)
  if (!stringValue) return 'Not specified'

  const date = new Date(stringValue)
  if (Number.isNaN(date.getTime())) return stringValue

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

/*
 * Florida Statutes define “business day” for home-solicitation sales as
 * every calendar day except Sunday and federal holidays. This helper skips
 * Sundays. Federal-holiday handling can be added when Cronus has its final
 * legal calendar rules.
 */
function addCancellationBusinessDays(sourceDate: Date, businessDays: number) {
  const result = new Date(sourceDate)
  let added = 0

  while (added < businessDays) {
    result.setDate(result.getDate() + 1)
    if (result.getDay() !== 0) added += 1
  }

  return result
}

function readContractRecord() {
  for (const key of [
    activeCompletedContractStorageKey,
    contractDraftStorageKey,
  ]) {
    const value = localStorage.getItem(key)
    if (!value) continue

    try {
      return JSON.parse(value) as ContractRecord
    } catch {
      continue
    }
  }

  return {} as ContractRecord
}

function readHandoffRecord() {
  const value = localStorage.getItem(contractHandoffStorageKey)
  if (!value) return {} as ContractRecord

  try {
    return JSON.parse(value) as ContractRecord
  } catch {
    return {} as ContractRecord
  }
}

function getCustomerData(contract: ContractRecord) {
  return {
    ...safeObject(contract.customer),
    ...safeObject(contract.customerForm),
  }
}

function getProjectData(contract: ContractRecord) {
  return {
    ...safeObject(contract.project),
    ...safeObject(contract.projectForm),
  }
}

function getCustomerFullName(
  contract: ContractRecord,
  handoff: ContractRecord,
) {
  const customer = getCustomerData(contract)
  const combinedName = [customer.firstName, customer.lastName]
    .map(safeString)
    .filter(Boolean)
    .join(' ')

  return firstString(
    customer.fullName,
    customer.customerName,
    combinedName,
    contract.customerName,
    handoff.customerName,
  )
}

function getSecondaryOwnerName(contract: ContractRecord) {
  const customer = getCustomerData(contract)

  return firstString(
    customer.secondaryOwnerName,
    customer.spouseName,
    customer.coBuyerName,
    contract.signatures?.secondaryOwner?.fullName,
  )
}

function getAddressParts(contract: ContractRecord) {
  const customer = getCustomerData(contract)
  const project = getProjectData(contract)

  const street = firstString(
    project.projectAddress,
    project.streetAddress,
    project.address,
    customer.projectAddress,
    customer.streetAddress,
    customer.address,
  )
  const city = firstString(project.city, customer.city)
  const state = firstString(project.state, customer.state)
  const zipCode = firstString(
    project.zipCode,
    project.zipcode,
    customer.zipCode,
    customer.zipcode,
  )
  const county = firstString(project.county, customer.county)

  const cityStateZip = [city, state, zipCode].filter(Boolean).join(', ')

  return {
    street,
    city,
    state,
    zipCode,
    county,
    formatted: [street, cityStateZip].filter(Boolean).join(', '),
  }
}

function getBillingAddress(contract: ContractRecord) {
  const customer = getCustomerData(contract)

  const street = firstString(
    customer.billingAddress,
    customer.billingStreetAddress,
    customer.mailingAddress,
    customer.address,
  )
  const city = firstString(customer.billingCity, customer.mailingCity)
  const state = firstString(customer.billingState, customer.mailingState)
  const zipCode = firstString(
    customer.billingZipCode,
    customer.billingZipcode,
    customer.mailingZipCode,
  )

  return [street, [city, state, zipCode].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(', ')
}

function calculateProductPrice(
  opening: Opening,
  product: Product,
) {
  const category = safeString(
    product.productCategory,
  )

  const isDoor = doorCategories.has(category)

  return calculateCoreProductPrice({
    width: product.width,
    height: product.height,
    isDoor,
    impact: opening.impact,
  }).total
}

function buildProductLines(contract: ContractRecord): ProductLine[] {
  const openings = Array.isArray(contract.products?.openings)
    ? contract.products.openings
    : []

  return openings.flatMap((opening, openingIndex) => {
    const products = Array.isArray(opening.products) ? opening.products : []

    return products.map((product, productIndex) => {
      const quantity = Math.max(1, safeNumber(product.quantity) || 1)
      const width = parseMeasurement(product.width)
      const height = parseMeasurement(product.height)
      const squareFeet = width > 0 && height > 0 ? (width * height) / 144 : 0
      const basePrice = calculateProductPrice(opening, product)
      const mullionCharge = safeNumber(opening.mullionCharge)

      return {
        rowId:
          safeString(product.id) || `${openingIndex}-${productIndex}`,
        openingNumber: firstString(
          opening.openingNumber,
          openingIndex + 1,
        ),
        location: firstString(opening.location, 'Not specified'),
        openingImpact: Boolean(opening.impact),
        openingNotes: safeString(opening.notes),
        mullionCharge,
        product,
        quantity,
        width,
        height,
        squareFeet,
        basePrice,
        totalPrice: basePrice * quantity + mullionCharge,
      }
    })
  })
}

function getPaymentSummary(contract: ContractRecord, projectTotal: number) {
  const payment = safeObject(contract.payment)

  const method = firstString(
    payment.paymentMethod,
    payment.method,
    payment.paymentType,
    payment.financingType,
  )
  const downPayment = firstNumber(
    payment.downPayment,
    payment.deposit,
    payment.depositAmount,
    payment.initialPayment,
  )
  const amountFinanced = firstNumber(
    payment.amountFinanced,
    payment.financedAmount,
    payment.financeAmount,
  )
  const tax = firstNumber(payment.tax, payment.salesTax, payment.taxAmount)
  const balanceDue = firstNumber(
    payment.balanceDue,
    payment.balance,
    projectTotal - downPayment - amountFinanced,
  )

  return {
    payment,
    method,
    downPayment,
    amountFinanced,
    tax,
    balanceDue,
    financingCompany: firstString(
      payment.financingCompany,
      payment.lender,
      payment.financeCompany,
    ),
    term: firstString(
      payment.term,
      payment.financingTerm,
      payment.loanTerm,
    ),
  }
}

function getScheduleInformation(contract: ContractRecord) {
  const schedule = safeObject(contract.schedule)

  return {
    estimatedStart: firstString(
      schedule.estimatedStart,
      schedule.estimatedStartTime,
      schedule.productionLeadTime,
      schedule.installationWindow,
    ),
    installationDate: firstString(
      schedule.installationDate,
      schedule.preferredInstallationDate,
      schedule.estimatedInstallationDate,
    ),
    estimatedCompletion: firstString(
      schedule.estimatedCompletion,
      schedule.completionTime,
      schedule.installationDuration,
    ),
    permitRequired: firstString(schedule.permitRequired, schedule.permit),
    hoaRequired: firstString(schedule.hoaRequired, schedule.hoa),
  }
}

function humanBoolean(value: unknown, fallback = 'Not specified') {
  if (value === true || safeString(value).toLowerCase() === 'yes') return 'Yes'
  if (value === false || safeString(value).toLowerCase() === 'no') return 'No'
  return fallback
}

function readPossibleDiscounts(
  source: unknown,
): DiscountLine[] {
  if (!Array.isArray(source)) {
    return []
  }

  const discounts: DiscountLine[] = []

  source.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      return
    }

    const item = entry as UnknownRecord

    if (item.active === false) {
      return
    }

    const modeValue = safeString(item.mode).toLowerCase()
    const mode: 'percent' | 'fixed' =
      modeValue === 'percent' ? 'percent' : 'fixed'

    const value = Math.abs(
      safeNumber(
        item.value ??
        item.amount ??
        item.discountAmount ??
        item.savings,
      ),
    )

    const percentage = Math.abs(
      safeNumber(
        item.percentage ??
        item.percent ??
        item.rate ??
        (mode === 'percent' ? value : 0),
      ),
    )

    if (value <= 0 && percentage <= 0) {
      return
    }

    discounts.push({
      id: firstString(item.id, `discount-${index + 1}`),
      label: firstString(
        item.label,
        item.name,
        item.title,
        item.description,
        `Discount ${index + 1}`,
      ),
      amount:
        mode === 'fixed'
          ? value
          : Math.abs(
            safeNumber(
              item.amount ??
              item.discountAmount ??
              item.savings,
            ),
          ),
      percentage:
        mode === 'percent' && percentage > 0
          ? percentage
          : undefined,
      mode,
      value,
      order:
        Number.isFinite(Number(item.order))
          ? Number(item.order)
          : null,
    })
  })

  return discounts.sort((a, b) => {
    const aOrder = a.order ?? Number.MAX_SAFE_INTEGER
    const bOrder = b.order ?? Number.MAX_SAFE_INTEGER
    return aOrder - bOrder
  })
}

function chooseDiscountSource(
  ...sources: unknown[]
): unknown {
  const populatedArray = sources.find(
    (source) => Array.isArray(source) && source.length > 0,
  )

  return populatedArray ?? []
}

function normalizeDiscountLines(
  rawDiscounts: unknown,
  totalDiscount: number,
  retailPrice: number,
): DiscountLine[] {
  const lines = readPossibleDiscounts(rawDiscounts)

  if (lines.length > 0) {
    let currentPrice = retailPrice

    const calculated = lines.map((line) => {
      const requestedAmount =
        line.amount > 0
          ? line.amount
          : line.mode === 'percent'
            ? currentPrice * ((line.percentage ?? line.value ?? 0) / 100)
            : line.value ?? 0

      const amount = Math.min(
        Math.max(0, requestedAmount),
        currentPrice,
      )

      currentPrice = Math.max(0, currentPrice - amount)

      return {
        ...line,
        amount,
      }
    })

    const calculatedTotal = calculated.reduce(
      (sum, line) => sum + line.amount,
      0,
    )

    // Keep the itemized lines, but reconcile tiny rounding differences
    // with the contract's saved discount total.
    const difference = totalDiscount - calculatedTotal

    if (
      calculated.length > 0 &&
      totalDiscount > 0 &&
      Math.abs(difference) > 0.005
    ) {
      const lastIndex = calculated.length - 1
      calculated[lastIndex] = {
        ...calculated[lastIndex],
        amount: Math.max(
          0,
          calculated[lastIndex].amount + difference,
        ),
      }
    }

    return calculated
  }

  if (totalDiscount > 0) {
    return [
      {
        id: 'total-contract-discount',
        label: 'Contract Discounts and Promotions',
        amount: totalDiscount,
        mode: 'fixed',
        value: totalDiscount,
      },
    ]
  }

  return []
}

export default function ContractDocument() {
  const navigate = useNavigate()
  const contract = useMemo(() => readContractRecord(), [])
  const handoff = useMemo(() => readHandoffRecord(), [])

  const customer = getCustomerData(contract)
  const project = getProjectData(contract)
  const address = getAddressParts(contract)
  const billingAddress = getBillingAddress(contract)
  const customerName = getCustomerFullName(contract, handoff)
  const secondaryOwnerName = getSecondaryOwnerName(contract)

  const primaryEmail = firstString(
    customer.email,
    customer.primaryEmail,
    contract.customerEmail,
    handoff.customerEmail,
  )
  const secondaryEmail = firstString(
    customer.secondaryEmail,
    customer.spouseEmail,
  )
  const primaryPhone = firstString(
    customer.phone,
    customer.phoneNumber,
    customer.primaryPhone,
    customer.mobilePhone,
  )
  const secondaryPhone = firstString(
    customer.secondaryPhone,
    customer.spousePhone,
  )
  const yearBuilt = firstString(project.yearBuilt, customer.yearBuilt)

  const contractNumber = firstString(
    contract.contractNumber,
    handoff.contractNumber,
    'Not assigned',
  )
  const estimateNumber = firstString(
    contract.estimateNumber,
    handoff.estimateNumber,
    'Not assigned',
  )

  const executionDateValue = firstString(
    contract.executedAt,
    contract.completedAt,
    contract.updatedAt,
    contract.createdAt,
    new Date().toISOString(),
  )
  const parsedExecutionDate = new Date(executionDateValue)
  const cancellationDeadline = addCancellationBusinessDays(
    Number.isNaN(parsedExecutionDate.getTime())
      ? new Date()
      : parsedExecutionDate,
    3,
  )

  const productLines = buildProductLines(contract)
  const calculatedProductTotal = productLines.reduce(
    (sum, line) => sum + line.totalPrice,
    0,
  )
  const retailPrice = firstNumber(
    contract.products?.retailPrice,
    handoff.products?.retailPrice,
    calculatedProductTotal,
  )
  const discountTotal = firstNumber(
    contract.products?.discountTotal,
    handoff.products?.discountTotal,
  )
  const projectTotal = firstNumber(
    contract.products?.projectTotal,
    contract.projectTotal,
    handoff.products?.projectTotal,
    handoff.projectTotal,
    Math.max(0, retailPrice - discountTotal),
  )
  const discountSource = chooseDiscountSource(
    contract.products?.discounts,
    contract.discounts,
    handoff.products?.discounts,
    handoff.discounts,
  )

  const discountLines = normalizeDiscountLines(
    discountSource,
    discountTotal,
    retailPrice,
  )

  const payment = getPaymentSummary(contract, projectTotal)
  const schedule = getScheduleInformation(contract)
  const primaryOwner = contract.signatures?.primaryOwner
  const secondaryOwner = contract.signatures?.secondaryOwner
  const salesRepresentative = contract.signatures?.salesRepresentative
  const companyApproval = contract.signatures?.companyApproval

  const salesRepresentativeName = firstString(
    salesRepresentative?.fullName,
    safeObject(contract.project).salesRepresentative,
    safeObject(contract.projectForm).salesRepresentative,
  )

  const terms = safeObject(contract.terms)
  const projectNotes = firstString(
    project.notes,
    project.projectNotes,
    customer.notes,
  )
  const warrantySummary = firstString(
    terms.warrantySummary,
    terms.warranty,
    'Products and installation are covered under the applicable manufacturer warranty and Cronus workmanship warranty documents supplied with this agreement.',
  )

  const pageAgreement = 1
  const pageItemized = 2
  const pageFirstProduct = 3
  const pagePayment = pageFirstProduct + productLines.length
  const pageDiscounts = pagePayment + 1
  const pageCancellation = pageDiscounts + 1
  const pageLien = pageCancellation + 1
  const pageProcess = pageLien + 1
  const pageTerms = pageProcess + 1
  const pageExecution = pageTerms + 1

  return (
    <div className="min-h-screen bg-[#EDEBE6] text-[#252525] print:bg-white">
      <style>{`
        @page { size: Letter; margin: 0; }

        @media print {
          html, body { background: white !important; }
          html, body, #cronus-contract-document, #cronus-contract-document * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * { visibility: hidden; }
          #cronus-contract-document,
          #cronus-contract-document * { visibility: visible; }
          #cronus-contract-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .contract-toolbar { display: none !important; }
          .contract-page {
            width: 8.5in !important;
            min-height: 11in !important;
            margin: 0 !important;
            box-shadow: none !important;
            break-after: page;
            page-break-after: always;
          }
          .contract-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }
          .avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="contract-toolbar sticky top-0 z-50 border-b border-[#D8D4CC] bg-white/95 px-5 py-4 shadow-sm backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[1100px] flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#B59A68]">
              Contract Document
            </p>
            <p className="mt-1 text-sm font-medium text-[#555555]">
              {contractNumber} · {customerName || 'Customer'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const customer = getCustomerData(contract)

                const firstName = firstString(
                  customer.firstName,
                  customer.buyerFirstName,
                  customerName.split(' ')[0],
                )

                const lastName = firstString(
                  customer.lastName,
                  customer.buyerLastName,
                  customerName.split(' ').slice(1).join(' '),
                )

                const date = new Date()

                const formattedDate = [
                  String(date.getMonth() + 1).padStart(2, '0'),
                  String(date.getDate()).padStart(2, '0'),
                  date.getFullYear(),
                ].join('-')

                const fileName = `${lastName}${firstName}${formattedDate}`.replace(
                  /[^a-zA-Z0-9-]/g,
                  '',
                )

                const previousTitle = document.title

                document.title =
                  fileName || `CronusContract${formattedDate}`

                window.print()

                setTimeout(() => {
                  document.title = previousTitle
                }, 1000)
              }}
              className="rounded-xl bg-[#222222] px-5 py-2.5 text-sm font-medium text-white"
            >
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      <main id="cronus-contract-document" className="mx-auto py-8 print:py-0">
        <ContractPage
          pageNumber={pageAgreement}
          title="Home Improvement Agreement"
          contractNumber={contractNumber}
        >
          <CompanyHeader />

          <div className="mt-6 grid grid-cols-2 gap-5">
            <InformationBlock title="Buyer Information">
              <FieldLine label="Primary Buyer" value={customerName} />
              <FieldLine label="Co-Buyer" value={secondaryOwnerName} />
              <FieldLine label="Primary Phone" value={primaryPhone} />
              <FieldLine label="Secondary Phone" value={secondaryPhone} />
              <FieldLine label="Primary Email" value={primaryEmail} />
              <FieldLine label="Secondary Email" value={secondaryEmail} />
            </InformationBlock>

            <InformationBlock title="Project Information">
              <FieldLine label="Project Address" value={address.formatted} />
              <FieldLine
                label="Billing Address"
                value={billingAddress || address.formatted}
              />
              <FieldLine label="County" value={address.county} />
              <FieldLine label="Year Built" value={yearBuilt} />
              <FieldLine
                label="Permit Required"
                value={humanBoolean(schedule.permitRequired)}
              />
              <FieldLine
                label="HOA Required"
                value={humanBoolean(schedule.hoaRequired)}
              />
            </InformationBlock>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-3">
            <DocumentMetric label="Contract" value={contractNumber} />
            <DocumentMetric label="Estimate" value={estimateNumber} />
            <DocumentMetric
              label="Contract Date"
              value={formatDate(executionDateValue)}
            />
            <DocumentMetric
              label="Sales Consultant"
              value={salesRepresentativeName}
            />
          </div>

          <div className="mt-6 rounded-lg border border-[#AFA99D] p-4 text-[10px] leading-[1.55]">
            Buyer(s) jointly and severally agree to purchase the products and
            services described in this agreement and its incorporated schedules
            and attachments from {company.legalName}. The itemized product
            specifications, payment terms, project requirements, statutory
            notices, acknowledgments and terms contained in this package form
            the complete agreement between the parties.
          </div>

          <div className="mt-5 grid grid-cols-2 gap-5">
            <InformationBlock title="Financial Summary">
              <FieldLine label="Retail Price" value={formatCurrency(retailPrice)} />
              <FieldLine
                label="Discounts"
                value={`-${formatCurrency(discountTotal)}`}
              />
              <FieldLine
                label="Total Contract Price"
                value={formatCurrency(projectTotal)}
                strong
              />
              <FieldLine
                label="Down Payment"
                value={formatCurrency(payment.downPayment)}
              />
              <FieldLine
                label="Amount Financed"
                value={formatCurrency(payment.amountFinanced)}
              />
              <FieldLine
                label="Balance Due"
                value={formatCurrency(payment.balanceDue)}
                strong
              />
            </InformationBlock>

            <InformationBlock title="Payment and Schedule">
              <FieldLine label="Payment Method" value={payment.method} />
              <FieldLine
                label="Financing Company"
                value={payment.financingCompany}
              />
              <FieldLine label="Financing Term" value={payment.term} />
              <FieldLine
                label="Estimated Start"
                value={schedule.estimatedStart}
              />
              <FieldLine
                label="Estimated Completion"
                value={schedule.estimatedCompletion}
              />
              <FieldLine
                label="Preferred Installation"
                value={schedule.installationDate}
              />
            </InformationBlock>
          </div>

          <div className="mt-5 rounded-lg border border-[#AFA99D] p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em]">
              Project Notes
            </p>
            <p className="mt-2 min-h-[42px] whitespace-pre-wrap text-[10px] leading-[1.5]">
              {projectNotes || 'No additional project notes.'}
            </p>
          </div>

          <div className="mt-5 rounded-lg border-2 border-[#262626] p-4">
            <p className="text-[9px] font-bold uppercase">Notice to Buyer</p>
            <p className="mt-2 text-[10px] font-semibold leading-[1.5]">
              Do not sign this agreement if any required information is blank.
              You are entitled to a completed copy of this agreement when you
              sign it.
            </p>
            <p className="mt-3 text-[10px] font-bold uppercase leading-[1.45]">
              Buyer’s right to cancel: This is a home solicitation sale. Written
              cancellation must be delivered or postmarked before midnight of{' '}
              {formatDate(cancellationDeadline)}. See the attached Notice of
              Cancellation.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <DocumentSignature
              title="Customer 1"
              record={primaryOwner}
              fallbackName={customerName}
            />
            <DocumentSignature
              title="Customer 2"
              record={secondaryOwner}
              fallbackName={secondaryOwnerName}
            />
            <DocumentSignature
              title="Sales Representative"
              record={salesRepresentative}
              fallbackName={salesRepresentativeName}
            />
          </div>
        </ContractPage>

        <ContractPage
          pageNumber={pageItemized}
          title="Itemized Order Receipt"
          contractNumber={contractNumber}
        >
          <CompanyHeader compact />
          <CustomerMiniHeader
            customerName={customerName}
            address={address.formatted}
            phone={primaryPhone}
            yearBuilt={yearBuilt}
          />

          <div className="mt-5">
            <table className="w-full table-fixed border-collapse text-[8px]">
              <thead>
                <tr className="bg-[#E9E6DF]">
                  <ContractTableHeader className="w-[7%]">ID</ContractTableHeader>
                  <ContractTableHeader className="w-[12%]">Room</ContractTableHeader>
                  <ContractTableHeader className="w-[18%]">Product</ContractTableHeader>
                  <ContractTableHeader className="w-[10%]">Size</ContractTableHeader>
                  <ContractTableHeader className="w-[8%]">Impact</ContractTableHeader>
                  <ContractTableHeader className="w-[13%]">Glass</ContractTableHeader>
                  <ContractTableHeader className="w-[10%]">Grids</ContractTableHeader>
                  <ContractTableHeader className="w-[11%]">Colors</ContractTableHeader>
                  <ContractTableHeader className="w-[11%] text-right">
                    Price
                  </ContractTableHeader>
                </tr>
              </thead>
              <tbody>
                {productLines.map((line) => (
                  <tr
                    key={line.rowId}
                    className="border-b border-[#CFCAC0] align-top"
                  >
                    <ContractTableCell>{line.openingNumber}</ContractTableCell>
                    <ContractTableCell>{line.location}</ContractTableCell>
                    <ContractTableCell>
                      <strong>
                        {firstString(
                          line.product.label,
                          line.product.productCategory,
                        )}
                      </strong>
                      <div className="mt-1 text-[7px] text-[#666666]">
                        {firstString(line.product.productCategory, 'Product')}
                      </div>
                    </ContractTableCell>
                    <ContractTableCell>
                      {line.width || '—'} × {line.height || '—'}
                      <div className="mt-1 text-[7px] text-[#666666]">
                        {line.squareFeet.toFixed(2)} sq. ft.
                      </div>
                    </ContractTableCell>
                    <ContractTableCell>
                      {line.openingImpact ? 'YES' : 'NO'}
                    </ContractTableCell>
                    <ContractTableCell>
                      {firstString(
                        line.product.glassPackage,
                        line.product.glass,
                        'Not specified',
                      )}
                    </ContractTableCell>
                    <ContractTableCell>
                      {firstString(
                        line.product.grids,
                        line.product.grid,
                        'None',
                      )}
                    </ContractTableCell>
                    <ContractTableCell>
                      <div>
                        Int:{' '}
                        {firstString(
                          line.product.interiorColor,
                          line.product.color,
                          '—',
                        )}
                      </div>
                      <div className="mt-1">
                        Ext:{' '}
                        {firstString(
                          line.product.exteriorColor,
                          line.product.color,
                          '—',
                        )}
                      </div>
                    </ContractTableCell>
                    <ContractTableCell className="text-right font-semibold">
                      {formatCurrency(line.totalPrice)}
                    </ContractTableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-3">
            <DocumentMetric
              label="Windows"
              value={String(contract.products?.windowCount ?? 0)}
            />
            <DocumentMetric
              label="Doors"
              value={String(contract.products?.doorCount ?? 0)}
            />
            <DocumentMetric
              label="Total Products"
              value={String(productLines.length)}
            />
            <DocumentMetric
              label="Project Total"
              value={formatCurrency(projectTotal)}
            />
          </div>

          <p className="mt-5 text-[8px] leading-[1.5] text-[#555555]">
            Each opening and product is further described in the detailed
            product specification pages that follow. Dimensions remain subject
            to final technical measurement and field verification.
          </p>
        </ContractPage>

        {productLines.map((line, index) => (
          <ContractPage
            key={line.rowId}
            pageNumber={pageFirstProduct + index}
            title={`Opening ${line.openingNumber} — Detailed Product Specification`}
            contractNumber={contractNumber}
          >
            <CompanyHeader compact />
            <CustomerMiniHeader
              customerName={customerName}
              address={address.formatted}
              phone={primaryPhone}
              yearBuilt={yearBuilt}
            />

            <div className="mt-5 flex items-start justify-between gap-5 border-b-2 border-[#262626] pb-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8D7548]">
                  Opening {line.openingNumber}
                </p>
                <h2 className="mt-2 text-[22px] font-semibold">{line.location}</h2>
                <p className="mt-1 text-[12px] text-[#555555]">
                  {firstString(line.product.label, line.product.productCategory)}
                </p>
              </div>
              <ProductDiagram
                category={firstString(
                  line.product.productCategory,
                  line.product.label,
                )}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-5">
              <InformationBlock title="Product Configuration">
                <FieldLine
                  label="Product Name"
                  value={firstString(
                    line.product.label,
                    line.product.productCategory,
                  )}
                />
                <FieldLine
                  label="Category"
                  value={firstString(line.product.productCategory)}
                />
                <FieldLine label="Quantity" value={String(line.quantity)} />
                <FieldLine
                  label="Width"
                  value={line.width ? `${line.width} in.` : ''}
                />
                <FieldLine
                  label="Height"
                  value={line.height ? `${line.height} in.` : ''}
                />
                <FieldLine
                  label="Area"
                  value={`${line.squareFeet.toFixed(2)} sq. ft.`}
                />
                <FieldLine
                  label="Impact Rated"
                  value={line.openingImpact ? 'Yes' : 'No'}
                  strong={line.openingImpact}
                />
                <FieldLine
                  label="Tempered"
                  value={humanBoolean(line.product.tempered)}
                />
              </InformationBlock>

              <InformationBlock title="Finish and Options">
                <FieldLine
                  label="Interior Color"
                  value={firstString(
                    line.product.interiorColor,
                    line.product.color,
                  )}
                />
                <FieldLine
                  label="Exterior Color"
                  value={firstString(
                    line.product.exteriorColor,
                    line.product.color,
                  )}
                />
                <FieldLine
                  label="Glass Type"
                  value={firstString(line.product.glass)}
                />
                <FieldLine
                  label="Glass Package"
                  value={firstString(
                    line.product.glassPackage,
                    line.product.glass,
                  )}
                />
                <FieldLine
                  label="Grids"
                  value={firstString(
                    line.product.grids,
                    line.product.grid,
                    'None',
                  )}
                />
                <FieldLine
                  label="Screen"
                  value={firstString(
                    line.product.screens,
                    line.product.screen,
                    'Not specified',
                  )}
                />
                <FieldLine
                  label="Hardware"
                  value={firstString(line.product.hardware)}
                />
                <FieldLine
                  label="Mullion Charge"
                  value={formatCurrency(line.mullionCharge)}
                />
              </InformationBlock>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-5">
              <NotesBlock
                title="Product Notes"
                value={safeString(line.product.notes)}
              />
              <NotesBlock title="Opening Notes" value={line.openingNotes} />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <DocumentMetric
                label="Product Price"
                value={formatCurrency(line.basePrice)}
              />
              <DocumentMetric
                label="Mullion / Additional"
                value={formatCurrency(line.mullionCharge)}
              />
              <DocumentMetric
                label="Line Total"
                value={formatCurrency(line.totalPrice)}
              />
            </div>

            <div className="mt-6 rounded-lg border border-[#AFA99D] p-4 text-[9px] leading-[1.55]">
              Final manufacturing dimensions and installation requirements are
              subject to technical measurement, field verification, applicable
              building codes, product approvals and manufacturer tolerances. Any
              approved changes must be documented in writing.
            </div>
          </ContractPage>
        ))}

        <ContractPage
          pageNumber={pagePayment}
          title="Payment Authorization Form"
          contractNumber={contractNumber}
        >
          <CompanyHeader compact />
          <CustomerMiniHeader
            customerName={customerName}
            address={address.formatted}
            phone={primaryPhone}
            yearBuilt={yearBuilt}
          />

          <div className="mt-6 grid grid-cols-2 gap-5">
            <InformationBlock title="Buyer Information">
              <FieldLine label="Buyer Name" value={customerName} />
              <FieldLine label="Co-Buyer Name" value={secondaryOwnerName} />
              <FieldLine label="Address" value={address.formatted} />
              <FieldLine label="Phone" value={primaryPhone} />
              <FieldLine label="Email" value={primaryEmail} />
              <FieldLine
                label="Sales Representative"
                value={salesRepresentativeName}
              />
            </InformationBlock>

            <InformationBlock title="Payment Summary">
              <FieldLine
                label="Contract Price"
                value={formatCurrency(projectTotal)}
                strong
              />
              <FieldLine label="Payment Method" value={payment.method} />
              <FieldLine
                label="Down Payment"
                value={formatCurrency(payment.downPayment)}
              />
              <FieldLine
                label="Amount Financed"
                value={formatCurrency(payment.amountFinanced)}
              />
              <FieldLine
                label="Balance Due"
                value={formatCurrency(payment.balanceDue)}
                strong
              />
              <FieldLine label="Lender" value={payment.financingCompany} />
            </InformationBlock>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-[#AFA99D]">
            <div className="border-b border-[#AFA99D] bg-[#E9E6DF] px-4 py-3 text-[9px] font-bold uppercase tracking-[0.12em]">
              Payment Schedule
            </div>
            <div className="grid grid-cols-3">
              <PaymentScheduleCell
                label="Initial Payment"
                value={formatCurrency(payment.downPayment)}
              />
              <PaymentScheduleCell
                label="Financed Amount"
                value={formatCurrency(payment.amountFinanced)}
              />
              <PaymentScheduleCell
                label="Remaining Balance"
                value={formatCurrency(payment.balanceDue)}
              />
            </div>
          </div>

          <div className="mt-7 rounded-lg border border-[#AFA99D] p-5 text-[10px] leading-[1.6]">
            By signing below, Buyer(s) confirm the payment method and schedule
            reflected above and authorize Cronus Windows & Doors to process
            payments in accordance with the signed agreement and any separately
            executed financing or payment authorization documents.
          </div>

          <div className="mt-10 grid grid-cols-2 gap-8">
            <DocumentSignature
              title="Buyer"
              record={primaryOwner}
              fallbackName={customerName}
            />
            <DocumentSignature
              title="Co-Buyer"
              record={secondaryOwner}
              fallbackName={secondaryOwnerName}
            />
          </div>
        </ContractPage>

        <ContractPage
          pageNumber={pageDiscounts}
          title="Price Presentation Discounts"
          contractNumber={contractNumber}
        >
          <CompanyHeader compact />
          <CustomerMiniHeader
            customerName={customerName}
            address={address.formatted}
            phone={primaryPhone}
            yearBuilt={yearBuilt}
          />

          <div className="mt-8 flex items-center justify-between bg-black px-4 py-3 text-white">
            <span className="text-[10px] font-bold uppercase tracking-[0.08em]">
              Project Price Before Discounts
            </span>
            <span className="text-[13px] font-bold">
              {formatCurrency(retailPrice)}
            </span>
          </div>

          <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.12em]">
            Individual Savings Based on {productLines.length}{' '}
            {productLines.length === 1 ? 'Unit' : 'Units'}
          </p>

          <div className="mt-3 grid grid-cols-[1.7fr_0.8fr_0.65fr_0.75fr] bg-black px-3 py-2 text-[8px] font-bold uppercase tracking-[0.08em] text-white">
            <span>Description</span>
            <span>Type</span>
            <span>Value</span>
            <span className="text-right">Amount</span>
          </div>

          <div className="grid grid-cols-[1fr_170px] gap-6">
            <div>
              {discountLines.length === 0 ? (
                <div className="grid grid-cols-[1.7fr_0.8fr_0.65fr_0.75fr] border-b border-[#D4D4D4] px-3 py-3 text-[10px]">
                  <span>No discounts applied</span>
                  <span>—</span>
                  <span>—</span>
                  <span className="text-right font-bold">
                    {formatCurrency(0)}
                  </span>
                </div>
              ) : (
                discountLines.map((discount) => (
                  <div
                    key={discount.id}
                    className="grid grid-cols-[1.7fr_0.8fr_0.65fr_0.75fr] items-center border-b border-[#D4D4D4] px-3 py-3 text-[10px]"
                  >
                    <span className="font-medium">
                      {discount.label}
                      {discount.percentage
                        ? ` — ${discount.percentage}% off project`
                        : ''}
                    </span>
                    <span>
                      {discount.mode === 'percent'
                        ? 'Percentage'
                        : 'Fixed Amount'}
                    </span>
                    <span>
                      {discount.mode === 'percent'
                        ? `${(discount.percentage ?? discount.value ?? 0).toFixed(2)}%`
                        : '—'}
                    </span>
                    <span className="text-right font-bold text-[#B42318]">
                      -{formatCurrency(discount.amount)}
                    </span>
                  </div>
                ))
              )}

              <div className="mt-2 grid grid-cols-[1fr_auto] items-center bg-[#F1F1F1] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.08em]">
                <span>Total Savings</span>
                <span className="text-[#B42318]">
                  -{formatCurrency(discountTotal)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div
                className="discount-savings-badge flex h-[165px] w-[165px] flex-col items-center justify-center rounded-full border-[8px] border-white text-center text-white shadow-xl"
                style={{
                  backgroundColor: '#163A5F',
                  transform: 'none',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                <p className="text-[23px] font-black leading-none">
                  {formatCurrency(discountTotal)}
                </p>
                <p className="mt-3 text-[13px] font-bold uppercase tracking-[0.08em]">
                  Total Savings
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between bg-black px-4 py-3 text-white">
            <span className="text-[10px] font-bold uppercase tracking-[0.08em]">
              Total Contract Price
            </span>
            <span className="text-[13px] font-bold">
              {formatCurrency(projectTotal)}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-5">
            <DocumentMetric
              label="Retail Price"
              value={formatCurrency(retailPrice)}
            />
            <DocumentMetric
              label="Total Savings"
              value={`-${formatCurrency(discountTotal)}`}
            />
            <DocumentMetric
              label="Final Price"
              value={formatCurrency(projectTotal)}
            />
          </div>
        </ContractPage>

        <ContractPage
          pageNumber={pageCancellation}
          title="Notice of Cancellation"
          contractNumber={contractNumber}
        >
          <CompanyHeader compact />
          <CustomerMiniHeader
            customerName={customerName}
            address={address.formatted}
            phone={primaryPhone}
            yearBuilt={yearBuilt}
          />

          <p className="mt-4 border-b border-[#444444] pb-3 text-center text-[12px] font-semibold">
            You, the buyer(s), may cancel this transaction before midnight of{' '}
            {formatDate(cancellationDeadline)}.
          </p>

          <div className="mt-5 grid grid-cols-2 divide-x divide-dashed divide-[#BDB7AC]">
            <CancellationCopy
              copyLabel="Buyer Copy"
              transactionDate={executionDateValue}
              cancellationDeadline={cancellationDeadline}
            />
            <CancellationCopy
              copyLabel="Seller Copy"
              transactionDate={executionDateValue}
              cancellationDeadline={cancellationDeadline}
            />
          </div>
        </ContractPage>

        <ContractPage
          pageNumber={pageLien}
          title="Florida Lien Law"
          contractNumber={contractNumber}
        >
          <CompanyHeader compact />
          <CustomerMiniHeader
            customerName={customerName}
            address={address.formatted}
            phone={primaryPhone}
            yearBuilt={yearBuilt}
          />

          <div className="mt-7 text-[13px] font-black uppercase leading-[1.35]">
            According to Florida’s Construction Lien Law (Sections 713.001–713.37,
            Florida Statutes), those who work on your property or provide
            materials and services and are not paid in full have a right to
            enforce their claim for payment against your property. This claim is
            known as a construction lien. If your contractor or a subcontractor
            fails to pay subcontractors, sub-subcontractors, or material
            suppliers, those people who are owed money may look to your property
            for payment, even if you have already paid your contractor in full.
            If you fail to pay your contractor, your contractor may also have a
            lien on your property. This means if a lien is filed your property
            could be sold against your will to pay for labor, materials, or other
            services that your contractor or a subcontractor may have failed to
            pay. To protect yourself, you should stipulate in this contract that
            before any payment is made, your contractor is required to provide
            you with a written release of lien from any person or company that
            has provided to you a “Notice to Owner.” Florida’s Construction Lien
            Law is complex, and it is recommended that you consult an attorney.
          </div>

          <div className="mt-5 text-[10px] leading-[1.45]">
            <p className="font-bold underline">
              Florida Homeowners’ Construction Recovery Fund
            </p>
            <p className="mt-1">
              Payment may be available from the Florida Homeowners’ Construction
              Recovery Fund if you lose money on a project performed under
              contract where the loss results from specified violations of
              Florida law by a licensed contractor. For current information,
              contact the Florida Department of Business and Professional
              Regulation or consult a Florida attorney.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-5">
            <DocumentSignature
              title="Signature of Sales Person"
              record={salesRepresentative}
              fallbackName={salesRepresentativeName}
            />
            <DocumentSignature
              title="Signature of Customer 1"
              record={primaryOwner}
              fallbackName={customerName}
            />
            <DocumentSignature
              title="Signature of Customer 2"
              record={secondaryOwner}
              fallbackName={secondaryOwnerName}
            />
          </div>
        </ContractPage>

        <ContractPage
          pageNumber={pageProcess}
          title="Project Process — What to Expect"
          contractNumber={contractNumber}
        >
          <CompanyHeader compact />
          <CustomerMiniHeader
            customerName={customerName}
            address={address.formatted}
            phone={primaryPhone}
            yearBuilt={yearBuilt}
          />

          <div className="mt-6 space-y-4">
            <ProcessStep number="1" title="Technical Measurement">
              Buyer must provide reasonable access so Cronus can verify every
              opening, installation condition and final manufacturing dimension.
            </ProcessStep>
            <ProcessStep number="2" title="Permits and HOA">
              Buyer must provide required HOA information and approvals. Delays
              in approvals may affect production and installation dates.
            </ProcessStep>
            <ProcessStep number="3" title="Manufacturing">
              After measurements, specifications, payments, financing, permits
              and HOA requirements are complete, custom products may enter
              production.
            </ProcessStep>
            <ProcessStep number="4" title="Installation Scheduling">
              Installation dates are estimates until confirmed. Weather,
              permitting, material availability and inspections may cause
              changes.
            </ProcessStep>
            <ProcessStep number="5" title="Installation">
              Buyer must provide access to the work area, remove fragile property
              and keep children and pets safely away from construction areas.
            </ProcessStep>
            <ProcessStep number="6" title="Completion and Final Payment">
              Buyer will review the completed work, identify outstanding items
              and sign applicable completion documentation.
            </ProcessStep>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-5">
            <DocumentSignature
              title="Customer 1"
              record={primaryOwner}
              fallbackName={customerName}
            />
            <DocumentSignature
              title="Customer 2"
              record={secondaryOwner}
              fallbackName={secondaryOwnerName}
            />
            <DocumentSignature
              title="Sales Representative"
              record={salesRepresentative}
              fallbackName={salesRepresentativeName}
            />
          </div>
        </ContractPage>

        <ContractPage
          pageNumber={pageTerms}
          title="Terms and Conditions of Sale"
          contractNumber={contractNumber}
        >
          <CompanyHeader compact />

          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-[8.5px] leading-[1.5]">
            <TermClause number="1" title="Entire Agreement">
              This agreement, its schedules, product specifications, payment
              documents, notices, change orders and attachments constitute the
              entire agreement between the parties.
            </TermClause>
            <TermClause number="2" title="Technical Measurement">
              Product dimensions and installation methods are subject to field
              verification and reasonable technical adjustment.
            </TermClause>
            <TermClause number="3" title="Custom Products">
              Windows and doors are custom manufactured. After the applicable
              cancellation period and commencement of production, changes may
              result in additional charges.
            </TermClause>
            <TermClause number="4" title="Change Orders">
              Changes to products, scope, price or schedule must be documented in
              writing and approved by authorized parties.
            </TermClause>
            <TermClause number="5" title="Property Access">
              Buyer will provide timely access, utilities and clear work areas
              and will protect personal property as directed.
            </TermClause>
            <TermClause number="6" title="Permits and Approvals">
              Buyer is responsible for accurate ownership, HOA and property
              information. Scheduling may be delayed until approvals are complete.
            </TermClause>
            <TermClause number="7" title="Installation Conditions">
              Concealed structural damage, code violations, hazardous materials,
              water intrusion, mold and conditions outside the stated scope are
              not included unless specifically listed.
            </TermClause>
            <TermClause number="8" title="Scheduling and Delays">
              Dates are estimates. Cronus is not responsible for reasonable delays
              caused by weather, government action, inspections, supply or labor.
            </TermClause>
            <TermClause number="9" title="Payment">
              Buyer agrees to make payments according to the payment schedule.
              Failure to pay may delay work and constitute default.
            </TermClause>
            <TermClause number="10" title="Financing">
              Financing is subject to lender approval and separate lender
              documents. Buyer remains responsible unless expressly agreed.
            </TermClause>
            <TermClause number="11" title="Product Specifications">
              Colors, glass, grids, screens, hardware and impact rating are those
              shown in the detailed product specifications.
            </TermClause>
            <TermClause number="12" title="Warranty">
              {warrantySummary}
            </TermClause>
            <TermClause number="13" title="Glass and Condensation">
              Condensation may result from environmental conditions and does not
              necessarily indicate product failure.
            </TermClause>
            <TermClause number="14" title="Existing Conditions">
              Cronus is not responsible for pre-existing damage, settling,
              moisture or defective structures outside the contracted scope.
            </TermClause>
            <TermClause number="15" title="Collection and Enforcement">
              Unpaid balances, lien rights and enforcement are governed by the
              final attorney-approved agreement and applicable Florida law.
            </TermClause>
            <TermClause number="16" title="Electronic Signatures">
              Electronic signatures and initials are intended to have the same
              effect as handwritten signatures where permitted by law.
            </TermClause>
          </div>

          <div className="mt-6 rounded-lg border-2 border-[#222222] p-4 text-[9px] font-semibold leading-[1.5]">
            Cronus must have all final legal terms, warranty language,
            cancellation procedures and statutory notices reviewed by a
            Florida-licensed construction attorney before production use.
          </div>
        </ContractPage>

        <ContractPage
          pageNumber={pageExecution}
          title="Contract Execution"
          contractNumber={contractNumber}
        >
          <CompanyHeader />

          <div className="mt-8 rounded-lg border border-[#AFA99D] p-5 text-[10px] leading-[1.65]">
            By signing below, the parties acknowledge that they reviewed the
            customer information, project address, all product specifications,
            impact designation, glass, colors, grids, screens, prices, discounts,
            payment terms, notices and terms contained in this contract package.
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <LargeSignatureBlock
              title="Primary Homeowner"
              record={primaryOwner}
              fallbackName={customerName}
            />
            <LargeSignatureBlock
              title="Secondary Homeowner"
              record={secondaryOwner}
              fallbackName={secondaryOwnerName}
            />
            <LargeSignatureBlock
              title="Sales Representative"
              record={salesRepresentative}
              fallbackName={salesRepresentativeName}
            />
            <LargeSignatureBlock
              title="Authorized Company Approval"
              record={companyApproval}
              fallbackName={companyApproval?.fullName}
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-5">
            <InformationBlock title="Execution Record">
              <FieldLine label="Contract Number" value={contractNumber} />
              <FieldLine label="Estimate Number" value={estimateNumber} />
              <FieldLine
                label="Executed"
                value={formatDateTime(contract.executedAt)}
              />
              <FieldLine
                label="Project Total"
                value={formatCurrency(projectTotal)}
                strong
              />
            </InformationBlock>

            <InformationBlock title="Electronic Acknowledgment">
              <FieldLine
                label="Electronic Signature Consent"
                value={humanBoolean(
                  contract.signatures?.electronicSignatureConsent,
                )}
              />
              <FieldLine
                label="Identity Confirmed"
                value={humanBoolean(
                  contract.signatures?.customerIdentityConfirmed,
                )}
              />
              <FieldLine
                label="Agreement Reviewed"
                value={humanBoolean(
                  contract.signatures?.contractReviewedBeforeSigning,
                )}
              />
              <FieldLine
                label="Cancellation Notice"
                value={humanBoolean(
                  contract.signatures?.cancellationNoticeAcknowledged,
                )}
              />
              <FieldLine
                label="Lien Notice"
                value={humanBoolean(
                  contract.signatures?.lienNoticeAcknowledged,
                )}
              />
            </InformationBlock>
          </div>
        </ContractPage>
      </main>
    </div>
  )
}

function ContractPage({
  pageNumber,
  title,
  contractNumber,
  children,
}: {
  pageNumber: number
  title: string
  contractNumber: string
  children: ReactNode
}) {
  return (
    <section className="contract-page relative mx-auto mb-8 flex min-h-[11in] w-[8.5in] flex-col bg-white px-[0.48in] pb-[0.42in] pt-[0.42in] shadow-xl print:mb-0">
      <div className="mb-4 flex items-center justify-between border-b-2 border-[#222222] pb-3">
        <div className="flex items-center gap-3">
          <CronusLogo className="h-[72px] w-[135px] shrink-0 object-left" />
          <div>
            <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-[#9A8050]">
              Cronus Windows & Doors
            </p>
            <h1 className="mt-1 text-[17px] font-semibold">{title}</h1>
          </div>
        </div>
        <div className="text-right text-[8px] leading-[1.5] text-[#555555]">
          <p>Contract: {contractNumber}</p>
          <p>Page {pageNumber}</p>
        </div>
      </div>

      <div className="flex-1">{children}</div>

      <footer className="mt-5 flex items-center justify-between border-t border-[#BDB7AC] pt-2 text-[7px] text-[#666666]">
        <span>{company.legalName}</span>
        <span>{company.phone} · {company.email}</span>
        <span>Page {pageNumber}</span>
      </footer>
    </section>
  )
}

function CronusLogo({ className = '' }: { className?: string }) {
  if (!cronusLogoUrl) {
    return (
      <div className={className}>
        <p className="text-[15px] font-bold uppercase tracking-[0.15em]">
          Cronus
        </p>
        <p className="text-[6px] font-semibold uppercase tracking-[0.18em] text-[#9A8050]">
          Windows & Doors
        </p>
      </div>
    )
  }

  return (
    <img
      src={cronusLogoUrl}
      alt="Cronus Windows & Doors"
      className={`object-contain ${className}`}
    />
  )
}

function CompanyHeader({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex justify-end ${compact ? 'min-h-[54px]' : 'min-h-[72px]'}`}
    >
      <div className="text-right text-[8px] leading-[1.5]">
        <p className="font-bold">{company.legalName}</p>
        <p>License: {company.licenseNumber}</p>
        <p>{company.addressLine1}</p>
        <p>{company.addressLine2}</p>
        <p>
          Phone: {company.phone} · {company.email}
        </p>
      </div>
    </div>
  )
}

function CustomerMiniHeader({
  customerName,
  address,
  phone,
  yearBuilt,
}: {
  customerName: string
  address: string
  phone: string
  yearBuilt: string
}) {
  return (
    <div className="mt-4 grid grid-cols-[1.1fr_1.6fr_0.8fr_0.6fr] gap-3 border-y border-[#BDB7AC] py-3 text-[8px]">
      <MiniField label="Customer" value={customerName} />
      <MiniField label="Project Address" value={address} />
      <MiniField label="Phone" value={phone} />
      <MiniField label="Year Built" value={yearBuilt} />
    </div>
  )
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="font-bold uppercase text-[#777777]">{label}</p>
      <p className="mt-1 break-words font-medium">
        {value || 'Not specified'}
      </p>
    </div>
  )
}

function InformationBlock({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="avoid-break overflow-hidden rounded-lg border border-[#AFA99D]">
      <div className="bg-[#E9E6DF] px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.12em]">
        {title}
      </div>
      <div className="divide-y divide-[#D5D0C7] px-4">{children}</div>
    </section>
  )
}

function FieldLine({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="grid grid-cols-[42%_58%] gap-3 py-2 text-[9px]">
      <p className="font-semibold uppercase text-[#666666]">{label}</p>
      <p
        className={`break-words text-right ${strong ? 'font-bold' : 'font-medium'
          }`}
      >
        {value || 'Not specified'}
      </p>
    </div>
  )
}

function DocumentMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-[#AFA99D] p-3">
      <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-[#777777]">
        {label}
      </p>
      <p className="mt-2 break-words text-[11px] font-semibold">
        {value || 'Not specified'}
      </p>
    </div>
  )
}

function DocumentSignature({
  title,
  record,
  fallbackName,
}: {
  title: string
  record?: SignatureRecord
  fallbackName?: string
}) {
  return (
    <div className="avoid-break">
      <p className="text-[8px] font-bold uppercase tracking-[0.1em]">{title}</p>
      <div className="mt-2 flex h-[52px] items-end justify-center border-b border-[#333333]">
        {record?.signatureDataUrl ? (
          <img
            src={record.signatureDataUrl}
            alt={`${title} signature`}
            className="max-h-[48px] max-w-full object-contain"
          />
        ) : null}
      </div>
      <p className="mt-2 text-[8px] font-semibold">
        {firstString(record?.fullName, fallbackName, 'Not signed')}
      </p>
      <p className="mt-1 text-[7px] text-[#666666]">
        {record?.signedAt
          ? formatDateTime(record.signedAt)
          : record?.signedDate
            ? formatDate(record.signedDate)
            : 'Date not recorded'}
      </p>
    </div>
  )
}

function LargeSignatureBlock({
  title,
  record,
  fallbackName,
}: {
  title: string
  record?: SignatureRecord
  fallbackName?: string
}) {
  return (
    <div className="avoid-break rounded-lg border border-[#AFA99D] p-5">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em]">{title}</p>
      <div className="mt-4 flex h-[100px] items-center justify-center rounded border border-[#D4CFC6] bg-[#FBFAF8] p-3">
        {record?.signatureDataUrl ? (
          <img
            src={record.signatureDataUrl}
            alt={`${title} signature`}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-[9px] text-[#999999]">No signature</span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-[8px]">
        <div>
          <p className="font-bold uppercase text-[#777777]">Printed Name</p>
          <p className="mt-1 font-semibold">
            {firstString(record?.fullName, fallbackName, 'Not specified')}
          </p>
        </div>
        <div>
          <p className="font-bold uppercase text-[#777777]">Date</p>
          <p className="mt-1 font-semibold">
            {firstString(
              record?.signedDate,
              record?.signedAt ? formatDate(record.signedAt) : '',
              'Not recorded',
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

function ContractTableHeader({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <th
      className={`border border-[#BDB7AC] px-2 py-2 text-left font-bold uppercase tracking-[0.06em] ${className}`}
    >
      {children}
    </th>
  )
}

function ContractTableCell({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <td className={`border-x border-[#D5D0C7] px-2 py-2 ${className}`}>
      {children}
    </td>
  )
}

function NotesBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="avoid-break min-h-[110px] rounded-lg border border-[#AFA99D]">
      <div className="bg-[#E9E6DF] px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.12em]">
        {title}
      </div>
      <p className="whitespace-pre-wrap p-4 text-[9px] leading-[1.55]">
        {value || 'No notes specified.'}
      </p>
    </div>
  )
}

function PaymentScheduleCell({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="border-r border-[#AFA99D] p-5 last:border-r-0">
      <p className="text-[8px] font-bold uppercase text-[#777777]">{label}</p>
      <p className="mt-3 text-[15px] font-semibold">{value}</p>
    </div>
  )
}

function ProcessStep({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="avoid-break grid grid-cols-[42px_1fr] gap-4 rounded-lg border border-[#AFA99D] p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#222222] text-[12px] font-bold text-white">
        {number}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.08em]">
          {title}
        </p>
        <p className="mt-2 text-[9px] leading-[1.55] text-[#444444]">
          {children}
        </p>
      </div>
    </div>
  )
}

function TermClause({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="avoid-break">
      <p className="font-bold uppercase">
        {number}. {title}
      </p>
      <p className="mt-1 text-justify">{children}</p>
    </div>
  )
}

function ProductDiagram({ category }: { category: string }) {
  const normalized = category.toLowerCase()
  const isDoor = normalized.includes('door')
  const isSlider =
    normalized.includes('slider') || normalized.includes('sliding')
  const isCasement = normalized.includes('casement')
  const isHung =
    normalized.includes('double') ||
    normalized.includes('single hung') ||
    normalized.includes('hung')

  return (
    <div className="w-[145px]">
      <div
        className={`relative mx-auto border-[3px] border-[#333333] ${isDoor ? 'h-[130px] w-[82px]' : 'h-[100px] w-[120px]'
          }`}
      >
        {isSlider ? (
          <>
            <div className="absolute inset-y-0 left-1/2 border-l-2 border-[#555555]" />
            <div className="absolute bottom-2 left-2 top-2 border-r border-[#777777]" />
            <div className="absolute bottom-2 right-2 top-2 border-l border-[#777777]" />
          </>
        ) : null}

        {isCasement ? (
          <>
            <div className="absolute bottom-2 left-2 right-2 top-2 border border-[#777777]" />
            <div className="absolute bottom-2 left-2 right-2 top-2 origin-bottom-left rotate-[35deg] border-l border-[#777777]" />
          </>
        ) : null}

        {isHung ? (
          <>
            <div className="absolute inset-x-0 top-1/2 border-t-2 border-[#555555]" />
            <div className="absolute inset-x-4 top-[46%] border-t border-[#777777]" />
            <div className="absolute inset-x-4 bottom-[46%] border-t border-[#777777]" />
          </>
        ) : null}

        {!isSlider && !isCasement && !isHung ? (
          <div className="absolute inset-2 border border-[#777777]" />
        ) : null}

        {isDoor ? (
          <div className="absolute right-2 top-1/2 h-2 w-2 rounded-full bg-[#333333]" />
        ) : null}
      </div>
      <p className="mt-2 text-center text-[8px] font-bold uppercase tracking-[0.08em]">
        {category || 'Product'}
      </p>
    </div>
  )
}

function CancellationCopy({
  copyLabel,
  transactionDate,
  cancellationDeadline,
}: {
  copyLabel: string
  transactionDate: string
  cancellationDeadline: Date
}) {
  return (
    <div className="px-4 first:pl-0 last:pr-0">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black uppercase underline">
          Notice of Cancellation
        </p>
        <p className="text-[7px] font-bold uppercase text-[#777777]">
          {copyLabel}
        </p>
      </div>

      <div className="mt-4 space-y-3 text-[8.5px] font-semibold leading-[1.38]">
        <p>
          Date of Transaction: {formatDate(transactionDate)}. You may cancel
          this transaction, without any penalty or obligation, before midnight
          of {formatDate(cancellationDeadline)} or the third business day after
          the date of this transaction, whichever date is later.
        </p>
        <p>
          If you cancel, any property traded in, any payments made by you under
          the contract or sale, and any negotiable instrument executed by you
          will be returned within 10 business days following receipt by the
          seller of your cancellation notice, and any security interest arising
          out of the transaction will be canceled.
        </p>
        <p>
          If you cancel, you must make available to the seller at your residence,
          in substantially as good condition as when received, any goods
          delivered to you under this contract or sale; or you may, if you wish,
          comply with the seller’s instructions regarding return shipment of the
          goods at the seller’s expense and risk.
        </p>
        <p>
          If you make the goods available to the seller and the seller does not
          pick them up within 20 days of the date of your notice of cancellation,
          you may retain or dispose of the goods without further obligation. If
          you fail to make the goods available or agree to return them and fail
          to do so, you remain liable for performance of all obligations under
          the contract.
        </p>
        <p>
          To cancel this transaction, mail or deliver a signed and dated copy of
          this cancellation notice, or any other written notice, to:
        </p>
        <div className="space-y-1 font-bold">
          <p>{company.legalName}</p>
          <p>{company.addressLine1}</p>
          <p>{company.addressLine2}</p>
          <p>Phone: {company.phone}</p>
          <p>Email: {company.email}</p>
        </div>
        <p className="font-black uppercase">
          Not later than midnight of {formatDate(cancellationDeadline)} or the
          third business day after the date of this transaction, whichever date
          is later.
        </p>
      </div>

      <p className="mt-5 text-[9px] font-black uppercase italic">
        I hereby cancel this transaction
      </p>

      <div className="mt-10 grid grid-cols-[1fr_85px] gap-4 text-[7px] font-bold uppercase">
        <div className="border-b border-black pb-1">Buyer Signature</div>
        <div className="border-b border-black pb-1">Date</div>
      </div>
    </div>
  )
}
