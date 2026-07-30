import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const contractHandoffStorageKey =
  'cronus_contract_handoff_v1'

const contractDraftStorageKey =
  'cronus_contract_draft_v1'

type FinancingOptionId =
  | 'cash'
  | '120-months'
  | 'deferred'
  | 'custom'

type ContractHandoff = {
  estimateNumber?: string
  contractNumber?: string
  customerName?: string
  selectedFinancingId?: FinancingOptionId
  downPayment?: number
  retailPrice?: number
  discountTotal?: number
  projectTotal?: number
}

type PaymentForm = {
  paymentMethod: FinancingOptionId
  downPayment: number
  financingCompany: string
  applicationNumber: string
  approvalNumber: string
  loanTermMonths: string
  interestRate: string
  deferredPeriodMonths: string
  paymentStatus: string
  depositMethod: string
  notes: string
}

const defaultPaymentForm: PaymentForm = {
  paymentMethod: 'cash',
  downPayment: 0,
  financingCompany: '',
  applicationNumber: '',
  approvalNumber: '',
  loanTermMonths: '',
  interestRate: '',
  deferredPeriodMonths: '',
  paymentStatus: 'Pending',
  depositMethod: '',
  notes: '',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function getPaymentMethodLabel(
  paymentMethod: FinancingOptionId,
) {
  switch (paymentMethod) {
    case '120-months':
      return '120-Month Financing'

    case 'deferred':
      return 'Deferred Financing'

    case 'custom':
      return 'Custom Financing'

    default:
      return 'Cash / Paid in Full'
  }
}

function toSafeNumber(value: unknown) {
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : 0
}

export default function ContractPayment() {
  const navigate = useNavigate()

  const [handoff, setHandoff] =
    useState<ContractHandoff | null>(null)

  const [paymentForm, setPaymentForm] =
    useState<PaymentForm>(defaultPaymentForm)

  const [saveStatus, setSaveStatus] = useState<
    'saved' | 'saving'
  >('saved')

  useEffect(() => {
    const storedHandoff = localStorage.getItem(
      contractHandoffStorageKey,
    )

    const storedDraft = localStorage.getItem(
      contractDraftStorageKey,
    )

    let parsedHandoff: ContractHandoff = {}
    let savedPayment: Partial<PaymentForm> = {}

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
          retailPrice:
            parsedDraft.products?.retailPrice ??
            parsedHandoff.retailPrice,
          discountTotal:
            parsedDraft.products?.discountTotal ??
            parsedHandoff.discountTotal,
          projectTotal:
            parsedDraft.products?.projectTotal ??
            parsedHandoff.projectTotal,
        }

        if (
          parsedDraft.payment &&
          typeof parsedDraft.payment === 'object'
        ) {
          savedPayment =
            parsedDraft.payment as Partial<PaymentForm>
        }
      } catch {
        localStorage.removeItem(
          contractDraftStorageKey,
        )
      }
    }

    const importedPaymentMethod =
      savedPayment.paymentMethod ??
      parsedHandoff.selectedFinancingId ??
      'cash'

    const importedDownPayment =
      savedPayment.downPayment ??
      parsedHandoff.downPayment ??
      0

    setHandoff(parsedHandoff)

    setPaymentForm({
      ...defaultPaymentForm,
      ...savedPayment,
      paymentMethod: importedPaymentMethod,
      downPayment: Math.round(
        toSafeNumber(importedDownPayment),
      ),
      loanTermMonths:
        savedPayment.loanTermMonths ??
        (importedPaymentMethod === '120-months'
          ? '120'
          : ''),
      deferredPeriodMonths:
        savedPayment.deferredPeriodMonths ??
        (importedPaymentMethod === 'deferred'
          ? '12'
          : ''),
    })
  }, [])

  useEffect(() => {
    setSaveStatus('saving')

    const timer = window.setTimeout(() => {
      savePaymentDraft(false)
      setSaveStatus('saved')
    }, 350)

    return () => window.clearTimeout(timer)
  }, [paymentForm, handoff])

  const projectTotal = Math.round(
    toSafeNumber(handoff?.projectTotal),
  )

  const safeDownPayment = Math.min(
    Math.max(
      0,
      Math.round(paymentForm.downPayment),
    ),
    projectTotal,
  )

  const financedBalance = Math.max(
    0,
    Math.round(
      projectTotal - safeDownPayment,
    ),
  )

  const estimatedMonthlyPayment = useMemo(() => {
    if (paymentForm.paymentMethod === 'cash') {
      return 0
    }

    const months = toSafeNumber(
      paymentForm.loanTermMonths,
    )

    const annualRate = toSafeNumber(
      paymentForm.interestRate,
    )

    if (financedBalance <= 0 || months <= 0) {
      return 0
    }

    const monthlyRate = annualRate / 100 / 12

    if (monthlyRate === 0) {
      return financedBalance / months
    }

    return (
      (financedBalance *
        monthlyRate *
        Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    )
  }, [
    financedBalance,
    paymentForm.interestRate,
    paymentForm.loanTermMonths,
    paymentForm.paymentMethod,
  ])

  function updatePaymentField<
    Field extends keyof PaymentForm,
  >(field: Field, value: PaymentForm[Field]) {
    setPaymentForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handlePaymentMethodChange(
    paymentMethod: FinancingOptionId,
  ) {
    setPaymentForm((current) => ({
      ...current,
      paymentMethod,
      loanTermMonths:
        paymentMethod === '120-months'
          ? '120'
          : paymentMethod === 'cash'
            ? ''
            : current.loanTermMonths,
      deferredPeriodMonths:
        paymentMethod === 'deferred'
          ? current.deferredPeriodMonths || '12'
          : '',
      financingCompany:
        paymentMethod === 'cash'
          ? ''
          : current.financingCompany,
      applicationNumber:
        paymentMethod === 'cash'
          ? ''
          : current.applicationNumber,
      approvalNumber:
        paymentMethod === 'cash'
          ? ''
          : current.approvalNumber,
      interestRate:
        paymentMethod === 'cash'
          ? ''
          : current.interestRate,
    }))
  }

  function savePaymentDraft(
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
      payment: {
        ...paymentForm,
        downPayment: Math.round(safeDownPayment),
        financedBalance: Math.round(financedBalance),
        estimatedMonthlyPayment: Math.round(
          estimatedMonthlyPayment,
        ),
        paymentMethodLabel:
          getPaymentMethodLabel(
            paymentForm.paymentMethod,
          ),
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
    savePaymentDraft()
    navigate('/portal/contracts/products')
  }

  function handleNext() {
    savePaymentDraft()
    navigate('/portal/contracts/schedule')
  }

  const financingSelected =
    paymentForm.paymentMethod !== 'cash'

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Contract Wizard
            </p>

            <h1 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              Payment
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#777777]">
              Confirm the payment method, deposit and
              financing information for this contract.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E4DD] bg-white px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#999999]">
              Step 4 of 8
            </p>

            <p className="mt-1 text-sm font-medium text-[#555555]">
              Payment
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
            label="Estimate"
            value={
              handoff?.estimateNumber ||
              'Not assigned'
            }
          />

          <SummaryCard
            label="Contract Total"
            value={formatCurrency(projectTotal)}
          />

          <SummaryCard
            label="Balance"
            value={formatCurrency(financedBalance)}
          />
        </div>

        <div className="grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-7">
            <section className="rounded-[28px] border border-[#E8E4DD] bg-white p-6 shadow-sm sm:p-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
                  Payment Method
                </p>

                <h2 className="mt-3 text-2xl font-light text-[#555555]">
                  Select payment option
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#888888]">
                  The option selected in the estimate has
                  been imported automatically.
                </p>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <PaymentOption
                  title="Cash / Paid in Full"
                  description="Customer will pay the project without financing."
                  checked={
                    paymentForm.paymentMethod ===
                    'cash'
                  }
                  onClick={() =>
                    handlePaymentMethodChange('cash')
                  }
                />

                <PaymentOption
                  title="120-Month Financing"
                  description="Standard financing plan with a 120-month term."
                  checked={
                    paymentForm.paymentMethod ===
                    '120-months'
                  }
                  onClick={() =>
                    handlePaymentMethodChange(
                      '120-months',
                    )
                  }
                />

                <PaymentOption
                  title="Deferred Financing"
                  description="Financing plan with a deferred payment period."
                  checked={
                    paymentForm.paymentMethod ===
                    'deferred'
                  }
                  onClick={() =>
                    handlePaymentMethodChange(
                      'deferred',
                    )
                  }
                />

                <PaymentOption
                  title="Custom Financing"
                  description="Enter a custom term, rate and financing provider."
                  checked={
                    paymentForm.paymentMethod ===
                    'custom'
                  }
                  onClick={() =>
                    handlePaymentMethodChange('custom')
                  }
                />
              </div>
            </section>

            <section className="rounded-[28px] border border-[#E8E4DD] bg-white p-6 shadow-sm sm:p-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
                  Deposit
                </p>

                <h2 className="mt-3 text-2xl font-light text-[#555555]">
                  Down payment information
                </h2>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <NumberField
                  label="Down payment"
                  value={paymentForm.downPayment}
                  prefix="$"
                  min={0}
                  max={projectTotal}
                  onChange={(value) =>
                    updatePaymentField(
                      'downPayment',
                      value,
                    )
                  }
                />

                <SelectField
                  label="Deposit method"
                  value={paymentForm.depositMethod}
                  onChange={(value) =>
                    updatePaymentField(
                      'depositMethod',
                      value,
                    )
                  }
                  options={[
                    {
                      value: '',
                      label: 'Select method',
                    },
                    {
                      value: 'Credit Card',
                      label: 'Credit Card',
                    },
                    {
                      value: 'ACH',
                      label: 'ACH / Bank Transfer',
                    },
                    {
                      value: 'Check',
                      label: 'Check',
                    },
                    {
                      value: 'Cash',
                      label: 'Cash',
                    },
                    {
                      value: 'Financing',
                      label: 'Financing',
                    },
                    {
                      value: 'Other',
                      label: 'Other',
                    },
                  ]}
                />

                <SelectField
                  label="Payment status"
                  value={paymentForm.paymentStatus}
                  onChange={(value) =>
                    updatePaymentField(
                      'paymentStatus',
                      value,
                    )
                  }
                  options={[
                    {
                      value: 'Pending',
                      label: 'Pending',
                    },
                    {
                      value: 'Application Submitted',
                      label:
                        'Application Submitted',
                    },
                    {
                      value: 'Approved',
                      label: 'Approved',
                    },
                    {
                      value: 'Deposit Collected',
                      label:
                        'Deposit Collected',
                    },
                    {
                      value: 'Paid in Full',
                      label: 'Paid in Full',
                    },
                  ]}
                />
              </div>
            </section>

            {financingSelected && (
              <section className="rounded-[28px] border border-[#E8E4DD] bg-white p-6 shadow-sm sm:p-8">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
                    Financing
                  </p>

                  <h2 className="mt-3 text-2xl font-light text-[#555555]">
                    Financing details
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#888888]">
                    Record the financing application and
                    approval information.
                  </p>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <TextField
                    label="Financing company"
                    value={
                      paymentForm.financingCompany
                    }
                    placeholder="GreenSky, Service Finance..."
                    onChange={(value) =>
                      updatePaymentField(
                        'financingCompany',
                        value,
                      )
                    }
                  />

                  <TextField
                    label="Application number"
                    value={
                      paymentForm.applicationNumber
                    }
                    placeholder="Application number"
                    onChange={(value) =>
                      updatePaymentField(
                        'applicationNumber',
                        value,
                      )
                    }
                  />

                  <TextField
                    label="Approval number"
                    value={
                      paymentForm.approvalNumber
                    }
                    placeholder="Approval number"
                    onChange={(value) =>
                      updatePaymentField(
                        'approvalNumber',
                        value,
                      )
                    }
                  />

                  <TextField
                    label="Loan term"
                    value={
                      paymentForm.loanTermMonths
                    }
                    placeholder="120"
                    suffix="months"
                    inputMode="numeric"
                    onChange={(value) =>
                      updatePaymentField(
                        'loanTermMonths',
                        value,
                      )
                    }
                  />

                  <TextField
                    label="Interest rate"
                    value={
                      paymentForm.interestRate
                    }
                    placeholder="0.00"
                    suffix="%"
                    inputMode="decimal"
                    onChange={(value) =>
                      updatePaymentField(
                        'interestRate',
                        value,
                      )
                    }
                  />

                  {paymentForm.paymentMethod ===
                    'deferred' && (
                      <TextField
                        label="Deferred period"
                        value={
                          paymentForm.deferredPeriodMonths
                        }
                        placeholder="12"
                        suffix="months"
                        inputMode="numeric"
                        onChange={(value) =>
                          updatePaymentField(
                            'deferredPeriodMonths',
                            value,
                          )
                        }
                      />
                    )}
                </div>
              </section>
            )}

            <section className="rounded-[28px] border border-[#E8E4DD] bg-white p-6 shadow-sm sm:p-8">
              <label
                htmlFor="payment-notes"
                className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]"
              >
                Payment Notes
              </label>

              <textarea
                id="payment-notes"
                rows={5}
                value={paymentForm.notes}
                onChange={(event) =>
                  updatePaymentField(
                    'notes',
                    event.target.value,
                  )
                }
                placeholder="Add payment instructions, financing conditions or approval notes..."
                className="mt-5 w-full resize-none rounded-2xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 py-4 text-sm leading-6 text-[#555555] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
              />
            </section>
          </div>

          <aside className="h-fit rounded-[28px] border border-[#E8E4DD] bg-white p-6 shadow-sm sm:p-8 xl:sticky xl:top-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
              Payment Summary
            </p>

            <h2 className="mt-3 text-2xl font-light text-[#555555]">
              Contract balance
            </h2>

            <div className="mt-8 space-y-5">
              <PriceLine
                label="Contract total"
                value={formatCurrency(projectTotal)}
              />

              <PriceLine
                label="Down payment"
                value={`-${formatCurrency(
                  safeDownPayment,
                )}`}
                muted
              />

              <div className="border-t border-[#DDD8CF] pt-5">
                <PriceLine
                  label={
                    financingSelected
                      ? 'Amount financed'
                      : 'Remaining balance'
                  }
                  value={formatCurrency(
                    financedBalance,
                  )}
                  emphasized
                />
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-[#1C2D36] p-6 text-white">
              <p className="text-xs uppercase tracking-[0.16em] text-white/60">
                Payment Method
              </p>

              <p className="mt-3 text-xl font-medium">
                {getPaymentMethodLabel(
                  paymentForm.paymentMethod,
                )}
              </p>

              {financingSelected ? (
                <>
                  <p className="mt-5 text-xs uppercase tracking-[0.14em] text-white/55">
                    Estimated Monthly Payment
                  </p>

                  <p className="mt-2 text-4xl font-light">
                    {formatCurrency(
                      estimatedMonthlyPayment,
                    )}
                  </p>

                  <p className="mt-3 text-xs leading-5 text-white/55">
                    Estimate based on the entered
                    balance, rate and loan term.
                  </p>
                </>
              ) : (
                <p className="mt-4 text-sm leading-6 text-white/65">
                  The remaining project balance will be
                  collected directly from the customer.
                </p>
              )}
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

function PaymentOption({
  title,
  description,
  checked,
  onClick,
}: {
  title: string
  description: string
  checked: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${checked
        ? 'border-[#B59A68] bg-[#F8F3E9]'
        : 'border-[#E8E4DD] bg-white hover:border-[#CFC8BA] hover:bg-[#FCFBF9]'
        }`}
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="font-medium text-[#555555]">
            {title}
          </p>

          <p className="mt-2 text-sm leading-6 text-[#888888]">
            {description}
          </p>
        </div>

        <span
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${checked
            ? 'border-[#B59A68] bg-[#B59A68]'
            : 'border-[#D6D1C7] bg-white'
            }`}
        >
          {checked && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              className="h-3.5 w-3.5 text-white"
              aria-hidden="true"
            >
              <path d="m6 12 4 4 8-8" />
            </svg>
          )}
        </span>
      </div>
    </button>
  )
}

function TextField({
  label,
  value,
  placeholder,
  suffix,
  inputMode,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  suffix?: string
  inputMode?: 'text' | 'numeric' | 'decimal'
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
          className={`h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white ${suffix ? 'pr-20' : ''
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

function NumberField({
  label,
  value,
  prefix,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  prefix?: string
  min?: number
  max?: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <label className="text-sm font-medium text-[#666666]">
        {label}
      </label>

      <div className="relative mt-2">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-[#999999]">
            {prefix}
          </span>
        )}

        <input
          type="number"
          min={min}
          max={max}
          value={Math.round(value)}
          onChange={(event) =>
            onChange(
              Math.round(
                Math.max(
                  min ?? 0,
                  Math.min(
                    max ?? Number.MAX_SAFE_INTEGER,
                    toSafeNumber(event.target.value),
                  ),
                ),
              ),
            )
          }
          className={`h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white ${prefix ? 'pl-8' : ''
            }`}
        />
      </div>
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

function PriceLine({
  label,
  value,
  muted = false,
  emphasized = false,
}: {
  label: string
  value: string
  muted?: boolean
  emphasized?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <p
        className={
          emphasized
            ? 'text-base font-medium text-[#444444]'
            : 'text-sm text-[#777777]'
        }
      >
        {label}
      </p>

      <p
        className={
          emphasized
            ? 'text-2xl font-medium text-[#333333]'
            : muted
              ? 'text-sm font-medium text-[#9A8258]'
              : 'text-sm font-medium text-[#555555]'
        }
      >
        {value}
      </p>
    </div>
  )
}