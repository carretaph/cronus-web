import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import SignaturePad from '../components/contracts/SignaturePad'

type ContractReview = {
  estimateNumber?: string
  contractNumber?: string

  buyerName?: string
  coBuyerName?: string
  buyerEmail?: string
  buyerPhone?: string

  salesperson?: string

  projectAddress?: string
  city?: string
  state?: string
  zipCode?: string

  projectTotal: number

  paymentMethod?: string

  contractStatus?: string
}

type SignedContract = ContractReview & {
  buyerSignature: string
  coBuyerSignature: string
  salesSignature: string
  buyerAcceptedTerms: boolean
  buyerAuthorizedProject: boolean
  buyerAcceptedCancellationTerms: boolean
  signedAt: string
  contractStatus: 'Signed'
}

const contractReviewStorageKey =
  'cronus_contract_review_v1'

const contractsStorageKey =
  'cronus_contracts_v1'

function loadContractReview(): ContractReview | null {
  try {
    const storedContract = localStorage.getItem(
      contractReviewStorageKey,
    )

    return storedContract
      ? (JSON.parse(storedContract) as ContractReview)
      : null
  } catch {
    return null
  }
}

function loadContracts(): SignedContract[] {
  try {
    const storedContracts = localStorage.getItem(
      contractsStorageKey,
    )

    return storedContracts
      ? (JSON.parse(storedContracts) as SignedContract[])
      : []
  } catch {
    return []
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0)
}

export default function ContractSignatures() {
  const navigate = useNavigate()

  const contract = useMemo(
    () => loadContractReview(),
    [],
  )

  const [buyerSignature, setBuyerSignature] =
    useState('')

  const [coBuyerSignature, setCoBuyerSignature] =
    useState('')

  const [salesSignature, setSalesSignature] =
    useState('')

  const [buyerAcceptedTerms, setBuyerAcceptedTerms] =
    useState(false)

  const [
    buyerAuthorizedProject,
    setBuyerAuthorizedProject,
  ] = useState(false)

  const [
    buyerAcceptedCancellationTerms,
    setBuyerAcceptedCancellationTerms,
  ] = useState(false)

  if (!contract) {
    return (
      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl rounded-[24px] border border-[#E8E5DE] bg-white p-8 text-center">
          <h1 className="text-3xl font-light text-[#444444]">
            No contract review found
          </h1>

          <p className="mt-4 text-[#999999]">
            Review the contract before collecting
            signatures.
          </p>

          <Link
            to="/portal/contracts/new"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-xl bg-[#222222] px-6 text-sm font-medium text-white"
          >
            Return to contract review
          </Link>
        </div>
      </section>
    )
  }

  function completeContract() {
    if (!buyerSignature) {
      window.alert('Buyer signature is required.')
      return
    }

    if (!salesSignature) {
      window.alert(
        'Sales representative signature is required.',
      )
      return
    }

    if (!buyerAcceptedTerms) {
      window.alert(
        'The buyer must confirm that the contract was reviewed.',
      )
      return
    }

    if (!buyerAuthorizedProject) {
      window.alert(
        'The buyer must authorize the project.',
      )
      return
    }

    if (!buyerAcceptedCancellationTerms) {
      window.alert(
        'The buyer must accept the cancellation and financing terms.',
      )
      return
    }

    const signedContract: SignedContract = {
  ...contract!,
      buyerSignature,
      coBuyerSignature,
      salesSignature,
      buyerAcceptedTerms,
      buyerAuthorizedProject,
      buyerAcceptedCancellationTerms,
      signedAt: new Date().toISOString(),
      contractStatus: 'Signed',
    }

    const existingContracts = loadContracts()

    const contractIndex = existingContracts.findIndex(
      (savedContract) =>
        savedContract.contractNumber ===
        signedContract.contractNumber,
    )

    const updatedContracts = [...existingContracts]

    if (contractIndex >= 0) {
      updatedContracts[contractIndex] =
        signedContract
    } else {
      updatedContracts.unshift(signedContract)
    }

    localStorage.setItem(
      contractsStorageKey,
      JSON.stringify(updatedContracts),
    )

    localStorage.setItem(
      contractReviewStorageKey,
      JSON.stringify(signedContract),
    )

    window.alert('Contract completed successfully.')

    navigate('/portal/contracts')
  }

  return (
    <section className="px-5 py-9 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Customer Signatures
            </p>

            <h1 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              Complete the contract.
            </h1>

            <p className="mt-4 text-base text-[#888888]">
              Contract{' '}
              {contract.contractNumber ??
                contract.estimateNumber ??
                '—'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E5DE] bg-white px-5 py-4">
            <p className="text-xs uppercase tracking-[0.13em] text-[#AAA39A]">
              Contract total
            </p>

            <p className="mt-1 text-xl font-medium text-[#555555]">
              {formatCurrency(contract.projectTotal)}
            </p>
          </div>
        </div>

        <div className="mt-9 grid gap-7 xl:grid-cols-[1fr_340px]">
          <main className="space-y-6">
            <SignaturePad
              label="Buyer Signature"
              description={`Signature of ${contract.buyerName || 'the buyer'}.`}
              required
              value={buyerSignature}
              onChange={setBuyerSignature}
            />

            {contract.coBuyerName && (
              <SignaturePad
                label="Co-Buyer Signature"
                description={`Signature of ${contract.coBuyerName}.`}
                value={coBuyerSignature}
                onChange={setCoBuyerSignature}
              />
            )}

            <SignaturePad
              label="Sales Representative Signature"
              description={`Signature of ${contract.salesperson || 'the sales representative'}.`}
              required
              value={salesSignature}
              onChange={setSalesSignature}
            />

            <section className="rounded-[24px] border border-[#E8E5DE] bg-white p-6">
              <h2 className="text-2xl font-light text-[#444444]">
                Customer authorization
              </h2>

              <div className="mt-6 space-y-4">
                <AuthorizationCheckbox
                  checked={buyerAcceptedTerms}
                  onChange={setBuyerAcceptedTerms}
                  text="I confirm that I have reviewed the contract, product specifications and pricing."
                />

                <AuthorizationCheckbox
                  checked={buyerAuthorizedProject}
                  onChange={setBuyerAuthorizedProject}
                  text="I authorize Cronus Windows & Doors to proceed with measurements, permits, ordering and production."
                />

                <AuthorizationCheckbox
                  checked={
                    buyerAcceptedCancellationTerms
                  }
                  onChange={
                    setBuyerAcceptedCancellationTerms
                  }
                  text="I understand the cancellation rights, payment obligations and financing terms."
                />
              </div>
            </section>
          </main>

          <aside className="xl:sticky xl:top-8 xl:self-start">
            <div className="rounded-[26px] border border-[#E8E5DE] bg-[#FAF9F6] p-7">
              <p className="text-xs uppercase tracking-[0.14em] text-[#9A8258]">
                Contract summary
              </p>

              <div className="mt-6 space-y-4">
                <SummaryRow
                  label="Buyer"
                  value={contract.buyerName || '—'}
                />

                <SummaryRow
                  label="Co-buyer"
                  value={contract.coBuyerName || '—'}
                />

                <SummaryRow
                  label="Sales representative"
                  value={contract.salesperson || '—'}
                />

                <SummaryRow
                  label="Payment method"
                  value={contract.paymentMethod || '—'}
                />

                <SummaryRow
                  label="Status"
                  value="Awaiting signatures"
                />
              </div>

              <button
                type="button"
                onClick={completeContract}
                className="mt-7 inline-flex min-h-16 w-full items-center justify-between rounded-xl bg-[#222222] px-6 py-4 text-left text-white transition hover:bg-[#B59A68]"
              >
                <span>
                  <span className="block text-sm font-medium uppercase tracking-[0.13em]">
                    Complete contract
                  </span>

                  <span className="mt-1 block text-xs text-white/70">
                    Save signed contract
                  </span>
                </span>

                <span className="text-2xl font-light">
                  →
                </span>
              </button>

              <Link
                to="/portal/contracts/new"
                className="mt-4 inline-flex h-11 w-full items-center justify-center text-sm text-[#999999] transition hover:text-[#555555]"
              >
                Back to contract review
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function AuthorizationCheckbox({
  checked,
  onChange,
  text,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  text: string
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

      <span className="text-sm leading-6 text-[#666666]">
        {text}
      </span>
    </label>
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