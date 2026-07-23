import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type OpeningProduct = {
  id?: string
  label?: string
  position?: string
  productCategory?: string
  series?: string
  model?: string
  width?: string
  height?: string
  color?: string
  glassType?: string
  tempered?: string
  grids?: string
  gridPattern?: string
  screen?: string
  installation?: string
  notes?: string
}

type Opening = {
  id?: string
  openingNumber?: string
  location?: string
  locationDetail?: string
  impact?: boolean
  products?: OpeningProduct[]
}

type ContractHandoff = {
  estimateNumber?: string
  contractNumber?: string

  customerName?: string
  customerEmail?: string
  customerPhone?: string

  projectForm: {
    projectName?: string
    projectAddress?: string
    salesperson?: string
  }

  projectTotal: number
  contractStatus?: string

  openings?: Opening[]
}

type ContractReview = ContractHandoff & {
  buyerName: string
  coBuyerName: string
  buyerEmail: string
  buyerPhone: string
  projectAddress: string
  city: string
  state: string
  zipCode: string
  salesperson: string
  paymentMethod: string
  financeCompany: string
  financingPlan: string
  depositAmount: number
  balanceDue: number
  permitRequired: boolean
  hoaRequired: boolean
  estimatedStartDate: string
  specialInstructions: string
  installationNotes: string
  reviewedAt: string
}

const contractHandoffStorageKey =
  'cronus_contract_handoff_v1'

const contractReviewStorageKey =
  'cronus_contract_review_v1'

function loadContract(): ContractHandoff | null {
  try {
    const storedContract = localStorage.getItem(
      contractHandoffStorageKey,
    )

    return storedContract
      ? (JSON.parse(storedContract) as ContractHandoff)
      : null
  } catch {
    return null
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0)
}

function parseProjectAddress(address: string) {
  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  const streetAddress = parts[0] ?? ''
  const city = parts[1] ?? ''

  let state = ''
  let zipCode = ''

  if (parts[2]) {
    const stateAndZip = parts[2].split(/\s+/)

    state = stateAndZip[0] ?? ''
    zipCode = stateAndZip.slice(1).join(' ')
  }

  return {
    streetAddress,
    city,
    state,
    zipCode,
  }
}

export default function NewContract() {
  const navigate = useNavigate()
  const contract = useMemo(() => loadContract(), [])

  const parsedAddress = useMemo(
    () =>
      parseProjectAddress(
        contract?.projectForm.projectAddress ?? '',
      ),
    [contract],
  )

  const [buyerName, setBuyerName] = useState(
    contract?.customerName ?? '',
  )

  const [coBuyerName, setCoBuyerName] = useState('')

  const [buyerEmail, setBuyerEmail] = useState(
    contract?.customerEmail ?? '',
  )

  const [buyerPhone, setBuyerPhone] = useState(
    contract?.customerPhone ?? '',
  )

  const [projectAddress, setProjectAddress] = useState(
    parsedAddress.streetAddress,
  )

  const [city, setCity] = useState(parsedAddress.city)
  const [state, setState] = useState(parsedAddress.state)
  const [zipCode, setZipCode] = useState(
    parsedAddress.zipCode,
  )

  const [salesperson, setSalesperson] = useState(
    contract?.projectForm.salesperson ?? '',
  )

  const [paymentMethod, setPaymentMethod] =
    useState('Cash')

  const [financeCompany, setFinanceCompany] = useState('')
  const [financingPlan, setFinancingPlan] = useState('')

  const [depositAmount, setDepositAmount] = useState(
    contract ? contract.projectTotal * 0.5 : 0,
  )

  const [permitRequired, setPermitRequired] =
    useState(true)

  const [hoaRequired, setHoaRequired] = useState(false)

  const [estimatedStartDate, setEstimatedStartDate] =
    useState('')

  const [specialInstructions, setSpecialInstructions] =
    useState('')

  const [installationNotes, setInstallationNotes] =
    useState('')

  const [saveMessage, setSaveMessage] = useState('')

  const balanceDue = Math.max(
    0,
    (contract?.projectTotal ?? 0) - depositAmount,
  )

  const openings = contract?.openings ?? []

  const productCount = openings.reduce(
    (total, opening) =>
      total + (opening.products?.length ?? 0),
    0,
  )

  if (!contract) {
    return (
      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl rounded-[24px] border border-[#E8E5DE] bg-white p-8 text-center">
          <h1 className="text-3xl font-light text-[#444444]">
            No order selected
          </h1>

          <p className="mt-4 text-[#999999]">
            Use Order Now from Pricing to begin a
            contract.
          </p>

          <Link
            to="/portal/quotes/new"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-xl bg-[#222222] px-6 text-sm font-medium text-white"
          >
            Return to pricing
          </Link>
        </div>
      </section>
    )
  }

  function createContractReview(): ContractReview {
    const activeContract = contract!

    return {
      ...activeContract,
      estimateNumber: activeContract.estimateNumber ?? '',
      contractNumber:
        activeContract.contractNumber ??
        `CON-${activeContract.estimateNumber ?? ''}`,
      contractStatus: 'Review',
      buyerName: buyerName.trim(),
      coBuyerName: coBuyerName.trim(),
      buyerEmail: buyerEmail.trim(),
      buyerPhone: buyerPhone.trim(),
      projectAddress: projectAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      salesperson: salesperson.trim(),
      paymentMethod,
      financeCompany: financeCompany.trim(),
      financingPlan: financingPlan.trim(),
      depositAmount,
      balanceDue,
      permitRequired,
      hoaRequired,
      estimatedStartDate,
      specialInstructions: specialInstructions.trim(),
      installationNotes: installationNotes.trim(),
      reviewedAt: new Date().toISOString(),
    }
  }

  function saveContractReview() {
    const review = createContractReview()

    localStorage.setItem(
      contractReviewStorageKey,
      JSON.stringify(review),
    )

    setSaveMessage('Contract review saved.')

    window.setTimeout(() => {
      setSaveMessage('')
    }, 2500)
  }

  function continueToSignatures() {
    if (!buyerName.trim()) {
      window.alert('Enter the buyer name.')
      return
    }

    if (!buyerEmail.trim()) {
      window.alert('Enter the buyer email.')
      return
    }

    if (!projectAddress.trim()) {
      window.alert('Enter the project address.')
      return
    }

    if (
      paymentMethod === 'Financing' &&
      !financeCompany.trim()
    ) {
      window.alert('Enter the finance company.')
      return
    }

    const review = createContractReview()

    localStorage.setItem(
      contractReviewStorageKey,
      JSON.stringify(review),
    )

    navigate('/portal/contracts/signatures')
  }

  return (
    <section className="px-5 py-9 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1350px]">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Contract Review
            </p>

            <h1 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              Review the contract.
            </h1>

            <p className="mt-4 text-base text-[#888888]">
              Created from estimate{' '}
              {contract.estimateNumber}.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E5DE] bg-white px-5 py-4">
            <p className="text-xs uppercase tracking-[0.13em] text-[#AAA39A]">
              Contract
            </p>

            <p className="mt-1 text-lg font-medium text-[#555555]">
              {contract.contractNumber ??
                `CON-${contract.estimateNumber}`}
            </p>
          </div>
        </div>

        <div className="mt-9 grid gap-7 xl:grid-cols-[1fr_360px]">
          <main className="space-y-7">
            <ContractSection
              title="Buyer information"
              description="Confirm the primary buyer and add a second buyer when applicable."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Buyer name"
                  required
                  value={buyerName}
                  onChange={setBuyerName}
                />

                <Field
                  label="Co-buyer name"
                  value={coBuyerName}
                  onChange={setCoBuyerName}
                  placeholder="Optional"
                />

                <Field
                  label="Email"
                  required
                  type="email"
                  value={buyerEmail}
                  onChange={setBuyerEmail}
                />

                <Field
                  label="Phone"
                  type="tel"
                  value={buyerPhone}
                  onChange={setBuyerPhone}
                />
              </div>
            </ContractSection>

            <ContractSection
              title="Project information"
              description="Confirm the property address and sales representative."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field
                    label="Project address"
                    required
                    value={projectAddress}
                    onChange={setProjectAddress}
                  />
                </div>

                <Field
                  label="City"
                  value={city}
                  onChange={setCity}
                />

                <div className="grid grid-cols-[1fr_1fr] gap-5">
                  <Field
                    label="State"
                    value={state}
                    onChange={setState}
                  />

                  <Field
                    label="ZIP code"
                    value={zipCode}
                    onChange={setZipCode}
                  />
                </div>

                <Field
                  label="Sales representative"
                  value={salesperson}
                  onChange={setSalesperson}
                />

                <Field
                  label="Estimated project start"
                  type="date"
                  value={estimatedStartDate}
                  onChange={setEstimatedStartDate}
                />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <BooleanCard
                  title="Permit required"
                  description="Permit processing will be included in the project workflow."
                  checked={permitRequired}
                  onChange={setPermitRequired}
                />

                <BooleanCard
                  title="HOA approval required"
                  description="The project requires HOA documentation or approval."
                  checked={hoaRequired}
                  onChange={setHoaRequired}
                />
              </div>
            </ContractSection>

            <ContractSection
              title="Products included"
              description={`${productCount} product${productCount === 1 ? '' : 's'
                } across ${openings.length} opening${openings.length === 1 ? '' : 's'
                }.`}
            >
              {openings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#DDD8CE] bg-[#FAF9F6] px-6 py-8 text-center">
                  <p className="text-sm text-[#888888]">
                    No opening details were included in
                    this contract handoff.
                  </p>

                  <p className="mt-2 text-xs text-[#AAA39A]">
                    The contract can still continue using
                    the estimate total.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {openings.map((opening, openingIndex) => (
                    <OpeningCard
                      key={
                        opening.id ??
                        `${opening.openingNumber}-${openingIndex}`
                      }
                      opening={opening}
                      openingIndex={openingIndex}
                    />
                  ))}
                </div>
              )}
            </ContractSection>

            <ContractSection
              title="Payment and financing"
              description="Confirm how the customer will pay for the project."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Payment method"
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  options={[
                    'Cash',
                    'Check',
                    'Credit Card',
                    'Financing',
                  ]}
                />

                {paymentMethod === 'Financing' ? (
                  <Field
                    label="Finance company"
                    required
                    value={financeCompany}
                    onChange={setFinanceCompany}
                    placeholder="Example: GreenSky"
                  />
                ) : (
                  <div />
                )}

                {paymentMethod === 'Financing' && (
                  <Field
                    label="Financing plan"
                    value={financingPlan}
                    onChange={setFinancingPlan}
                    placeholder="Example: 12 months same as cash"
                  />
                )}

                <CurrencyField
                  label="Deposit amount"
                  value={depositAmount}
                  onChange={setDepositAmount}
                />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <MoneySummary
                  label="Contract total"
                  value={contract.projectTotal}
                />

                <MoneySummary
                  label="Deposit"
                  value={depositAmount}
                />

                <MoneySummary
                  label="Balance due"
                  value={balanceDue}
                />
              </div>
            </ContractSection>

            <ContractSection
              title="Project notes"
              description="Add instructions that should remain attached to the contract."
            >
              <div className="grid gap-5">
                <TextAreaField
                  label="Special instructions"
                  value={specialInstructions}
                  onChange={setSpecialInstructions}
                  placeholder="Customer requests, access instructions, HOA requirements or other important details."
                />

                <TextAreaField
                  label="Installation notes"
                  value={installationNotes}
                  onChange={setInstallationNotes}
                  placeholder="Installation details, existing conditions, trim, stucco, paint or special preparation."
                />
              </div>
            </ContractSection>

            <ContractSection
              title="Terms and conditions"
              description="Contract terms will be included in the final signed PDF."
            >
              <div className="space-y-4 text-sm leading-7 text-[#777777]">
                <p>
                  The buyer confirms that the customer,
                  property, product and pricing information
                  shown in this contract has been reviewed
                  for accuracy.
                </p>

                <p>
                  Product specifications, measurements,
                  installation requirements, permit
                  requirements and project timing remain
                  subject to final verification by Cronus
                  Windows &amp; Doors.
                </p>

                <p>
                  Final legal terms, cancellation notices,
                  warranties and financing disclosures will
                  be included before the contract is
                  completed and signed.
                </p>
              </div>
            </ContractSection>
          </main>

          <aside className="xl:sticky xl:top-8 xl:self-start">
            <div className="rounded-[26px] border border-[#E8E5DE] bg-[#FAF9F6] p-7">
              <p className="text-xs uppercase tracking-[0.14em] text-[#9A8258]">
                Contract total
              </p>

              <p className="mt-3 text-4xl font-light text-[#333333]">
                {formatCurrency(contract.projectTotal)}
              </p>

              <div className="mt-7 space-y-4 border-t border-[#E4E0D7] pt-6">
                <SummaryRow
                  label="Estimate"
                  value={contract.estimateNumber ?? '—'}
                />

                <SummaryRow
                  label="Buyer"
                  value={buyerName || 'Not entered'}
                />

                <SummaryRow
                  label="Openings"
                  value={String(openings.length)}
                />

                <SummaryRow
                  label="Products"
                  value={String(productCount)}
                />

                <SummaryRow
                  label="Payment"
                  value={paymentMethod}
                />

                <SummaryRow
                  label="Status"
                  value="Review"
                />
              </div>

              {saveMessage && (
                <div className="mt-6 rounded-xl border border-[#DCD7CB] bg-white px-4 py-3 text-center text-sm text-[#6F6657]">
                  {saveMessage}
                </div>
              )}

              <button
                type="button"
                onClick={saveContractReview}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#D8D3C9] bg-white px-6 text-sm font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#9A8258]"
              >
                Save review
              </button>

              <button
                type="button"
                onClick={continueToSignatures}
                className="mt-3 inline-flex min-h-16 w-full items-center justify-between rounded-xl bg-[#222222] px-6 py-4 text-left text-white transition hover:bg-[#B59A68]"
              >
                <span>
                  <span className="block text-sm font-medium uppercase tracking-[0.13em]">
                    Next
                  </span>

                  <span className="mt-1 block text-xs text-white/70">
                    Customer signatures
                  </span>
                </span>

                <span className="text-2xl font-light">
                  →
                </span>
              </button>

              <Link
                to="/portal/quotes/new"
                className="mt-4 inline-flex h-11 w-full items-center justify-center text-sm text-[#999999] transition hover:text-[#555555]"
              >
                Return to estimate
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function ContractSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[26px] border border-[#E8E5DE] bg-white p-6 sm:p-8">
      <div className="border-b border-[#F0EDE7] pb-5">
        <h2 className="text-2xl font-light text-[#444444]">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#999999]">
          {description}
        </p>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#8E887E]">
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
        className="mt-2 h-12 w-full rounded-xl border border-[#E0DDD6] bg-white px-4 text-sm text-[#555555] outline-none transition placeholder:text-[#C2BDB4] focus:border-[#B59A68]"
      />
    </label>
  )
}

function CurrencyField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#8E887E]">
        {label}
      </span>

      <div className="relative mt-2">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAA39A]">
          $
        </span>

        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) =>
            onChange(
              Math.max(
                0,
                Number(event.target.value) || 0,
              ),
            )
          }
          className="h-12 w-full rounded-xl border border-[#E0DDD6] bg-white pl-8 pr-4 text-sm text-[#555555] outline-none transition focus:border-[#B59A68]"
        />
      </div>
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#8E887E]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-12 w-full rounded-xl border border-[#E0DDD6] bg-white px-4 text-sm text-[#555555] outline-none transition focus:border-[#B59A68]"
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

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#8E887E]">
        {label}
      </span>

      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        rows={5}
        className="mt-2 w-full resize-y rounded-xl border border-[#E0DDD6] bg-white px-4 py-3 text-sm leading-6 text-[#555555] outline-none transition placeholder:text-[#C2BDB4] focus:border-[#B59A68]"
      />
    </label>
  )
}

function BooleanCard({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer gap-4 rounded-2xl border border-[#E4E0D8] bg-[#FAF9F6] p-5">
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

        <span className="mt-1 block text-xs leading-5 text-[#999999]">
          {description}
        </span>
      </span>
    </label>
  )
}

function OpeningCard({
  opening,
  openingIndex,
}: {
  opening: Opening
  openingIndex: number
}) {
  const products = opening.products ?? []

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E4E0D8]">
      <div className="flex flex-col justify-between gap-3 bg-[#FAF9F6] px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-[#AAA39A]">
            Opening
          </p>

          <p className="mt-1 text-lg font-medium text-[#555555]">
            {opening.openingNumber ||
              String(openingIndex + 1).padStart(3, '0')}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-sm text-[#666666]">
            {opening.location || 'Location not entered'}
          </p>

          {opening.locationDetail && (
            <p className="mt-1 text-xs text-[#999999]">
              {opening.locationDetail}
            </p>
          )}
        </div>
      </div>

      <div className="divide-y divide-[#EEEAE3]">
        {products.length === 0 ? (
          <div className="px-5 py-5 text-sm text-[#999999]">
            No product details available.
          </div>
        ) : (
          products.map((product, productIndex) => (
            <div
              key={
                product.id ??
                `${openingIndex}-${productIndex}`
              }
              className="grid gap-4 px-5 py-5 md:grid-cols-[1.2fr_0.8fr]"
            >
              <div>
                <p className="font-medium text-[#555555]">
                  {product.productCategory ||
                    product.label ||
                    `Product ${productIndex + 1}`}
                </p>

                <p className="mt-1 text-sm text-[#999999]">
                  {[product.series, product.model]
                    .filter(Boolean)
                    .join(' · ') || 'Product configuration'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                {product.width && product.height && (
                  <ProductBadge
                    text={`${product.width}" × ${product.height}"`}
                  />
                )}

                <ProductBadge
                  text={
                    opening.impact
                      ? 'Impact'
                      : 'Non-impact'
                  }
                />

                {product.color && (
                  <ProductBadge text={product.color} />
                )}

                {product.tempered && (
                  <ProductBadge
                    text={
                      product.tempered === 'Yes'
                        ? 'Tempered'
                        : 'Not tempered'
                    }
                  />
                )}

                {product.grids && (
                  <ProductBadge
                    text={
                      product.grids === 'Yes'
                        ? product.gridPattern
                          ? `Grids ${product.gridPattern}`
                          : 'Grids'
                        : 'No grids'
                    }
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  )
}

function ProductBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full bg-[#F1EEE7] px-3 text-xs text-[#756E62]">
      {text}
    </span>
  )
}

function MoneySummary({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl bg-[#FAF9F6] px-5 py-4">
      <p className="text-xs uppercase tracking-[0.11em] text-[#AAA39A]">
        {label}
      </p>

      <p className="mt-2 text-xl font-medium text-[#555555]">
        {formatCurrency(value)}
      </p>
    </div>
  )
}

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-[#999999]">
        {label}
      </span>

      <span className="max-w-[180px] text-right text-sm font-medium text-[#555555]">
        {value}
      </span>
    </div>
  )
}