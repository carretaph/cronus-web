import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getContracts,
  type ApiContract,
} from '../services/contractsApi'

import {
  getAuthenticatedUser,
} from '../auth/auth'

type DateFilter =
  | 'ALL'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'YTD'

function money(value: number) {
  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    },
  ).format(value)
}

function percent(value: number) {
  return `${value.toFixed(2)}%`
}

function safeNumber(
  value: number | null | undefined,
) {
  return Number.isFinite(value)
    ? Number(value)
    : 0
}

function contractDate(
  contract: ApiContract,
) {
  return (
    contract.executedAt ||
    contract.completedAt ||
    contract.updatedAt ||
    contract.createdAt
  )
}

function matchesDateFilter(
  contract: ApiContract,
  filter: DateFilter,
) {
  if (filter === 'ALL') {
    return true
  }

  const value = contractDate(contract)

  if (!value) {
    return false
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return false
  }

  const now = new Date()

  if (filter === 'YTD') {
    return (
      date.getFullYear() ===
      now.getFullYear()
    )
  }

  if (filter === 'THIS_MONTH') {
    return (
      date.getFullYear() ===
        now.getFullYear() &&
      date.getMonth() ===
        now.getMonth()
    )
  }

  const previousMonth =
    new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    )

  return (
    date.getFullYear() ===
      previousMonth.getFullYear() &&
    date.getMonth() ===
      previousMonth.getMonth()
  )
}

export default function SalesReport() {
  const user = getAuthenticatedUser()

  const [contracts, setContracts] =
    useState<ApiContract[]>([])

  const [loading, setLoading] =
    useState(true)

  const [search, setSearch] =
    useState('')

  const [dateFilter, setDateFilter] =
    useState<DateFilter>(
      'THIS_MONTH',
    )

  useEffect(() => {
    async function load() {
      try {
        const result =
          await getContracts()

        setContracts(result)
      } catch (error) {
        console.error(
          'Unable to load sales report:',
          error,
        )
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const filtered =
    useMemo(() => {
      const normalized =
        search
          .trim()
          .toLowerCase()

      return contracts.filter(
        (contract) => {
          if (
            !matchesDateFilter(
              contract,
              dateFilter,
            )
          ) {
            return false
          }

          if (!normalized) {
            return true
          }

          return [
            contract.contractNumber,
            contract.estimateNumber,
            contract.customerName,
            contract.ownerName ?? '',
            contract.ownerManagerName ?? '',
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalized)
        },
      )
    }, [
      contracts,
      search,
      dateFilter,
    ])

  const metrics =
    useMemo(() => {
      const retail =
        filtered.reduce(
          (sum, contract) =>
            sum +
            safeNumber(
              contract.retailPrice,
            ),
          0,
        )

      const discounts =
        filtered.reduce(
          (sum, contract) =>
            sum +
            safeNumber(
              contract.discountTotal,
            ),
          0,
        )

      const sales =
        filtered.reduce(
          (sum, contract) =>
            sum +
            safeNumber(
              contract.projectTotal,
            ),
          0,
        )

      const commissions =
        filtered.reduce(
          (sum, contract) =>
            sum +
            safeNumber(
              contract.commissionAmount,
            ),
          0,
        )

      const discountPercents =
        filtered
          .map((contract) =>
            safeNumber(
              contract.discountPercent,
            ),
          )
          .filter(
            (value) => value >= 0,
          )

      const averageDiscount =
        discountPercents.length
          ? discountPercents.reduce(
              (sum, value) =>
                sum + value,
              0,
            ) /
            discountPercents.length
          : 0

      const averageTicket =
        filtered.length
          ? sales /
            filtered.length
          : 0

      return {
        retail,
        discounts,
        sales,
        commissions,
        averageDiscount,
        averageTicket,
        netAfterCommission:
          sales - commissions,
      }
    }, [filtered])

  const showTeam =
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER'

  return (
    <section className="px-5 py-9 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Performance
            </p>

            <h1 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              Sales Report
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#888888]">
              Sales volume, discounts and commissions from executed contracts.
            </p>
          </div>

          <select
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(
                event.target
                  .value as DateFilter,
              )
            }
            className="h-12 rounded-xl border border-[#DDD8D0] bg-white px-4 text-sm text-[#555555] outline-none focus:border-[#B59A68]"
          >
            <option value="THIS_MONTH">
              This month
            </option>

            <option value="LAST_MONTH">
              Last month
            </option>

            <option value="YTD">
              Year to date
            </option>

            <option value="ALL">
              All time
            </option>
          </select>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Net Sales"
            value={money(
              metrics.sales,
            )}
          />

          <Metric
            label="Sales Commission"
            value={money(
              metrics.commissions,
            )}
          />

          <Metric
            label="Average Ticket"
            value={money(
              metrics.averageTicket,
            )}
          />

          <Metric
            label="Contracts"
            value={String(
              filtered.length,
            )}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Retail Value"
            value={money(
              metrics.retail,
            )}
          />

          <Metric
            label="Discounts"
            value={money(
              metrics.discounts,
            )}
          />

          <Metric
            label="Average Discount"
            value={percent(
              metrics.averageDiscount,
            )}
          />

          <Metric
            label="After Sales Commission"
            value={money(
              metrics.netAfterCommission,
            )}
          />
        </div>

        <div className="mt-8 rounded-3xl border border-[#E8E5DE] bg-white p-5 sm:p-6">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search contract, customer or salesperson..."
            className="h-12 w-full rounded-xl border border-[#DDD8D0] bg-[#FAF9F7] px-4 text-sm text-[#555555] outline-none placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
          />
        </div>

        <div className="mt-8 overflow-x-auto rounded-3xl border border-[#E8E5DE] bg-white">
          {loading ? (
            <div className="p-12 text-center text-sm text-[#888888]">
              Loading sales report...
            </div>
          ) : (
            <table className="w-full min-w-[1250px] border-collapse">
              <thead className="bg-[#FAF9F6]">
                <tr>
                  <Header>
                    Contract
                  </Header>

                  <Header>
                    Customer
                  </Header>

                  {showTeam && (
                    <Header>
                      Sales Rep
                    </Header>
                  )}

                  {showTeam && (
                    <Header>
                      Manager
                    </Header>
                  )}

                  <Header right>
                    Retail
                  </Header>

                  <Header right>
                    Discount
                  </Header>

                  <Header right>
                    Sale
                  </Header>

                  <Header right>
                    Comm. %
                  </Header>

                  <Header right>
                    Commission
                  </Header>
                </tr>
              </thead>

              <tbody>
                {filtered.map(
                  (contract) => (
                    <tr
                      key={contract.id}
                      className="border-t border-[#ECE9E2]"
                    >
                      <Cell>
                        <p className="font-medium text-[#444444]">
                          {contract.contractNumber}
                        </p>

                        <p className="mt-1 text-xs text-[#999999]">
                          {new Date(
                            contractDate(
                              contract,
                            ),
                          ).toLocaleDateString()}
                        </p>
                      </Cell>

                      <Cell>
                        {contract.customerName}
                      </Cell>

                      {showTeam && (
                        <Cell>
                          {contract.ownerName ||
                            'Unassigned'}
                        </Cell>
                      )}

                      {showTeam && (
                        <Cell>
                          {contract.ownerManagerName ||
                            '—'}
                        </Cell>
                      )}

                      <Cell right>
                        {money(
                          safeNumber(
                            contract.retailPrice,
                          ),
                        )}
                      </Cell>

                      <Cell right>
                        {percent(
                          safeNumber(
                            contract.discountPercent,
                          ),
                        )}
                      </Cell>

                      <Cell right>
                        {money(
                          safeNumber(
                            contract.projectTotal,
                          ),
                        )}
                      </Cell>

                      <Cell right>
                        {percent(
                          safeNumber(
                            contract.commissionRate,
                          ),
                        )}
                      </Cell>

                      <Cell right>
                        <span className="font-medium text-[#4F755E]">
                          {money(
                            safeNumber(
                              contract.commissionAmount,
                            ),
                          )}
                        </span>
                      </Cell>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-3xl border border-[#E8E5DE] bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#999999]">
        {label}
      </p>

      <p className="mt-4 text-2xl font-light text-[#444444]">
        {value}
      </p>
    </div>
  )
}

function Header({
  children,
  right = false,
}: {
  children: React.ReactNode
  right?: boolean
}) {
  return (
    <th
      className={`px-5 py-4 text-xs font-medium uppercase tracking-[0.1em] text-[#888888] ${
        right
          ? 'text-right'
          : 'text-left'
      }`}
    >
      {children}
    </th>
  )
}

function Cell({
  children,
  right = false,
}: {
  children: React.ReactNode
  right?: boolean
}) {
  return (
    <td
      className={`px-5 py-5 text-sm text-[#555555] ${
        right
          ? 'text-right'
          : 'text-left'
      }`}
    >
      {children}
    </td>
  )
}
