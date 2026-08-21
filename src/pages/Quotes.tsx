import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getQuotes,
  type ApiQuote,
} from '../services/quotesApi'

import {
  getAuthenticatedUser,
} from '../auth/auth'

type AppointmentDisposition =
  | 'Demo - No Sale'
  | 'Sale'
  | 'Not Home'
  | 'Not Demo'

type QuoteStatus =
  | 'Draft'
  | 'Sent'
  | 'Accepted'
  | 'Converted to Contract'

type ProjectForm = {
  projectName: string
  projectAddress: string
  salesperson: string
  leadSource: string
  permitRequired: boolean
  hoaRequired: boolean
  notes: string
}

type StoredQuote = {
  id: string
  estimateNumber: string
  customerId: string | null
  customerName: string
  customerEmail: string
  customerPhone: string
  projectForm: ProjectForm
  openings: unknown[]
  discounts: unknown[]
  selectedFinancingId: string
  downPayment: number
  retailPrice: number
  discountTotal: number
  projectTotal: number
  status: QuoteStatus
  appointmentDisposition: AppointmentDisposition | null

  ownerUserId?: string | null
  ownerName?: string | null
  ownerManagerId?: string | null
  ownerManagerName?: string | null

  createdAt: string
  updatedAt: string
}

const quotesStorageKey = 'cronus_quotes_v1'

function loadQuotes(): StoredQuote[] {
  try {
    const storedQuotes = localStorage.getItem(
      quotesStorageKey,
    )

    if (!storedQuotes) {
      return []
    }

    const parsedQuotes = JSON.parse(storedQuotes)

    return Array.isArray(parsedQuotes)
      ? (parsedQuotes as StoredQuote[])
      : []
  } catch {
    return []
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function formatDate(value: string) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export default function Quotes() {
  const user = getAuthenticatedUser()

  const showOwnership =
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER'

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<'All' | QuoteStatus>('All')
  const [quotes, setQuotes] = useState<StoredQuote[]>([])
const [quotesLoading, setQuotesLoading] = useState(true)

const localQuotes = loadQuotes()
void localQuotes

useEffect(() => {
  async function loadDatabaseQuotes() {
    try {
      const apiQuotes = await getQuotes()

      const databaseQuotes: StoredQuote[] = apiQuotes.map(
        (quote: ApiQuote) => ({
          id: String(quote.id ?? ''),
          estimateNumber: quote.estimateNumber,
          customerId: quote.customerId,
          customerName: quote.customerName,
          customerEmail: quote.customerEmail,
          customerPhone: quote.customerPhone,
          projectForm: JSON.parse(quote.projectFormJson),
          openings: JSON.parse(quote.openingsJson),
          discounts: JSON.parse(quote.discountsJson),
          selectedFinancingId: quote.selectedFinancingId,
          downPayment: quote.downPayment,
          retailPrice: quote.retailPrice,
          discountTotal: quote.discountTotal,
          projectTotal: quote.projectTotal,
          status: quote.status as QuoteStatus,
          appointmentDisposition:
            quote.appointmentDisposition as AppointmentDisposition | null,

          ownerUserId:
            quote.ownerUserId ?? null,

          ownerName:
            quote.ownerName ?? null,

          ownerManagerId:
            quote.ownerManagerId ?? null,

          ownerManagerName:
            quote.ownerManagerName ?? null,

          createdAt: quote.createdAt,
          updatedAt: quote.updatedAt,
        }),
      )

      setQuotes(databaseQuotes)
    } catch (error) {
      console.error(
        'Unable to load quotes from database:',
        error,
      )
    } finally {
      setQuotesLoading(false)
    }
  }

  loadDatabaseQuotes()
}, [])

void quotesLoading

  const filteredQuotes = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase()

    return quotes.filter((quote) => {
      const matchesStatus =
        statusFilter === 'All' ||
        quote.status === statusFilter

      const searchableText = [
        quote.estimateNumber,
        quote.customerName,
        quote.customerEmail,
        quote.customerPhone,
        quote.projectForm.projectName,
        quote.projectForm.projectAddress,
        quote.projectForm.salesperson,
        quote.status,
        quote.appointmentDisposition ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return (
        matchesStatus &&
        (!normalizedSearch ||
          searchableText.includes(normalizedSearch))
      )
    })
  }, [quotes, searchTerm, statusFilter])

  const sentCount = quotes.filter(
    (quote) => quote.status === 'Sent',
  ).length

  const acceptedCount = quotes.filter(
    (quote) =>
      quote.status === 'Accepted' ||
      quote.status === 'Converted to Contract',
  ).length

  const convertedCount = quotes.filter(
    (quote) =>
      quote.status === 'Converted to Contract',
  ).length

  return (
    <section className="px-5 py-9 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Sales
            </p>

            <h1 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              Quotes
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#888888]">
              Review estimates, appointment results and quotes converted into contracts.
            </p>
          </div>

          <Link
            to="/portal/quotes/new"
            className="inline-flex h-14 items-center justify-center rounded-xl bg-[#222222] px-7 text-sm font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#B59A68]"
          >
            New quote
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Quotes"
            value={String(quotes.length)}
            description="All saved estimates"
          />

          <StatCard
            title="Sent"
            value={String(sentCount)}
            description="Awaiting a decision"
          />

          <StatCard
            title="Sales"
            value={String(acceptedCount)}
            description="Accepted appointments"
          />

          <StatCard
            title="Contracts"
            value={String(convertedCount)}
            description="Converted with Order Now"
          />
        </div>

        <section className="mt-7 overflow-hidden rounded-[24px] border border-[#E8E5DE] bg-white">
          <div className="flex flex-col gap-4 border-b border-[#ECE9E2] px-6 py-6 lg:flex-row lg:items-center lg:justify-between sm:px-8">
            <div>
              <h2 className="text-xl font-medium text-[#444444]">
                Quote history
              </h2>

              <p className="mt-2 text-sm text-[#999999]">
                Every sent quote and completed appointment appears here.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-[1fr_190px] lg:w-auto">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search customer, address or estimate..."
                className="h-12 w-full min-w-0 rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white lg:w-96"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | 'All'
                      | QuoteStatus,
                  )
                }
                className="h-12 rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#555555] outline-none focus:border-[#B59A68] focus:bg-white"
              >
                <option value="All">All statuses</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Converted to Contract">
                  Converted
                </option>
              </select>
            </div>
          </div>

          {filteredQuotes.length > 0 ? (
            <div className="divide-y divide-[#ECE9E2]">
              {filteredQuotes.map((quote) => (
                <article
                  key={quote.id}
                  className="grid gap-5 px-6 py-6 transition hover:bg-[#FCFBF8] sm:px-8 xl:grid-cols-[1.2fr_1.1fr_0.7fr_0.7fr_0.8fr_auto] xl:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={quote.status} />

                      {quote.appointmentDisposition && (
                        <span className="rounded-full border border-[#E2DED5] bg-white px-3 py-1.5 text-xs font-medium text-[#777777]">
                          {quote.appointmentDisposition}
                        </span>
                      )}
                    </div>

                    <p className="mt-4 text-lg font-medium text-[#3F3F3F]">
                      {quote.estimateNumber}
                    </p>

                    <p className="mt-1 text-sm text-[#999999]">
                      Updated {formatDate(quote.updatedAt)}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-[#4A4A4A]">
                      {quote.customerName}
                    </p>

                    <p className="mt-1 text-sm text-[#999999]">
                      {quote.projectForm.projectAddress ||
                        'No project address'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#AAA39A]">
                      Total
                    </p>

                    <p className="mt-2 font-medium text-[#444444]">
                      {formatCurrency(quote.projectTotal)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#AAA39A]">
                      Sales rep
                    </p>

                    <p className="mt-2 font-medium text-[#555555]">
                      {quote.projectForm.salesperson || '—'}
                    </p>
                  </div>

                  {showOwnership && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-[#AAA39A]">
                        Owner
                      </p>

                      <p className="mt-2 font-medium text-[#555555]">
                        {quote.ownerName || 'Unassigned'}
                      </p>

                      <p className="mt-1 text-xs text-[#999999]">
                        Manager:{' '}
                        {quote.ownerManagerName || '—'}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 xl:justify-end">
                    <Link
                      to="/portal/quotes/new"
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-[#D8D4CB] bg-white px-5 text-sm font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#9A8258]"
                    >
                      Open
                    </Link>

                    {quote.status ===
                      'Converted to Contract' && (
                      <Link
                        to="/portal/contracts/new"
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-[#0A7A43] px-5 text-sm font-medium text-white transition hover:bg-[#086437]"
                      >
                        Contract
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center px-6 py-16 text-center">
              <div className="max-w-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3EFE6] text-2xl text-[#9A8258]">
                  Q
                </div>

                <h3 className="mt-6 text-xl font-medium text-[#555555]">
                  {quotes.length
                    ? 'No matching quotes'
                    : 'No sent quotes yet'}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#999999]">
                  Send an estimate or use Order Now from Pricing. It will be saved here automatically.
                </p>

                {!quotes.length && (
                  <Link
                    to="/portal/quotes/new"
                    className="mt-7 inline-flex h-12 items-center justify-center rounded-xl bg-[#222222] px-6 text-sm font-medium text-white transition hover:bg-[#B59A68]"
                  >
                    Create first quote
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

function StatusBadge({
  status,
}: {
  status: QuoteStatus
}) {
  const className =
    status === 'Converted to Contract'
      ? 'bg-[#EAF6EF] text-[#0A7A43]'
      : status === 'Accepted'
        ? 'bg-[#EDF5EE] text-[#477050]'
        : status === 'Sent'
          ? 'bg-[#EEF3F9] text-[#3F6287]'
          : 'bg-[#F3EFE6] text-[#8D7651]'

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-[0.1em] ${className}`}
    >
      {status}
    </span>
  )
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <article className="rounded-[22px] border border-[#E8E5DE] bg-white p-6">
      <p className="text-sm font-medium text-[#777777]">
        {title}
      </p>

      <p className="mt-4 text-4xl font-light tracking-[-0.04em] text-[#333333]">
        {value}
      </p>

      <p className="mt-3 text-sm leading-6 text-[#999999]">
        {description}
      </p>
    </article>
  )
}
