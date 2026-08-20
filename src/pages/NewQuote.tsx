import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'

import EstimatePDF from '../components/pdf/EstimatePDF'

import { getCustomers } from './customerdata'
import OpeningManager from './OpeningManager'
import type { Opening } from './OpeningManager'
import { calculateCoreProductPrice } from '../services/pricingService'

type ProjectForm = {
  projectName: string
  projectAddress: string
  salesperson: string
  leadSource: string
  permitRequired: boolean
  hoaRequired: boolean
  notes: string
}

type DiscountMode = 'percent' | 'fixed'

type Discount = {
  id: string
  name: string
  mode: DiscountMode
  value: number
  active: boolean
  order: number | null
}

type FinancingOptionId =
  | 'cash'
  | '120-months'
  | 'deferred'
  | 'custom'

type QuoteDraft = {
  estimateNumber: string | null
  selectedCustomerId: string | null
  projectForm: ProjectForm
  openings: Opening[]
  discounts: Discount[]
  selectedFinancingId: FinancingOptionId
  downPayment: number
  savedAt: string
}

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

type StoredQuote = {
  id: string
  estimateNumber: string
  customerId: string | null
  customerName: string
  customerEmail: string
  customerPhone: string
  projectForm: ProjectForm
  openings: Opening[]
  discounts: Discount[]
  selectedFinancingId: FinancingOptionId
  downPayment: number
  retailPrice: number
  discountTotal: number
  projectTotal: number
  status: QuoteStatus
  appointmentDisposition: AppointmentDisposition | null
  createdAt: string
  updatedAt: string
}

const quotesStorageKey = 'cronus_quotes_v1'
const contractHandoffStorageKey =
  'cronus_contract_handoff_v1'

function loadStoredQuotes(): StoredQuote[] {
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

function upsertStoredQuote(quote: StoredQuote) {
  const storedQuotes = loadStoredQuotes()
  const existingIndex = storedQuotes.findIndex(
    (storedQuote) =>
      storedQuote.estimateNumber === quote.estimateNumber,
  )

  if (existingIndex >= 0) {
    storedQuotes[existingIndex] = {
      ...storedQuotes[existingIndex],
      ...quote,
      createdAt:
        storedQuotes[existingIndex].createdAt ||
        quote.createdAt,
    }
  } else {
    storedQuotes.unshift(quote)
  }

  localStorage.setItem(
    quotesStorageKey,
    JSON.stringify(storedQuotes),
  )
}

const quoteDraftStorageKey = 'cronus_complete_quote_draft_v1'

function getEstimateCounterStorageKey(year: number) {
  return `cronus_estimate_counter_${year}`
}

function createNextEstimateNumber() {
  const fullYear = new Date().getFullYear()
  const shortYear = String(fullYear).slice(-2)
  const counterKey = getEstimateCounterStorageKey(fullYear)

  const savedCounter = Number.parseInt(
    localStorage.getItem(counterKey) ?? '0',
    10,
  )

  const nextCounter = Number.isFinite(savedCounter)
    ? savedCounter + 1
    : 1

  localStorage.setItem(
    counterKey,
    String(nextCounter),
  )

  return `CRON${shortYear}-${String(nextCounter).padStart(
    3,
    '0',
  )}`
}

const defaultProjectForm: ProjectForm = {
  projectName: '',
  projectAddress: '',
  salesperson: 'Alberto',
  leadSource: '',
  permitRequired: false,
  hoaRequired: false,
  notes: '',
}

const defaultDiscounts: Discount[] = [
  {
    id: 'national-offer',
    name: 'National Offer',
    mode: 'percent',
    value: 0,
    active: false,
    order: null,
  },
  {
    id: 'regular-discount',
    name: 'Regular Discount',
    mode: 'percent',
    value: 0,
    active: false,
    order: null,
  },
  {
    id: 'military',
    name: 'Military',
    mode: 'percent',
    value: 0,
    active: false,
    order: null,
  },
  {
    id: 'first-responder',
    name: 'First Responder',
    mode: 'percent',
    value: 0,
    active: false,
    order: null,
  },
  {
    id: 'repeat-customer',
    name: 'Repeat Customer',
    mode: 'percent',
    value: 0,
    active: false,
    order: null,
  },
  {
    id: 'paid-in-full',
    name: 'Paid in Full',
    mode: 'percent',
    value: 0,
    active: false,
    order: null,
  },
  {
    id: 'bogo-40',
    name: 'Buy One, Get One 40% Off',
    mode: 'percent',
    value: 40,
    active: false,
    order: null,
  },
]


const doorCategories = new Set([
  'Sliding Door',
  'French Door',
  'Entry Door',
])

type PricedProduct = {
  id: string
  openingNumber: string
  label: string
  productCategory: string
  price: number
}

function calculateProductPrice(
  opening: Opening,
  product: Opening['products'][number],
) {
  const isDoor = doorCategories.has(
    product.productCategory,
  )

  return calculateCoreProductPrice({
  width: product.width,
  height: product.height,
  productCategory: product.productCategory,
  configuration: product.configuration,
  isDoor,
  impact: Boolean(opening.impact),
  tempered: product.tempered === 'Yes',
  tinted: product.tinted === 'Yes',
  privacyGlass:
    product.privacyGlass === 'Yes',
  grids: product.grids === 'Yes',
  color: product.color,
  screen: product.screen !== 'No',
}).total
}

function getPricedProducts(
  openings: Opening[],
): PricedProduct[] {
  return openings.flatMap((opening) =>
    opening.products.map((product) => ({
      id: product.id,
      openingNumber: opening.openingNumber,
      label: product.label,
      productCategory: product.productCategory,
      price: calculateProductPrice(
        opening,
        product,
      ),
    })),
  )
}

function calculateBogoSavings(
  products: PricedProduct[],
  priceScale: number,
) {
  const sortedProducts = [...products]
    .map((product) => ({
      ...product,
      adjustedPrice: product.price * priceScale,
    }))
    .filter((product) => product.adjustedPrice > 0)
    .sort(
      (first, second) =>
        second.adjustedPrice - first.adjustedPrice,
    )

  const pairs: Array<{
    paidProduct: (typeof sortedProducts)[number]
    discountedProduct: (typeof sortedProducts)[number]
    savings: number
  }> = []

  for (
    let index = 0;
    index + 1 < sortedProducts.length;
    index += 2
  ) {
    const paidProduct = sortedProducts[index]
    const discountedProduct = sortedProducts[index + 1]

    pairs.push({
      paidProduct,
      discountedProduct,
      savings: discountedProduct.adjustedPrice * 0.4,
    })
  }

  return {
    pairs,
    savings: pairs.reduce(
      (total, pair) => total + pair.savings,
      0,
    ),
  }
}

function calculateRetailPrice(openings: Opening[]) {
  return openings.reduce((projectTotal, opening) => {
    const productsTotal = opening.products.reduce(
      (openingTotal, product) => {
        return (
          openingTotal +
          calculateProductPrice(opening, product)
        )
      },
      0,
    )

    return (
      projectTotal +
      productsTotal +
      (opening.mullionCharge || 0)
    )
  }, 0)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number,
) {
  if (principal <= 0 || months <= 0) {
    return 0
  }

  const monthlyRate = annualRate / 100 / 12

  if (monthlyRate === 0) {
    return principal / months
  }

  return (
    (principal *
      monthlyRate *
      Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  )
}

function loadQuoteDraft(): QuoteDraft {
  try {
    const storedDraft = localStorage.getItem(
      quoteDraftStorageKey,
    )

    if (!storedDraft) {
      const previousOpeningDraft = localStorage.getItem(
        'cronus_quote_draft_v1',
      )

      if (previousOpeningDraft) {
        const parsedPreviousDraft = JSON.parse(
          previousOpeningDraft,
        ) as { openings?: Opening[] }

        return {
          estimateNumber: null,
          selectedCustomerId: null,
          projectForm: defaultProjectForm,
          openings: Array.isArray(
            parsedPreviousDraft.openings,
          )
            ? parsedPreviousDraft.openings
            : [],
          discounts: defaultDiscounts,
          selectedFinancingId: 'cash',
          downPayment: 0,
          savedAt: '',
        }
      }

      return {
        estimateNumber: null,
        selectedCustomerId: null,
        projectForm: defaultProjectForm,
        openings: [],
        discounts: defaultDiscounts,
        selectedFinancingId: 'cash',
        downPayment: 0,
        savedAt: '',
      }
    }

    const parsedDraft = JSON.parse(
      storedDraft,
    ) as Partial<QuoteDraft>

    return {
      estimateNumber: parsedDraft.estimateNumber ?? null,
      selectedCustomerId:
        parsedDraft.selectedCustomerId ?? null,
      projectForm: {
        ...defaultProjectForm,
        ...(parsedDraft.projectForm ?? {}),
      },
      openings: Array.isArray(parsedDraft.openings)
        ? parsedDraft.openings
        : [],
      discounts: Array.isArray(parsedDraft.discounts)
        ? (() => {
          const savedDiscounts =
            parsedDraft.discounts ?? []

          const activeSavedIds = savedDiscounts
            .filter((discount) => discount.active)
            .sort(
              (first, second) =>
                (first.order ?? Number.MAX_SAFE_INTEGER) -
                (second.order ?? Number.MAX_SAFE_INTEGER),
            )
            .map((discount) => discount.id)

          return defaultDiscounts.map(
            (defaultDiscount) => {
              const savedDiscount =
                savedDiscounts.find(
                  (discount) =>
                    discount.id === defaultDiscount.id,
                )

              if (!savedDiscount) {
                return { ...defaultDiscount }
              }

              const activeOrder =
                activeSavedIds.indexOf(
                  defaultDiscount.id,
                )

              return {
                ...defaultDiscount,
                ...savedDiscount,
                order:
                  savedDiscount.active &&
                    activeOrder >= 0
                    ? activeOrder + 1
                    : null,
                value:
                  defaultDiscount.id === 'bogo-40'
                    ? 40
                    : savedDiscount.value,
              }
            },
          )
        })()
        : defaultDiscounts.map((discount) => ({
          ...discount,
        })),
      selectedFinancingId:
        parsedDraft.selectedFinancingId ?? 'cash',
      downPayment: parsedDraft.downPayment ?? 0,
      savedAt: parsedDraft.savedAt ?? '',
    }
  } catch {
    return {
      estimateNumber: null,
      selectedCustomerId: null,
      projectForm: defaultProjectForm,
      openings: [],
      discounts: defaultDiscounts.map((discount) => ({
        ...discount,
      })),
      selectedFinancingId: 'cash',
      downPayment: 0,
      savedAt: '',
    }
  }
}

function saveCompleteQuoteDraft(
  estimateNumber: string | null,
  selectedCustomerId: string | null,
  projectForm: ProjectForm,
  openings: Opening[],
  discounts: Discount[],
  selectedFinancingId: FinancingOptionId,
  downPayment: number,
) {
  const draft: QuoteDraft = {
    estimateNumber,
    selectedCustomerId,
    projectForm,
    openings,
    discounts,
    selectedFinancingId,
    downPayment,
    savedAt: new Date().toISOString(),
  }

  localStorage.setItem(
    quoteDraftStorageKey,
    JSON.stringify(draft),
  )
}

export default function NewQuote() {
  const navigate = useNavigate()
  const customers = getCustomers()
  const initialDraft = useMemo(loadQuoteDraft, [])

  const [estimateNumber, setEstimateNumber] =
    useState<string | null>(initialDraft.estimateNumber)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] =
    useState<string | null>(
      initialDraft.selectedCustomerId,
    )

  const [projectForm, setProjectForm] =
    useState<ProjectForm>(initialDraft.projectForm)

  const [openings, setOpenings] = useState<Opening[]>(
    initialDraft.openings,
  )

  const [discounts, setDiscounts] = useState<Discount[]>(
    initialDraft.discounts,
  )

  const [
    selectedDiscountToAdd,
    setSelectedDiscountToAdd,
  ] = useState('')

  const [
    selectedFinancingId,
    setSelectedFinancingId,
  ] = useState<FinancingOptionId>(
    initialDraft.selectedFinancingId,
  )

  const [downPayment, setDownPayment] = useState(
    initialDraft.downPayment,
  )

  const [estimateEmailTo, setEstimateEmailTo] =
    useState('')

  const [estimateEmailSubject, setEstimateEmailSubject] =
    useState('Cronus Windows & Doors Estimate')

  const [estimateEmailMessage, setEstimateEmailMessage] =
    useState(
      'Hello,\n\nPlease find your Cronus Windows & Doors estimate attached.\n\nThank you.',
    )

  const [isGeneratingEstimatePdf, setIsGeneratingEstimatePdf] =
    useState(false)

  const [saveStatus, setSaveStatus] = useState<
    'saved' | 'saving'
  >('saved')

  const [
    isAppointmentModalOpen,
    setIsAppointmentModalOpen,
  ] = useState(false)

  const [
    appointmentDisposition,
    setAppointmentDisposition,
  ] = useState<AppointmentDisposition | null>(null)

  const [quoteActionMessage, setQuoteActionMessage] =
    useState('')

  useEffect(() => {
    setSaveStatus('saving')

    const saveTimer = window.setTimeout(() => {
      saveCompleteQuoteDraft(
        estimateNumber,
        selectedCustomerId,
        projectForm,
        openings,
        discounts,
        selectedFinancingId,
        downPayment,
      )
      setSaveStatus('saved')
    }, 350)

    return () => window.clearTimeout(saveTimer)
  }, [
    discounts,
    downPayment,
    estimateNumber,
    openings,
    projectForm,
    selectedCustomerId,
    selectedFinancingId,
  ])

  function handleSaveQuote() {
    saveCompleteQuoteDraft(
      estimateNumber,
      selectedCustomerId,
      projectForm,
      openings,
      discounts,
      selectedFinancingId,
      downPayment,
    )
    setSaveStatus('saved')
  }

  const retailPrice = useMemo(
    () => calculateRetailPrice(openings),
    [openings],
  )

  const pricedProducts = useMemo(
    () => getPricedProducts(openings),
    [openings],
  )

  const activeDiscounts = useMemo(
    () =>
      discounts
        .filter((discount) => discount.active)
        .sort(
          (first, second) =>
            (first.order ?? Number.MAX_SAFE_INTEGER) -
            (second.order ?? Number.MAX_SAFE_INTEGER),
        ),
    [discounts],
  )

  const discountBreakdown = useMemo(() => {
    let currentPrice = Math.round(retailPrice)

    return activeDiscounts.map((discount) => {
      const previousPrice = Math.round(currentPrice)

      if (discount.id === 'bogo-40') {
        const priceScale =
          retailPrice > 0
            ? previousPrice / retailPrice
            : 0

        const bogoResult = calculateBogoSavings(
          pricedProducts,
          priceScale,
        )

        const discountAmount = Math.round(
          Math.min(
            bogoResult.savings,
            previousPrice,
          ),
        )

        currentPrice = Math.round(
          Math.max(
            0,
            previousPrice - discountAmount,
          ),
        )

        return {
          discount,
          previousPrice,
          discountAmount,
          resultingPrice: currentPrice,
          bogoPairs: bogoResult.pairs,
        }
      }

      const requestedAmount =
        discount.mode === 'percent'
          ? Math.round(
            previousPrice *
            (discount.value / 100),
          )
          : Math.round(discount.value)

      const discountAmount = Math.round(
        Math.min(
          Math.max(0, requestedAmount),
          previousPrice,
        ),
      )

      currentPrice = Math.round(
        Math.max(
          0,
          previousPrice - discountAmount,
        ),
      )

      return {
        discount,
        previousPrice,
        discountAmount,
        resultingPrice: currentPrice,
        bogoPairs: [],
      }
    })
  }, [activeDiscounts, pricedProducts, retailPrice])

  const discountTotal = useMemo(
    () =>
      Math.round(
        discountBreakdown.reduce(
          (total, item) =>
            total + item.discountAmount,
          0,
        ),
      ),
    [discountBreakdown],
  )

  const totalDiscountPercentage =
    retailPrice > 0
      ? (discountTotal / retailPrice) * 100
      : 0

  const projectTotal = Math.max(
    0,
    Math.round(
      retailPrice - discountTotal,
    ),
  )

  const safeDownPayment = Math.min(
    Math.max(
      0,
      Math.round(downPayment),
    ),
    projectTotal,
  )

  const financedBalance = Math.max(
    0,
    Math.round(
      projectTotal - safeDownPayment,
    ),
  )

  const windowCount = openings.reduce(
    (total, opening) =>
      total +
      opening.products.filter(
        (product) =>
          !doorCategories.has(product.productCategory),
      ).length,
    0,
  )

  const doorCount = openings.reduce(
    (total, opening) =>
      total +
      opening.products.filter((product) =>
        doorCategories.has(product.productCategory),
      ).length,
    0,
  )

  const totalProducts = windowCount + doorCount

  function updateDiscount(
    id: string,
    updates: Partial<Discount>,
  ) {
    setDiscounts((current) =>
      current.map((discount) =>
        discount.id === id
          ? { ...discount, ...updates }
          : discount,
      ),
    )
  }

  function addSelectedDiscount() {
    if (!selectedDiscountToAdd) {
      return
    }

    setDiscounts((current) => {
      const highestOrder = current.reduce(
        (highest, discount) =>
          discount.active && discount.order !== null
            ? Math.max(highest, discount.order)
            : highest,
        0,
      )

      return current.map((discount) =>
        discount.id === selectedDiscountToAdd
          ? {
            ...discount,
            active: true,
            order: highestOrder + 1,
            value:
              discount.id === 'bogo-40'
                ? 40
                : discount.value,
          }
          : discount,
      )
    })

    setSelectedDiscountToAdd('')
  }

  function removeDiscount(id: string) {
    setDiscounts((current) => {
      const remainingDiscounts = current
        .filter(
          (discount) =>
            discount.active && discount.id !== id,
        )
        .sort(
          (first, second) =>
            (first.order ?? 0) - (second.order ?? 0),
        )

      const newOrderById = new Map(
        remainingDiscounts.map((discount, index) => [
          discount.id,
          index + 1,
        ]),
      )

      return current.map((discount) =>
        discount.id === id
          ? {
            ...discount,
            active: false,
            order: null,
            value: 0,
          }
          : {
            ...discount,
            order:
              newOrderById.get(discount.id) ??
              discount.order,
          },
      )
    })
  }

  function clearAllDiscounts() {
    setDiscounts(
      defaultDiscounts.map((discount) => ({
        ...discount,
      })),
    )
    setSelectedDiscountToAdd('')
  }

  function scrollToPricing() {
    handleSaveQuote()
    document
      .getElementById('quote-pricing')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
  }

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase()

    if (!normalizedSearch) {
      return customers
    }

    return customers.filter((customer) => {
      const searchableText = [
        customer.firstName,
        customer.lastName,
        customer.email,
        customer.phone,
        customer.address,
        customer.city,
        customer.state,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedSearch)
    })
  }, [customers, searchTerm])

  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId,
  )

  useEffect(() => {
    if (
      selectedCustomer?.email &&
      !estimateEmailTo.trim()
    ) {
      setEstimateEmailTo(selectedCustomer.email)
    }
  }, [estimateEmailTo, selectedCustomer])

  function updateProjectField<
    Field extends keyof ProjectForm,
  >(field: Field, value: ProjectForm[Field]) {
    setProjectForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  function handleSelectCustomer(customerId: string) {
    const isDifferentCustomer =
      customerId !== selectedCustomerId

    setSelectedCustomerId(customerId)

    const customer = customers.find(
      (item) => item.id === customerId,
    )

    if (!customer) {
      return
    }

    const customerAddress = [
      customer.address,
      customer.city,
      customer.state,
      customer.zipCode,
    ]
      .filter(Boolean)
      .join(', ')

    setProjectForm((currentForm) => ({
      ...defaultProjectForm,
      salesperson: currentForm.salesperson,
      projectName: `${customer.firstName} ${customer.lastName}`,
      projectAddress: customerAddress,
    }))

    if (isDifferentCustomer) {
      setEstimateNumber(null)
      setOpenings([])

      setDiscounts(
        defaultDiscounts.map((discount) => ({
          ...discount,
        })),
      )

      setSelectedFinancingId('cash')
      setDownPayment(0)
    }
  }

  function ensureEstimateNumber() {
    if (estimateNumber) {
      return estimateNumber
    }

    const nextEstimateNumber = createNextEstimateNumber()

    setEstimateNumber(nextEstimateNumber)

    saveCompleteQuoteDraft(
      nextEstimateNumber,
      selectedCustomerId,
      projectForm,
      openings,
      discounts,
      selectedFinancingId,
      downPayment,
    )

    return nextEstimateNumber
  }

  function saveQuoteToHistory(
    status: QuoteStatus,
    disposition: AppointmentDisposition | null =
      appointmentDisposition,
  ) {
    const assignedEstimateNumber =
      ensureEstimateNumber()

    const customerName = selectedCustomer
      ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
      : 'Customer'

    const now = new Date().toISOString()
    const existingQuote = loadStoredQuotes().find(
      (quote) =>
        quote.estimateNumber === assignedEstimateNumber,
    )

    const storedQuote: StoredQuote = {
      id: existingQuote?.id ?? assignedEstimateNumber,
      estimateNumber: assignedEstimateNumber,
      customerId: selectedCustomerId,
      customerName,
      customerEmail: selectedCustomer?.email ?? '',
      customerPhone: selectedCustomer?.phone ?? '',
      projectForm,
      openings,
      discounts,
      selectedFinancingId,
      downPayment,
      retailPrice,
      discountTotal,
      projectTotal,
      status,
      appointmentDisposition: disposition,
      createdAt: existingQuote?.createdAt ?? now,
      updatedAt: now,
    }

    upsertStoredQuote(storedQuote)
    handleSaveQuote()

    return storedQuote
  }

  async function handleSendQuote() {
    const storedQuote = saveQuoteToHistory('Sent')

    setQuoteActionMessage(
      `${storedQuote.estimateNumber} was saved in Quotes and marked as Sent.`,
    )

    await createEstimatePdf()
  }

  function handleCloseAppointment(
    disposition: AppointmentDisposition,
  ) {
    const status: QuoteStatus =
      disposition === 'Sale' ? 'Accepted' : 'Sent'

    const storedQuote = saveQuoteToHistory(
      status,
      disposition,
    )

    setAppointmentDisposition(disposition)
    setIsAppointmentModalOpen(false)
    setQuoteActionMessage(
      `${storedQuote.estimateNumber} saved with appointment result: ${disposition}.`,
    )
  }

  function handleOrderNow() {
    const storedQuote = saveQuoteToHistory(
      'Converted to Contract',
      'Sale',
    )

    // Siempre comenzar un contrato completamente nuevo
    localStorage.removeItem(
      'cronus_contract_draft_v1',
    )

    localStorage.removeItem(
      'cronus_active_completed_contract_v1',
    )

    const contractDraft = {
      ...storedQuote,
      contractNumber: `CON-${storedQuote.estimateNumber}`,
      contractStatus: 'Draft',
      convertedAt: new Date().toISOString(),
    }

    localStorage.setItem(
      contractHandoffStorageKey,
      JSON.stringify(contractDraft),
    )

    navigate('/portal/contracts/new')
  }

  const estimateProductRows = useMemo(
    () =>
      openings.flatMap((opening) =>
        opening.products.map((product) => ({
          id: product.id,
          openingNumber: opening.openingNumber,
          location: opening.location,
          category: product.productCategory,
          width: product.width,
          height: product.height,
          impact: opening.impact,
          price: calculateProductPrice(
            opening,
            product,
          ),
        })),
      ),
    [openings],
  )

  const estimateDiscountRows = useMemo(
    () =>
      discountBreakdown.map((item) => ({
        id: item.discount.id,
        name: item.discount.name,
        amount: item.discountAmount,
      })),
    [discountBreakdown],
  )

  async function createEstimatePdf() {
    if (isGeneratingEstimatePdf) {
      return
    }

    handleSaveQuote()
    setIsGeneratingEstimatePdf(true)

    try {
      const assignedEstimateNumber =
        ensureEstimateNumber()

      const customerName = selectedCustomer
        ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
        : 'Customer'

      const document = (
        <EstimatePDF
          estimateNumber={assignedEstimateNumber}
          estimateDate={new Date().toLocaleDateString(
            'en-US',
          )}
          customer={{
            name: customerName,
            email: selectedCustomer?.email || '',
            phone: selectedCustomer?.phone || '',
          }}
          project={{
            name: projectForm.projectName,
            address: projectForm.projectAddress,
            salesperson: projectForm.salesperson,
          }}
          products={estimateProductRows.map((product) => {
            const promotionalPrice =
              retailPrice > 0
                ? product.price *
                (projectTotal / retailPrice)
                : product.price

            return {
              ...product,
              promotionalPrice,
              savings: Math.max(
                0,
                product.price - promotionalPrice,
              ),
            }
          })}
          discounts={estimateDiscountRows}
          windowCount={windowCount}
          doorCount={doorCount}
          retailPrice={retailPrice}
          discountTotal={discountTotal}
          discountPercentage={totalDiscountPercentage}
          projectTotal={projectTotal}
        />
      )

      const blob = await pdf(document).toBlob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = window.document.createElement('a')

      anchor.href = objectUrl
      anchor.download = `${assignedEstimateNumber}.pdf`
      window.document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()

      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl)
      }, 1000)
    } catch (error) {
      console.error(
        'Unable to generate estimate PDF:',
        error,
      )

      window.alert(
        'The estimate PDF could not be generated. Please try again.',
      )
    } finally {
      setIsGeneratingEstimatePdf(false)
    }
  }

  function prepareEstimateEmail() {
    const assignedEstimateNumber =
      ensureEstimateNumber()

    handleSaveQuote()

    const customerName = selectedCustomer
      ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
      : 'Customer'

    const body = [
      estimateEmailMessage,
      '',
      `Estimate: ${assignedEstimateNumber}`,
      `Customer: ${customerName}`,
      `Project: ${projectForm.projectName}`,
      `Project total: ${formatCurrency(projectTotal)}`,
      '',
      `Attach the downloaded file: ${assignedEstimateNumber}.pdf`,
    ].join('\\n')

    const mailtoUrl = `mailto:${encodeURIComponent(
      estimateEmailTo,
    )}?subject=${encodeURIComponent(
      estimateEmailSubject,
    )}&body=${encodeURIComponent(body)}`

    window.location.href = mailtoUrl
  }

  const canContinue =
    Boolean(selectedCustomer) &&
    projectForm.projectName.trim().length > 0 &&
    projectForm.projectAddress.trim().length > 0

  return (
    <section className="px-5 py-9 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Quotes
            </p>

            <h1 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              New quote
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#888888]">
              Select a customer and enter the basic project
              information before adding windows and doors.
            </p>
          </div>

          <Link
            to="/portal/quotes"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#D8D4CB] bg-white px-5 text-sm font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#9A8258]"
          >
            Back to quotes
          </Link>
        </div>

        <div className="mt-10 grid gap-7 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[24px] border border-[#E8E5DE] bg-white p-6 sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
                  Step 1
                </p>

                <h2 className="mt-3 text-2xl font-light text-[#444444]">
                  Select customer
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#999999]">
                  Choose the customer connected to this
                  estimate.
                </p>
              </div>

              <Link
                to="/portal/customers"
                className="shrink-0 text-sm font-medium text-[#9A8258] transition hover:text-[#222222]"
              >
                New customer
              </Link>
            </div>

            <div className="mt-7">
              <label
                htmlFor="customer-search"
                className="text-sm font-medium text-[#666666]"
              >
                Search customers
              </label>

              <input
                id="customer-search"
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by name, phone or email..."
                className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
              />
            </div>

            <div className="mt-5 max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {filteredCustomers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D8D4CB] bg-[#FAF9F6] px-5 py-10 text-center">
                  <p className="text-sm font-medium text-[#666666]">
                    No customers found
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#999999]">
                    Try another search or create a new
                    customer record.
                  </p>
                </div>
              ) : (
                filteredCustomers.map((customer) => {
                  const isSelected =
                    customer.id === selectedCustomerId

                  const fullName = [
                    customer.firstName,
                    customer.lastName,
                  ]
                    .filter(Boolean)
                    .join(' ')

                  const location = [
                    customer.city,
                    customer.state,
                  ]
                    .filter(Boolean)
                    .join(', ')

                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() =>
                        handleSelectCustomer(customer.id)
                      }
                      className={`w-full rounded-2xl border p-5 text-left transition ${isSelected
                        ? 'border-[#B59A68] bg-[#F8F4EB]'
                        : 'border-[#E8E5DE] bg-white hover:border-[#CFC8BA] hover:bg-[#FAF9F6]'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <p className="text-base font-medium text-[#444444]">
                            {fullName}
                          </p>

                          <p className="mt-1 text-sm text-[#888888]">
                            {customer.email ||
                              'No email provided'}
                          </p>

                          <p className="mt-1 text-sm text-[#999999]">
                            {customer.phone ||
                              'No phone provided'}
                          </p>

                          {location && (
                            <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#A39783]">
                              {location}
                            </p>
                          )}
                        </div>

                        <span
                          className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border ${isSelected
                            ? 'border-[#B59A68] bg-[#B59A68]'
                            : 'border-[#D6D1C7] bg-white'
                            }`}
                        >
                          {isSelected && (
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
                })
              )}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#E8E5DE] bg-white p-6 sm:p-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
                Step 2
              </p>

              <h2 className="mt-3 text-2xl font-light text-[#444444]">
                Project information
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#999999]">
                Add the project details that will appear on
                the quote.
              </p>
            </div>

            {selectedCustomer ? (
              <div className="mt-7 rounded-2xl border border-[#E4DFD5] bg-[#FAF8F3] p-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#A58C60]">
                  Selected customer
                </p>

                <p className="mt-2 text-lg font-medium text-[#444444]">
                  {selectedCustomer.firstName}{' '}
                  {selectedCustomer.lastName}
                </p>

                <p className="mt-1 text-sm text-[#888888]">
                  {selectedCustomer.email ||
                    'No email provided'}
                </p>

                <p className="mt-1 text-sm text-[#888888]">
                  {selectedCustomer.phone ||
                    'No phone provided'}
                </p>
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-dashed border-[#D8D4CB] bg-[#FAF9F6] px-5 py-8 text-center">
                <p className="text-sm text-[#888888]">
                  Select a customer to begin.
                </p>
              </div>
            )}

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <FormField
                label="Project name"
                value={projectForm.projectName}
                placeholder="Smith Residence"
                onChange={(value) =>
                  updateProjectField('projectName', value)
                }
              />

              <FormField
                label="Salesperson"
                value={projectForm.salesperson}
                placeholder="Salesperson name"
                onChange={(value) =>
                  updateProjectField('salesperson', value)
                }
              />

              <div className="sm:col-span-2">
                <FormField
                  label="Project address"
                  value={projectForm.projectAddress}
                  placeholder="Street, city, state and ZIP code"
                  onChange={(value) =>
                    updateProjectField(
                      'projectAddress',
                      value,
                    )
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="lead-source"
                  className="text-sm font-medium text-[#666666]"
                >
                  Lead source
                </label>

                <select
                  id="lead-source"
                  value={projectForm.leadSource}
                  onChange={(event) =>
                    updateProjectField(
                      'leadSource',
                      event.target.value,
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
                >
                  <option value="">Select source</option>
                  <option value="Referral">Referral</option>
                  <option value="Website">Website</option>
                  <option value="Social Media">
                    Social Media
                  </option>
                  <option value="Home Show">
                    Home Show
                  </option>
                  <option value="Repeat Customer">
                    Repeat Customer
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ToggleCard
                  label="Permit"
                  checked={projectForm.permitRequired}
                  onChange={(checked) =>
                    updateProjectField(
                      'permitRequired',
                      checked,
                    )
                  }
                />

                <ToggleCard
                  label="HOA"
                  checked={projectForm.hoaRequired}
                  onChange={(checked) =>
                    updateProjectField(
                      'hoaRequired',
                      checked,
                    )
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="project-notes"
                  className="text-sm font-medium text-[#666666]"
                >
                  Project notes
                </label>

                <textarea
                  id="project-notes"
                  value={projectForm.notes}
                  onChange={(event) =>
                    updateProjectField(
                      'notes',
                      event.target.value,
                    )
                  }
                  placeholder="Add customer preferences, project details or special instructions..."
                  rows={5}
                  className="mt-2 w-full resize-none rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 py-3 text-sm leading-6 text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-between gap-4 border-t border-[#ECE8DF] pt-6 sm:flex-row sm:items-center">
              <p className="text-sm text-[#999999]">
                Next: add openings, windows and doors.
              </p>

              <div className="flex items-center gap-3">
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#999999]">
                  {saveStatus === 'saving'
                    ? 'Saving...'
                    : 'Saved'}
                </span>

                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={handleSaveQuote}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#222222] px-7 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-[#B59A68] disabled:bg-[#D8D5CE] disabled:text-[#A8A39A]"
                >
                  Save quote
                </button>
              </div>
            </div>
          </section>
        </div>

        {canContinue && (
          <section className="mt-8 rounded-[24px] border border-[#E8E5DE] bg-white p-6 sm:p-8">
            <div className="mb-7 flex flex-col justify-between gap-4 border-b border-[#ECE8DF] pb-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
                  Step 3
                </p>

                <h2 className="mt-3 text-2xl font-light text-[#444444]">
                  Opening schedule
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#999999]">
                  Add all windows and doors for this quote.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-[#888888]">
                  {openings.length}{' '}
                  {openings.length === 1
                    ? 'opening'
                    : 'openings'}
                </span>

                <button
                  type="button"
                  onClick={handleSaveQuote}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#D8D4CB] bg-white px-5 text-sm font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#9A8258]"
                >
                  Save quote
                </button>
              </div>
            </div>

            <OpeningManager
              embedded
              initialOpenings={openings}
              onOpeningsChange={setOpenings}
              onSaveQuote={setOpenings}
            />

            <div className="mt-8 flex justify-end border-t border-[#ECE8DF] pt-7">
              <button
                type="button"
                disabled={totalProducts === 0}
                onClick={scrollToPricing}
                className="inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-[#222222] px-8 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-[#B59A68] disabled:cursor-not-allowed disabled:bg-[#D8D5CE] disabled:text-[#A8A39A]"
              >
                <span className="text-2xl font-light">$</span>
                Continue to pricing
              </button>
            </div>
          </section>
        )}

        {canContinue && totalProducts > 0 && (
          <>
            <section
              id="quote-pricing"
              className="scroll-mt-6 mt-8 rounded-[24px] border border-[#E8E5DE] bg-white p-6 sm:p-8"
            >
              <div className="flex flex-col justify-between gap-5 border-b border-[#ECE8DF] pb-6 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
                    Step 4
                  </p>

                  <h2 className="mt-3 text-3xl font-light text-[#444444]">
                    Pricing
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#999999]">
                    Review retail pricing and apply project discounts.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <SummaryPill
                    label="Windows"
                    value={String(windowCount)}
                  />
                  <SummaryPill
                    label="Doors"
                    value={String(doorCount)}
                  />
                  <SummaryPill
                    label="Total"
                    value={String(totalProducts)}
                  />
                </div>
              </div>

              <div className="mt-8 grid gap-7 xl:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="rounded-[22px] bg-[#1C2D36] p-7 text-white sm:p-9">
                    <p className="text-sm uppercase tracking-[0.18em] text-white/65">
                      Retail price
                    </p>

                    <p className="mt-4 text-5xl font-light tracking-[-0.04em]">
                      {formatCurrency(retailPrice)}
                    </p>

                    <p className="mt-3 text-sm text-white/60">
                      Before discounts and financing.
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                      <div>
                        <h3 className="text-xl font-medium text-[#444444]">
                          Discounts
                        </h3>

                        <p className="mt-1 text-sm text-[#999999]">
                          Select a discount to add. Discounts are calculated sequentially.
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#D9C69E] bg-[#FBF7EE] px-5 py-3 text-center">
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#9A8258]">
                          Total discount
                        </p>

                        <p className="mt-1 text-xl font-medium text-[#9A8258]">
                          {totalDiscountPercentage.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_140px]">
                      <select
                        value={selectedDiscountToAdd}
                        onChange={(event) =>
                          setSelectedDiscountToAdd(
                            event.target.value,
                          )
                        }
                        className="h-12 rounded-xl border border-[#DEDAD1] bg-white px-4 text-sm text-[#555555] outline-none transition focus:border-[#B59A68]"
                      >
                        <option value="">
                          Select a discount to add
                        </option>

                        {discounts
                          .filter(
                            (discount) => !discount.active,
                          )
                          .map((discount) => (
                            <option
                              key={discount.id}
                              value={discount.id}
                            >
                              {discount.name}
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        disabled={!selectedDiscountToAdd}
                        onClick={addSelectedDiscount}
                        className="h-12 rounded-xl bg-[#B59A68] px-6 text-sm font-medium text-white transition hover:bg-[#9A8258] disabled:cursor-not-allowed disabled:bg-[#D8D5CE]"
                      >
                        Add
                      </button>
                    </div>

                    {activeDiscounts.length > 0 ? (
                      <div className="mt-5 space-y-3">
                        {discountBreakdown.map(
                          (breakdown, index) => (
                            <DiscountRow
                              key={breakdown.discount.id}
                              sequence={index + 1}
                              discount={breakdown.discount}
                              previousPrice={
                                breakdown.previousPrice
                              }
                              resultingPrice={
                                breakdown.resultingPrice
                              }
                              bogoPairs={
                                breakdown.bogoPairs
                              }
                              onChange={(updates) =>
                                updateDiscount(
                                  breakdown.discount.id,
                                  updates,
                                )
                              }
                              onRemove={() =>
                                removeDiscount(
                                  breakdown.discount.id,
                                )
                              }
                            />
                          ),
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={clearAllDiscounts}
                            className="text-sm font-medium text-[#9A8258] transition hover:text-[#222222]"
                          >
                            Clear all discounts
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl border border-dashed border-[#D8D4CB] bg-[#FAF9F6] px-5 py-8 text-center">
                        <p className="text-sm text-[#888888]">
                          No discounts have been added.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <aside className="rounded-[22px] border border-[#E6E1D7] bg-[#FAF9F6] p-6 sm:p-8">
                  <h3 className="text-xl font-medium text-[#444444]">
                    Project total
                  </h3>

                  <div className="mt-7 space-y-5">
                    <PriceLine
                      label="Retail price"
                      value={formatCurrency(retailPrice)}
                    />

                    <PriceLine
                      label={`Discounts (${totalDiscountPercentage.toFixed(
                        2,
                      )}%)`}
                      value={`-${formatCurrency(
                        discountTotal,
                      )}`}
                      muted
                    />

                    <div className="border-t border-[#DDD7CC] pt-5">
                      <PriceLine
                        label="Total project"
                        value={formatCurrency(projectTotal)}
                        emphasized
                      />
                    </div>

                    <p className="text-xs leading-5 text-[#999999]">
                      Installation is included in the configured product pricing.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById('quote-estimate')
                        ?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        })
                    }
                    className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-xl bg-[#222222] px-6 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-[#B59A68]"
                  >
                    Continue to estimate
                  </button>
                </aside>
              </div>
            </section>

            <section
              id="quote-estimate"
              className="scroll-mt-6 mt-8 rounded-[24px] border border-[#E8E5DE] bg-white p-6 sm:p-8"
            >
              <div className="flex flex-col justify-between gap-5 border-b border-[#ECE8DF] pb-6 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
                    Step 6
                  </p>

                  <h2 className="mt-3 text-3xl font-light text-[#444444]">
                    Estimate
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#999999]">
                    Create the customer estimate before applying for financing.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F3EFE6] px-6 py-4 text-right">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#9A8258]">
                    Estimate total
                  </p>

                  <p className="mt-1 text-3xl font-light text-[#333333]">
                    {formatCurrency(projectTotal)}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-[22px] border border-[#E6E1D7] bg-[#FAF9F6] p-6 sm:p-8">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9A8258]">
                    Estimate number
                  </p>

                  <p className="mt-2 text-xl font-medium text-[#444444]">
                    {estimateNumber ??
                      'Assigned when PDF is created'}
                  </p>

                  <div className="mt-6 space-y-3 border-t border-[#E1DCD2] pt-5">
                    <PriceLine
                      label="Windows"
                      value={String(windowCount)}
                    />

                    <PriceLine
                      label="Doors"
                      value={String(doorCount)}
                    />

                    <PriceLine
                      label={`Discounts (${totalDiscountPercentage.toFixed(
                        2,
                      )}%)`}
                      value={`-${formatCurrency(
                        discountTotal,
                      )}`}
                      muted
                    />

                    <PriceLine
                      label="Estimate total"
                      value={formatCurrency(projectTotal)}
                      emphasized
                    />
                  </div>

                  <button
                    type="button"
                    onClick={createEstimatePdf}
                    disabled={isGeneratingEstimatePdf}
                    className="mt-7 inline-flex h-14 w-full items-center justify-center rounded-xl bg-[#222222] px-6 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-[#B59A68] disabled:cursor-wait disabled:bg-[#777777]"
                  >
                    {isGeneratingEstimatePdf
                      ? 'Creating PDF...'
                      : 'Create estimate PDF'}
                  </button>

                  <p className="mt-3 text-xs leading-5 text-[#999999]">
                    A real PDF file will be generated and downloaded
                    directly to your computer.
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#E6E1D7] bg-white p-6 sm:p-8">
                  <h3 className="text-xl font-medium text-[#444444]">
                    Email estimate
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#999999]">
                    Prepare the email using the customer’s saved email address.
                  </p>

                  <div className="mt-6 space-y-5">
                    <div>
                      <label
                        htmlFor="estimate-email-to"
                        className="text-sm font-medium text-[#666666]"
                      >
                        Recipient
                      </label>

                      <input
                        id="estimate-email-to"
                        type="email"
                        value={estimateEmailTo}
                        onChange={(event) =>
                          setEstimateEmailTo(
                            event.target.value,
                          )
                        }
                        placeholder="customer@email.com"
                        className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="estimate-email-subject"
                        className="text-sm font-medium text-[#666666]"
                      >
                        Subject
                      </label>

                      <input
                        id="estimate-email-subject"
                        type="text"
                        value={estimateEmailSubject}
                        onChange={(event) =>
                          setEstimateEmailSubject(
                            event.target.value,
                          )
                        }
                        className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="estimate-email-message"
                        className="text-sm font-medium text-[#666666]"
                      >
                        Message
                      </label>

                      <textarea
                        id="estimate-email-message"
                        rows={6}
                        value={estimateEmailMessage}
                        onChange={(event) =>
                          setEstimateEmailMessage(
                            event.target.value,
                          )
                        }
                        className="mt-2 w-full resize-none rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 py-3 text-sm leading-6 text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!estimateEmailTo.trim()}
                    onClick={prepareEstimateEmail}
                    className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-xl border border-[#222222] bg-white px-6 text-sm font-medium uppercase tracking-[0.14em] text-[#222222] transition hover:bg-[#222222] hover:text-white disabled:cursor-not-allowed disabled:border-[#D8D5CE] disabled:text-[#A8A39A]"
                  >
                    Prepare email
                  </button>

                  <p className="mt-3 text-xs leading-5 text-[#999999]">
                    Save the PDF first, then attach it in your email application.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end border-t border-[#ECE8DF] pt-7">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById('quote-financing')
                      ?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                  }
                  className="inline-flex h-14 items-center justify-center rounded-xl bg-[#222222] px-8 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-[#B59A68]"
                >
                  Continue to financing
                </button>
              </div>
            </section>

            <section
              id="quote-financing"
              className="scroll-mt-6 mt-8 rounded-[24px] border border-[#E8E5DE] bg-white p-6 sm:p-8"
            >
              <div className="flex flex-col justify-between gap-5 border-b border-[#ECE8DF] pb-6 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
                    Step 5
                  </p>

                  <h2 className="mt-3 text-3xl font-light text-[#444444]">
                    Financing
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#999999]">
                    Open Acorn Finance, then return and record the approved option.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F3EFE6] px-6 py-4 text-right">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#9A8258]">
                    Project investment
                  </p>

                  <p className="mt-1 text-3xl font-light text-[#333333]">
                    {formatCurrency(projectTotal)}
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-[22px] border border-[#D9C69E] bg-[#FBF7EE] p-6 sm:p-8">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9A8258]">
                      Customer financing
                    </p>

                    <h3 className="mt-2 text-2xl font-light text-[#333333]">
                      Apply through Acorn Finance
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#777777]">
                      Acorn will open in a new tab. After the customer is approved,
                      return to Cronus and select or enter the approved financing option.
                    </p>
                  </div>

                  <a
                    href="https://www.acornfinance.com/"
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleSaveQuote}
                    className="inline-flex h-14 shrink-0 items-center justify-center rounded-xl bg-[#B59A68] px-8 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-[#9A8258]"
                  >
                    Open Acorn application
                  </a>
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
                <div className="rounded-[22px] border border-[#E6E1D7] bg-[#FAF9F6] p-6">
                  <label
                    htmlFor="down-payment"
                    className="text-sm font-medium text-[#666666]"
                  >
                    Down payment
                  </label>

                  <div className="mt-2 flex h-14 items-center rounded-xl border border-[#DEDAD1] bg-white px-4">
                    <span className="mr-2 text-lg text-[#888888]">
                      $
                    </span>

                    <input
                      id="down-payment"
                      type="number"
                      min="0"
                      max={projectTotal}
                      value={downPayment}
                      onChange={(event) =>
                        setDownPayment(
                          Math.max(
                            0,
                            Number(event.target.value) || 0,
                          ),
                        )
                      }
                      className="h-full w-full bg-transparent text-lg text-[#444444] outline-none"
                    />
                  </div>

                  <div className="mt-6 space-y-4 border-t border-[#E1DCD2] pt-5">
                    <PriceLine
                      label="Project total"
                      value={formatCurrency(projectTotal)}
                    />

                    <PriceLine
                      label="Down payment"
                      value={`-${formatCurrency(
                        safeDownPayment,
                      )}`}
                      muted
                    />

                    <PriceLine
                      label="Balance"
                      value={formatCurrency(financedBalance)}
                      emphasized
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FinancingCard
                    title="Cash / Check"
                    subtitle="50% at signing"
                    detail={`${formatCurrency(
                      projectTotal / 2,
                    )} initial payment`}
                    selected={
                      selectedFinancingId === 'cash'
                    }
                    onClick={() =>
                      setSelectedFinancingId('cash')
                    }
                  />

                  <FinancingCard
                    title="5.99% APR"
                    subtitle="120 months"
                    detail={`${formatCurrency(
                      calculateMonthlyPayment(
                        financedBalance,
                        5.99,
                        120,
                      ),
                    )} per month`}
                    selected={
                      selectedFinancingId ===
                      '120-months'
                    }
                    onClick={() =>
                      setSelectedFinancingId(
                        '120-months',
                      )
                    }
                  />

                  <FinancingCard
                    title="No Interest"
                    subtitle="No payments for 24 months"
                    detail="$0 during promotional period"
                    selected={
                      selectedFinancingId === 'deferred'
                    }
                    onClick={() =>
                      setSelectedFinancingId('deferred')
                    }
                  />

                  <FinancingCard
                    title="Custom Financing"
                    subtitle="Customer-selected plan"
                    detail="Enter final terms in the proposal"
                    selected={
                      selectedFinancingId === 'custom'
                    }
                    onClick={() =>
                      setSelectedFinancingId('custom')
                    }
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col justify-between gap-4 border-t border-[#ECE8DF] pt-7 sm:flex-row sm:items-center">
                <p className="text-sm text-[#999999]">
                  Selected option:{' '}
                  <span className="font-medium text-[#555555]">
                    {selectedFinancingId === 'cash'
                      ? 'Cash / Check'
                      : selectedFinancingId ===
                        '120-months'
                        ? '5.99% APR — 120 months'
                        : selectedFinancingId ===
                          'deferred'
                          ? 'No interest / no payments'
                          : 'Custom financing'}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={handleSaveQuote}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#222222] px-7 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-[#B59A68]"
                >
                  Save pricing & financing
                </button>
              </div>
            </section>

            <section className="mt-8 rounded-[24px] border border-[#E8E5DE] bg-white p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-5 border-b border-[#ECE8DF] pb-6 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
                    Final actions
                  </p>

                  <h2 className="mt-3 text-3xl font-light text-[#444444]">
                    Complete the appointment
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#999999]">
                    Send the estimate for follow-up, close the appointment with a disposition, or continue directly to the contract.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F3EFE6] px-6 py-4 text-right">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#9A8258]">
                    Project total
                  </p>

                  <p className="mt-1 text-3xl font-light text-[#333333]">
                    {formatCurrency(projectTotal)}
                  </p>
                </div>
              </div>

              {quoteActionMessage && (
                <div className="mt-6 rounded-xl border border-[#D8E8DC] bg-[#F4FAF5] px-5 py-4 text-sm text-[#477050]">
                  {quoteActionMessage}
                </div>
              )}

              <div className="mt-7 grid gap-4 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={handleSendQuote}
                  disabled={
                    !canContinue ||
                    openings.length === 0 ||
                    isGeneratingEstimatePdf
                  }
                  className="inline-flex min-h-16 items-center justify-center rounded-xl border border-[#222222] bg-white px-6 text-sm font-medium uppercase tracking-[0.13em] text-[#222222] transition hover:bg-[#222222] hover:text-white disabled:cursor-not-allowed disabled:border-[#D8D5CE] disabled:text-[#AAA69E]"
                >
                  {isGeneratingEstimatePdf
                    ? 'Creating estimate...'
                    : 'Send quote'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsAppointmentModalOpen(true)
                  }
                  disabled={!estimateNumber}
                  className="inline-flex min-h-16 items-center justify-center rounded-xl border border-[#B59A68] bg-[#F7F2E8] px-6 text-sm font-medium uppercase tracking-[0.13em] text-[#8A7044] transition hover:bg-[#EEE3CF] disabled:cursor-not-allowed disabled:border-[#DEDAD1] disabled:bg-[#FAF9F6] disabled:text-[#AAA69E]"
                >
                  Close appointment
                </button>

                <button
                  type="button"
                  onClick={handleOrderNow}
                  disabled={
                    !canContinue || openings.length === 0
                  }
                  className="inline-flex min-h-16 items-center justify-center rounded-xl bg-[#0A7A43] px-6 text-sm font-medium uppercase tracking-[0.13em] text-white transition hover:bg-[#086437] disabled:cursor-not-allowed disabled:bg-[#A8BDB1]"
                >
                  Order now!
                </button>
              </div>

              <p className="mt-4 text-center text-xs leading-5 text-[#999999]">
                Order Now automatically records the appointment as Sale and starts the contract.
              </p>
            </section>

          </>
        )}
      </div>

      {isAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5 py-8">
          <div className="w-full max-w-xl rounded-[24px] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
                  Close appointment
                </p>

                <h2 className="mt-3 text-3xl font-light text-[#444444]">
                  Select the final disposition
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#999999]">
                  This result will be saved with {estimateNumber ?? 'the quote'}.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsAppointmentModalOpen(false)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DEDAD1] text-xl text-[#777777] transition hover:border-[#B59A68] hover:text-[#9A8258]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {(
                [
                  'Demo - No Sale',
                  'Sale',
                  'Not Home',
                  'Not Demo',
                ] as AppointmentDisposition[]
              ).map((disposition) => (
                <button
                  key={disposition}
                  type="button"
                  onClick={() =>
                    handleCloseAppointment(disposition)
                  }
                  className={`min-h-16 rounded-xl border px-5 text-sm font-medium transition ${disposition === 'Sale'
                    ? 'border-[#0A7A43] bg-[#F1F8F4] text-[#0A7A43] hover:bg-[#E5F2EA]'
                    : 'border-[#DEDAD1] bg-[#FAF9F6] text-[#555555] hover:border-[#B59A68] hover:bg-white'
                    }`}
                >
                  {disposition}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </section>
  )
}

type SummaryPillProps = {
  label: string
  value: string
}

function SummaryPill({
  label,
  value,
}: SummaryPillProps) {
  return (
    <div className="min-w-[92px] rounded-xl border border-[#E6E1D7] bg-[#FAF9F6] px-4 py-3 text-center">
      <p className="text-xs uppercase tracking-[0.12em] text-[#A19A8E]">
        {label}
      </p>

      <p className="mt-1 text-xl font-medium text-[#555555]">
        {value}
      </p>
    </div>
  )
}

type DiscountRowProps = {
  sequence: number
  discount: Discount
  previousPrice: number
  resultingPrice: number
  bogoPairs: Array<{
    paidProduct: PricedProduct & {
      adjustedPrice: number
    }
    discountedProduct: PricedProduct & {
      adjustedPrice: number
    }
    savings: number
  }>
  onChange: (updates: Partial<Discount>) => void
  onRemove: () => void
}

function DiscountRow({
  sequence,
  discount,
  previousPrice,
  resultingPrice,
  bogoPairs,
  onChange,
  onRemove,
}: DiscountRowProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#D9C69E] bg-white">
      <div className="grid gap-3 bg-[#FBF7EE] p-4 sm:grid-cols-[1fr_120px_110px_44px] sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#B59A68] text-xs font-medium text-white">
            {sequence}
          </span>

          <div>
            <p className="text-sm font-medium text-[#555555]">
              {discount.name}
            </p>

            <p className="mt-0.5 text-xs text-[#999999]">
              {discount.id === 'bogo-40'
                ? 'Automatic product pairing'
                : discount.mode === 'percent'
                  ? `${discount.value}%`
                  : formatCurrency(discount.value)}
            </p>
          </div>
        </div>

        {discount.id === 'bogo-40' ? (
          <>
            <div className="flex h-11 items-center justify-center rounded-xl border border-[#D9C69E] bg-white px-3 text-sm font-medium text-[#9A8258]">
              Automatic
            </div>

            <div className="flex h-11 items-center justify-center rounded-xl border border-[#D9C69E] bg-white px-3 text-sm font-medium text-[#9A8258]">
              40%
            </div>
          </>
        ) : (
          <>
            <select
              value={discount.mode}
              onChange={(event) =>
                onChange({
                  mode:
                    event.target.value as DiscountMode,
                })
              }
              className="h-11 rounded-xl border border-[#DEDAD1] bg-white px-3 text-sm text-[#555555] outline-none focus:border-[#B59A68]"
            >
              <option value="percent">Percent</option>
              <option value="fixed">Fixed $</option>
            </select>

            <div className="flex h-11 items-center rounded-xl border border-[#DEDAD1] bg-white px-3">
              <span className="mr-1 text-sm text-[#999999]">
                {discount.mode === 'percent'
                  ? '%'
                  : '$'}
              </span>

              <input
                type="number"
                min="0"
                value={discount.value}
                onChange={(event) =>
                  onChange({
                    value: Math.max(
                      0,
                      Number(event.target.value) || 0,
                    ),
                  })
                }
                className="w-full bg-transparent text-right text-sm text-[#555555] outline-none"
              />
            </div>
          </>
        )}

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${discount.name}`}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#F0C8C2] bg-[#FFF3F1] text-lg text-[#C65F52] transition hover:bg-[#FBE4E0]"
        >
          ×
        </button>
      </div>

      <div className="space-y-3 px-5 py-4">
        <PriceLine
          label={
            sequence === 1
              ? 'Retail price'
              : 'Previous amount'
          }
          value={formatCurrency(previousPrice)}
        />

        <PriceLine
          label={`After ${discount.name}${discount.id !== 'bogo-40' &&
            discount.mode === 'percent'
            ? ` (${discount.value}%)`
            : ''
            }`}
          value={formatCurrency(resultingPrice)}
          emphasized
        />

        {discount.id === 'bogo-40' && (
          <details className="rounded-xl border border-[#E6E1D7] bg-[#FAF9F6]">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-[#555555]">
              View BOGO pairing details
            </summary>

            <div className="space-y-3 border-t border-[#E6E1D7] px-4 py-4">
              {bogoPairs.length > 0 ? (
                bogoPairs.map((pair, index) => (
                  <div
                    key={`${pair.paidProduct.id}-${pair.discountedProduct.id}`}
                    className="rounded-xl bg-white p-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#A19A8E]">
                      Pair {index + 1}
                    </p>

                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-[#666666]">
                          {pair.paidProduct.openingNumber}{' '}
                          {pair.paidProduct.productCategory}
                        </span>
                        <span className="font-medium text-[#555555]">
                          {formatCurrency(
                            pair.paidProduct.adjustedPrice,
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-[#666666]">
                          {pair.discountedProduct.openingNumber}{' '}
                          {pair.discountedProduct.productCategory}
                          {' — 40% off'}
                        </span>
                        <span className="font-medium text-[#A06D61]">
                          -
                          {formatCurrency(pair.savings)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#888888]">
                  At least two priced products are required.
                </p>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

type PriceLineProps = {
  label: string
  value: string
  muted?: boolean
  emphasized?: boolean
}

function PriceLine({
  label,
  value,
  muted = false,
  emphasized = false,
}: PriceLineProps) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span
        className={
          emphasized
            ? 'text-base font-medium text-[#333333]'
            : 'text-sm text-[#777777]'
        }
      >
        {label}
      </span>

      <span
        className={
          emphasized
            ? 'text-2xl font-medium text-[#222222]'
            : muted
              ? 'text-base font-medium text-[#A06D61]'
              : 'text-base font-medium text-[#555555]'
        }
      >
        {value}
      </span>
    </div>
  )
}

type FinancingCardProps = {
  title: string
  subtitle: string
  detail: string
  selected: boolean
  onClick: () => void
}

function FinancingCard({
  title,
  subtitle,
  detail,
  selected,
  onClick,
}: FinancingCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[210px] rounded-[22px] border p-6 text-left transition ${selected
        ? 'border-[#B59A68] bg-[#F8F4EB] shadow-sm'
        : 'border-[#E6E1D7] bg-white hover:border-[#CFC7B7]'
        }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full border ${selected
            ? 'border-[#B59A68] bg-[#B59A68]'
            : 'border-[#D6D1C7] bg-white'
            }`}
        >
          {selected && (
            <span className="text-xs text-white">✓</span>
          )}
        </span>

        <span className="text-2xl font-light text-[#9A8258]">
          $
        </span>
      </div>

      <h3 className="mt-8 text-2xl font-light text-[#333333]">
        {title}
      </h3>

      <p className="mt-2 text-base text-[#666666]">
        {subtitle}
      </p>

      <p className="mt-6 text-sm font-medium text-[#444444]">
        {detail}
      </p>
    </button>
  )
}

type FormFieldProps = {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}

function FormField({
  label,
  value,
  placeholder,
  onChange,
}: FormFieldProps) {
  const inputId = label
    .toLowerCase()
    .replaceAll(' ', '-')

  return (
    <div>
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-[#666666]"
      >
        {label}
      </label>

      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
      />
    </div>
  )
}

type ToggleCardProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleCard({
  label,
  checked,
  onChange,
}: ToggleCardProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex h-12 items-center justify-between rounded-xl border px-4 text-sm font-medium transition ${checked
        ? 'border-[#B59A68] bg-[#F8F4EB] text-[#7F6B47]'
        : 'border-[#DEDAD1] bg-[#FAF9F6] text-[#777777] hover:border-[#C9C2B5]'
        }`}
    >
      <span>{label}</span>

      <span
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-[#B59A68]' : 'bg-[#D5D1C8]'
          }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? 'left-6' : 'left-1'
            }`}
        />
      </span>
    </button>
  )
}