import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { getContracts } from '../services/contractsApi'
import type { ApiContract } from '../services/contractsApi'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  getAuthenticatedUser,
} from '../auth/auth'

const legacyContractsStorageKey =
  'cronus_contracts_v1'

const completedContractsStorageKey =
  'cronus_completed_contracts_v1'

const activeCompletedContractStorageKey =
  'cronus_active_completed_contract_v1'

const contractDraftStorageKey =
  'cronus_contract_draft_v1'

const contractHandoffStorageKey =
  'cronus_contract_handoff_v1'

type ContractStatus =
  | 'Draft'
  | 'Executed'
  | 'Pending Production'
  | 'In Production'
  | 'Installed'
  | 'Closed'
  | string

type ContractRecord = {
  id?: string
  contractNumber: string
  estimateNumber: string
  customerName: string
  customerEmail?: string
  projectTotal: number
  contractStatus?: ContractStatus
  status?: ContractStatus
  workflowStatus?: ContractStatus
  createdAt?: string
  updatedAt?: string
  completedAt?: string
  executedAt?: string
  source?: string

  ownerUserId?: string | null
  ownerName?: string | null
  ownerManagerId?: string | null
  ownerManagerName?: string | null

  customer?: Record<string, unknown>
  customerForm?: Record<string, unknown>
  products?: Record<string, unknown>
  payment?: Record<string, unknown>
  signatures?: Record<string, unknown>

  [key: string]: unknown
}

function apiContractToRecord(
  contract: ApiContract,
): ContractRecord {
  let parsed: Record<string, unknown> = {}

  try {
    parsed = JSON.parse(contract.contractJson || '{}')
  } catch {
    parsed = {}
  }

  return {
    ...parsed,
    id: contract.id,
    contractNumber: contract.contractNumber,
    estimateNumber: contract.estimateNumber,
    customerName: contract.customerName,
    customerEmail: contract.customerEmail,
    projectTotal: contract.projectTotal,
    status: contract.status,
    workflowStatus: contract.workflowStatus,
    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
    completedAt: contract.completedAt,
    executedAt: contract.executedAt,
    source: contract.source,

    ownerUserId:
      contract.ownerUserId ?? null,

    ownerName:
      contract.ownerName ?? null,

    ownerManagerId:
      contract.ownerManagerId ?? null,

    ownerManagerName:
      contract.ownerManagerName ?? null,
  }
}

type StatusFilter =
  | 'All'
  | 'Draft'
  | 'Executed'
  | 'Production'
  | 'Installed'

type SortOption =
  | 'newest'
  | 'oldest'
  | 'customer'
  | 'total-high'
  | 'total-low'

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

function safeObject(
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

function readArrayFromStorage(
  storageKey: string,
): ContractRecord[] {
  try {
    const storedValue =
      localStorage.getItem(storageKey)

    if (!storedValue) {
      return []
    }

    const parsed = JSON.parse(storedValue)

    return Array.isArray(parsed)
      ? (parsed as ContractRecord[])
      : []
  } catch {
    return []
  }
}

function firstAvailableString(
  ...values: unknown[]
) {
  for (const value of values) {
    const stringValue = safeString(value)

    if (stringValue) {
      return stringValue
    }
  }

  return ''
}

function getCustomerName(
  contract: ContractRecord,
) {
  const customer = {
    ...safeObject(contract.customer),
    ...safeObject(contract.customerForm),
  }

  const combinedName = [
    safeString(customer.firstName),
    safeString(customer.lastName),
  ]
    .filter(Boolean)
    .join(' ')

  return firstAvailableString(
    customer.fullName,
    combinedName,
    contract.customerName,
  )
}

function getCustomerEmail(
  contract: ContractRecord,
) {
  const customer = {
    ...safeObject(contract.customer),
    ...safeObject(contract.customerForm),
  }

  return firstAvailableString(
    customer.email,
    contract.customerEmail,
  )
}

function getProjectTotal(
  contract: ContractRecord,
) {
  const products =
    safeObject(contract.products)

  const payment =
    safeObject(contract.payment)

  const possibleValues = [
    contract.projectTotal,
    products.projectTotal,
    products.contractTotal,
    products.total,
    payment.projectTotal,
    payment.contractTotal,
    payment.total,
  ]

  for (const value of possibleValues) {
    const parsedValue = safeNumber(value)

    if (parsedValue > 0) {
      return parsedValue
    }
  }

  return 0
}

function getContractStatus(
  contract: ContractRecord,
): ContractStatus {
  const directStatus =
    firstAvailableString(
      contract.status,
      contract.contractStatus,
    )

  const workflowStatus =
    safeString(contract.workflowStatus)

  if (
    directStatus.toLowerCase() ===
      'executed' &&
    workflowStatus
  ) {
    return workflowStatus
  }

  if (directStatus) {
    return directStatus
  }

  if (workflowStatus) {
    return workflowStatus
  }

  return 'Draft'
}

function getContractDate(
  contract: ContractRecord,
) {
  return firstAvailableString(
    contract.completedAt,
    contract.executedAt,
    contract.updatedAt,
    contract.createdAt,
  )
}

function getContractTimestamp(
  contract: ContractRecord,
) {
  const dateValue =
    getContractDate(contract)

  if (!dateValue) {
    return 0
  }

  const timestamp =
    new Date(dateValue).getTime()

  return Number.isNaN(timestamp)
    ? 0
    : timestamp
}

function normalizeContract(
  contract: ContractRecord,
): ContractRecord {
  return {
    ...contract,

    contractNumber:
      firstAvailableString(
        contract.contractNumber,
      ) || 'Unassigned',

    estimateNumber:
      firstAvailableString(
        contract.estimateNumber,
      ) || 'Not specified',

    customerName:
      getCustomerName(contract) ||
      'Not specified',

    customerEmail:
      getCustomerEmail(contract),

    projectTotal:
      getProjectTotal(contract),

    contractStatus:
      getContractStatus(contract),
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: unknown) {
  const stringValue = safeString(value)

  if (!stringValue) {
    return 'No date'
  }

  const date = new Date(stringValue)

  if (Number.isNaN(date.getTime())) {
    return stringValue
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(date)
}

function isExecutedStatus(
  status: ContractStatus,
) {
  const normalized =
    status.toLowerCase()

  return (
    normalized === 'executed' ||
    normalized.includes('production') ||
    normalized === 'installed' ||
    normalized === 'closed'
  )
}

function matchesStatusFilter(
  status: ContractStatus,
  filter: StatusFilter,
) {
  const normalized =
    status.toLowerCase()

  if (filter === 'All') {
    return true
  }

  if (filter === 'Draft') {
    return normalized === 'draft'
  }

  if (filter === 'Executed') {
    return normalized === 'executed'
  }

  if (filter === 'Production') {
    return normalized.includes(
      'production',
    )
  }

  if (filter === 'Installed') {
    return normalized === 'installed'
  }

  return true
}

function getStatusClasses(
  status: ContractStatus,
) {
  const normalized =
    status.toLowerCase()

  if (
    normalized === 'executed' ||
    normalized === 'closed'
  ) {
    return 'border-[#CBE0D2] bg-[#EAF4EE] text-[#4F755E]'
  }

  if (
    normalized.includes('production')
  ) {
    return 'border-[#CADBE8] bg-[#EDF4F8] text-[#4F7087]'
  }

  if (normalized === 'installed') {
    return 'border-[#D9CDE6] bg-[#F3EEF8] text-[#705A88]'
  }

  return 'border-[#E8D8B8] bg-[#FBF5E8] text-[#8A7245]'
}

function uniqueContracts(
  contracts: ContractRecord[],
) {
  const contractMap =
    new Map<string, ContractRecord>()

  contracts.forEach((contract, index) => {
    const normalized =
      normalizeContract(contract)

    const key =
      normalized.contractNumber &&
      normalized.contractNumber !==
        'Unassigned'
        ? normalized.contractNumber
        : normalized.id ||
          `${normalized.estimateNumber}-${normalized.customerName}-${index}`

    const existing =
      contractMap.get(key)

    if (!existing) {
      contractMap.set(key, normalized)
      return
    }

    const existingExecuted =
      isExecutedStatus(
        getContractStatus(existing),
      )

    const currentExecuted =
      isExecutedStatus(
        getContractStatus(normalized),
      )

    if (
      currentExecuted &&
      !existingExecuted
    ) {
      contractMap.set(key, normalized)
      return
    }

    if (
      getContractTimestamp(normalized) >
      getContractTimestamp(existing)
    ) {
      contractMap.set(key, normalized)
    }
  })

  return Array.from(
    contractMap.values(),
  )
}

export default function Contracts() {
  const user = getAuthenticatedUser()

  const showOwnership =
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER'

  const [apiContracts, setApiContracts] =
    useState<ContractRecord[]>([])

  useEffect(() => {
    async function loadApiContracts() {
      try {
        const contracts = await getContracts()
        setApiContracts(
          contracts.map(apiContractToRecord),
        )
      } catch (error) {
        console.error(
          'Unable to load contracts:',
          error,
        )
      }
    }

    void loadApiContracts()
  }, [])
  const navigate = useNavigate()

  const [contracts, setContracts] =
    useState<ContractRecord[]>([])

  const [searchTerm, setSearchTerm] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('All')

  const [sortOption, setSortOption] =
    useState<SortOption>('newest')

  const [
    selectedContractNumber,
    setSelectedContractNumber,
  ] = useState<string | null>(null)

  useEffect(() => {
    loadContracts()
  }, [apiContracts])

  function loadContracts() {
    const legacyContracts =
      readArrayFromStorage(
        legacyContractsStorageKey,
      )

    const completedContracts =
      readArrayFromStorage(
        completedContractsStorageKey,
      )

    const mergedContracts =
      uniqueContracts([
        ...apiContracts,
        ...completedContracts,
        ...legacyContracts,
      ])

    setContracts(mergedContracts)
  }

  const filteredContracts =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase()

      const filtered = contracts.filter(
        (contract) => {
          const status =
            getContractStatus(contract)

          const matchesFilter =
            matchesStatusFilter(
              status,
              statusFilter,
            )

          if (!matchesFilter) {
            return false
          }

          if (!normalizedSearch) {
            return true
          }

          const searchableText = [
            contract.contractNumber,
            contract.estimateNumber,
            contract.customerName,
            contract.customerEmail,
            status,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return searchableText.includes(
            normalizedSearch,
          )
        },
      )

      return [...filtered].sort(
        (firstContract, secondContract) => {
          if (
            sortOption === 'customer'
          ) {
            return firstContract.customerName.localeCompare(
              secondContract.customerName,
            )
          }

          if (
            sortOption === 'total-high'
          ) {
            return (
              secondContract.projectTotal -
              firstContract.projectTotal
            )
          }

          if (
            sortOption === 'total-low'
          ) {
            return (
              firstContract.projectTotal -
              secondContract.projectTotal
            )
          }

          const firstTimestamp =
            getContractTimestamp(
              firstContract,
            )

          const secondTimestamp =
            getContractTimestamp(
              secondContract,
            )

          if (
            sortOption === 'oldest'
          ) {
            return (
              firstTimestamp -
              secondTimestamp
            )
          }

          return (
            secondTimestamp -
            firstTimestamp
          )
        },
      )
    }, [
      contracts,
      searchTerm,
      statusFilter,
      sortOption,
    ])

  const contractMetrics = useMemo(() => {
    const totalValue = contracts.reduce(
      (sum, contract) =>
        sum + contract.projectTotal,
      0,
    )

    const drafts = contracts.filter(
      (contract) =>
        getContractStatus(
          contract,
        ).toLowerCase() === 'draft',
    ).length

    const executed = contracts.filter(
      (contract) =>
        isExecutedStatus(
          getContractStatus(contract),
        ),
    ).length

    return {
      totalContracts: contracts.length,
      totalValue,
      drafts,
      executed,
    }
  }, [contracts])

  function openContract(
    contract: ContractRecord,
  ) {
    const status =
      getContractStatus(contract)

    const executed =
      isExecutedStatus(status)

    localStorage.setItem(
      contractDraftStorageKey,
      JSON.stringify(contract),
    )

    localStorage.setItem(
      contractHandoffStorageKey,
      JSON.stringify({
        contractNumber:
          contract.contractNumber,

        estimateNumber:
          contract.estimateNumber,

        customerName:
          contract.customerName,

        customerEmail:
          contract.customerEmail,

        projectTotal:
          contract.projectTotal,
      }),
    )

    if (executed) {
      localStorage.setItem(
        activeCompletedContractStorageKey,
        JSON.stringify(contract),
      )

      navigate(
        '/portal/contracts/complete',
      )

      return
    }

    localStorage.removeItem(
      activeCompletedContractStorageKey,
    )

    navigate('/portal/contracts/new')
  }

  function duplicateContract(
    contract: ContractRecord,
  ) {
    const duplicatedContract = {
      ...contract,

      id: undefined,

      contractNumber: '',

      contractStatus: 'Draft',

      status: 'Draft',

      workflowStatus: '',

      completedAt: undefined,

      executedAt: undefined,

      updatedAt:
        new Date().toISOString(),

      signatures: undefined,
    }

    localStorage.setItem(
      contractDraftStorageKey,
      JSON.stringify(
        duplicatedContract,
      ),
    )

    localStorage.setItem(
      contractHandoffStorageKey,
      JSON.stringify({
        estimateNumber:
          contract.estimateNumber,

        customerName:
          contract.customerName,

        customerEmail:
          contract.customerEmail,

        projectTotal:
          contract.projectTotal,
      }),
    )

    localStorage.removeItem(
      activeCompletedContractStorageKey,
    )

    navigate('/portal/contracts/new')
  }

  function deleteContract(
    contract: ContractRecord,
  ) {
    const confirmed = window.confirm(
      `Delete contract ${contract.contractNumber}? This action cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    const updatedLegacyContracts =
      readArrayFromStorage(
        legacyContractsStorageKey,
      ).filter(
        (storedContract) =>
          storedContract.contractNumber !==
          contract.contractNumber,
      )

    const updatedCompletedContracts =
      readArrayFromStorage(
        completedContractsStorageKey,
      ).filter(
        (storedContract) =>
          storedContract.contractNumber !==
          contract.contractNumber,
      )

    localStorage.setItem(
      legacyContractsStorageKey,
      JSON.stringify(
        updatedLegacyContracts,
      ),
    )

    localStorage.setItem(
      completedContractsStorageKey,
      JSON.stringify(
        updatedCompletedContracts,
      ),
    )

    const activeContractValue =
      localStorage.getItem(
        activeCompletedContractStorageKey,
      )

    if (activeContractValue) {
      try {
        const activeContract =
          JSON.parse(
            activeContractValue,
          ) as ContractRecord

        if (
          activeContract.contractNumber ===
          contract.contractNumber
        ) {
          localStorage.removeItem(
            activeCompletedContractStorageKey,
          )
        }
      } catch {
        localStorage.removeItem(
          activeCompletedContractStorageKey,
        )
      }
    }

    setSelectedContractNumber(null)
    loadContracts()
  }

  return (
    <section className="overflow-x-hidden px-5 py-10 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto w-full max-w-[1450px]">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Sales
            </p>

            <h1 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              Contracts
            </h1>

            <p className="mt-4 text-[#888888]">
              Manage drafts, executed
              agreements and production
              contracts.
            </p>
          </div>

          <Link
            to="/portal/contracts/new"
            className="w-fit rounded-xl bg-[#222222] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#B59A68]"
          >
            New Contract
          </Link>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Contracts"
            value={String(
              contractMetrics.totalContracts,
            )}
          />

          <MetricCard
            label="Executed"
            value={String(
              contractMetrics.executed,
            )}
          />

          <MetricCard
            label="Drafts"
            value={String(
              contractMetrics.drafts,
            )}
          />

          <MetricCard
            label="Contract Value"
            value={formatCurrency(
              contractMetrics.totalValue,
            )}
          />
        </div>

        <div className="mt-8 rounded-3xl border border-[#E8E5DE] bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-[520px]">
              <input
                type="search"
                value={searchTerm}
                placeholder="Search contract, estimate or customer..."
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value,
                  )
                }
                className="h-12 w-full rounded-xl border border-[#DDD8D0] bg-[#FAF9F7] px-4 text-sm text-[#555555] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as StatusFilter,
                  )
                }
                className="h-12 rounded-xl border border-[#DDD8D0] bg-white px-4 text-sm text-[#555555] outline-none focus:border-[#B59A68]"
              >
                <option value="All">
                  All statuses
                </option>

                <option value="Draft">
                  Draft
                </option>

                <option value="Executed">
                  Executed
                </option>

                <option value="Production">
                  Production
                </option>

                <option value="Installed">
                  Installed
                </option>
              </select>

              <select
                value={sortOption}
                onChange={(event) =>
                  setSortOption(
                    event.target
                      .value as SortOption,
                  )
                }
                className="h-12 rounded-xl border border-[#DDD8D0] bg-white px-4 text-sm text-[#555555] outline-none focus:border-[#B59A68]"
              >
                <option value="newest">
                  Newest first
                </option>

                <option value="oldest">
                  Oldest first
                </option>

                <option value="customer">
                  Customer name
                </option>

                <option value="total-high">
                  Total: high to low
                </option>

                <option value="total-low">
                  Total: low to high
                </option>
              </select>
            </div>
          </div>
        </div>

        {contracts.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#E8E5DE] bg-white p-12 text-center sm:p-20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F0E7] text-xl text-[#9A8255]">
              C
            </div>

            <h2 className="mt-6 text-2xl font-light text-[#555555]">
              No contracts yet
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#999999]">
              Select Order Now from an estimate
              or create a new contract to begin
              the contract wizard.
            </p>

            <Link
              to="/portal/contracts/new"
              className="mt-7 inline-flex rounded-xl bg-[#222222] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#B59A68]"
            >
              Create Contract
            </Link>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#E8E5DE] bg-white p-14 text-center">
            <h2 className="text-xl font-light text-[#555555]">
              No matching contracts
            </h2>

            <p className="mt-3 text-sm text-[#999999]">
              Change the search term or status
              filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('All')
              }}
              className="mt-6 rounded-xl border border-[#D9D4CB] bg-white px-5 py-3 text-sm font-medium text-[#555555] transition hover:border-[#B59A68]"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 hidden overflow-visible rounded-3xl border border-[#E8E5DE] bg-white lg:block">
              <table className="w-full table-fixed">
                <thead className="bg-[#F8F8F8]">
                  <tr>
                    <th className="w-[9%] px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.1em] text-[#888888]">
                      Contract
                    </th>

                    <th className="w-[16%] px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.1em] text-[#888888]">
                      Estimate
                    </th>

                    <th className="w-[19%] px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.1em] text-[#888888]">
                      Customer
                    </th>

                    {showOwnership && (
                      <th className="w-[16%] px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.1em] text-[#888888]">
                        Owner
                      </th>
                    )}

                    <th className="w-[12%] px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.1em] text-[#888888]">
                      Date
                    </th>

                    <th className="w-[13%] px-6 py-4 text-right text-xs font-medium uppercase tracking-[0.1em] text-[#888888]">
                      Total
                    </th>

                    <th className="w-[11%] px-6 py-4 text-center text-xs font-medium uppercase tracking-[0.1em] text-[#888888]">
                      Status
                    </th>

                    <th className="w-[4%] px-4 py-4">
                      <span className="sr-only">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredContracts.map(
                    (contract) => {
                      const status =
                        getContractStatus(
                          contract,
                        )

                      const isMenuOpen =
                        selectedContractNumber ===
                        contract.contractNumber

                      return (
                        <tr
                          key={`${contract.contractNumber}-${contract.estimateNumber}`}
                          onClick={() =>
                            openContract(
                              contract,
                            )
                          }
                          className="cursor-pointer border-t border-[#ECECEC] transition hover:bg-[#FCFAF6]"
                        >
                          <td className="px-6 py-5">
                            <p className="truncate text-sm font-medium text-[#444444]">
                              {
                                contract.contractNumber
                              }
                            </p>

                            <p className="mt-1 text-xs text-[#999999]">
                              {isExecutedStatus(
                                status,
                              )
                                ? 'Open contract'
                                : 'Resume draft'}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <p className="truncate text-sm text-[#666666]">
                              {
                                contract.estimateNumber
                              }
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <p className="truncate text-sm font-medium text-[#555555]">
                              {
                                contract.customerName
                              }
                            </p>

                            {contract.customerEmail && (
                              <p className="mt-1 truncate text-xs text-[#999999]">
                                {
                                  contract.customerEmail
                                }
                              </p>
                            )}
                          </td>

                          {showOwnership && (
                            <td className="px-6 py-5">
                              <p className="truncate text-sm font-medium text-[#555555]">
                                {contract.ownerName ||
                                  'Unassigned'}
                              </p>

                              <p className="mt-1 truncate text-xs text-[#999999]">
                                Manager:{' '}
                                {contract.ownerManagerName ||
                                  '—'}
                              </p>
                            </td>
                          )}

                          <td className="px-6 py-5 text-sm text-[#777777]">
                            {formatDate(
                              getContractDate(
                                contract,
                              ),
                            )}
                          </td>

                          <td className="px-6 py-5 text-right text-sm font-medium text-[#555555]">
                            {formatCurrency(
                              contract.projectTotal,
                            )}
                          </td>

                          <td className="px-6 py-5 text-center">
                            <StatusBadge
                              status={status}
                            />
                          </td>

                          <td className="relative px-4 py-5 text-right">
                            <button
                              type="button"
                              aria-label="Contract actions"
                              onClick={(
                                event,
                              ) => {
                                event.stopPropagation()

                                setSelectedContractNumber(
                                  isMenuOpen
                                    ? null
                                    : contract.contractNumber,
                                )
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-[#777777] transition hover:bg-[#F1EEE8]"
                            >
                              ⋯
                            </button>

                            {isMenuOpen && (
                              <div
                                onClick={(
                                  event,
                                ) =>
                                  event.stopPropagation()
                                }
                                className="absolute right-4 top-14 z-30 w-48 overflow-hidden rounded-xl border border-[#E5E0D8] bg-white py-2 text-left shadow-xl"
                              >
                                <MenuButton
                                  label={
                                    isExecutedStatus(
                                      status,
                                    )
                                      ? 'View Contract'
                                      : 'Resume Draft'
                                  }
                                  onClick={() =>
                                    openContract(
                                      contract,
                                    )
                                  }
                                />

                                <MenuButton
                                  label="Duplicate"
                                  onClick={() =>
                                    duplicateContract(
                                      contract,
                                    )
                                  }
                                />

                                <MenuButton
                                  label="Delete"
                                  danger
                                  onClick={() =>
                                    deleteContract(
                                      contract,
                                    )
                                  }
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    },
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 space-y-4 lg:hidden">
              {filteredContracts.map(
                (contract) => {
                  const status =
                    getContractStatus(
                      contract,
                    )

                  return (
                    <article
                      key={`${contract.contractNumber}-${contract.estimateNumber}`}
                      className="rounded-3xl border border-[#E8E5DE] bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#999999]">
                            Contract
                          </p>

                          <h2 className="mt-2 truncate text-lg font-medium text-[#555555]">
                            {
                              contract.contractNumber
                            }
                          </h2>
                        </div>

                        <StatusBadge
                          status={status}
                        />
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <MobileDetail
                          label="Customer"
                          value={
                            contract.customerName
                          }
                        />

                        <MobileDetail
                          label="Estimate"
                          value={
                            contract.estimateNumber
                          }
                        />

                        <MobileDetail
                          label="Total"
                          value={formatCurrency(
                            contract.projectTotal,
                          )}
                        />

                        <MobileDetail
                          label="Date"
                          value={formatDate(
                            getContractDate(
                              contract,
                            ),
                          )}
                        />
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() =>
                            openContract(
                              contract,
                            )
                          }
                          className="flex-1 rounded-xl bg-[#222222] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#B59A68]"
                        >
                          {isExecutedStatus(
                            status,
                          )
                            ? 'View Contract'
                            : 'Resume Draft'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            duplicateContract(
                              contract,
                            )
                          }
                          className="rounded-xl border border-[#D9D4CB] bg-white px-5 py-3 text-sm font-medium text-[#555555]"
                        >
                          Duplicate
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteContract(
                              contract,
                            )
                          }
                          className="rounded-xl border border-[#E4CBC7] bg-white px-5 py-3 text-sm font-medium text-[#9A554B]"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  )
                },
              )}
            </div>

            <div className="mt-5 flex flex-col justify-between gap-3 px-1 text-sm text-[#888888] sm:flex-row">
              <p>
                Showing{' '}
                {filteredContracts.length}{' '}
                of {contracts.length}{' '}
                contracts
              </p>

              <p>
                Click a row to open the
                contract.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function MetricCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#E8E5DE] bg-white px-5 py-5">
      <p className="text-xs font-medium uppercase tracking-[0.13em] text-[#999999]">
        {label}
      </p>

      <p className="mt-3 truncate text-2xl font-light text-[#555555]">
        {value}
      </p>
    </div>
  )
}

function StatusBadge({
  status,
}: {
  status: ContractStatus
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClasses(
        status,
      )}`}
    >
      {status}
    </span>
  )
}

function MenuButton({
  label,
  onClick,
  danger = false,
}: {
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full px-4 py-2.5 text-left text-sm transition hover:bg-[#F8F6F2] ${
        danger
          ? 'text-[#9A554B]'
          : 'text-[#555555]'
      }`}
    >
      {label}
    </button>
  )
}

function MobileDetail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-xl bg-[#FAF9F7] p-4">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#999999]">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-medium text-[#555555]">
        {value || 'Not specified'}
      </p>
    </div>
  )
}