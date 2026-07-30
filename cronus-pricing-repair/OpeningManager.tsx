import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'

import doubleHungImage from '../assets/windows/double-hung.png'
import casementImage from '../assets/windows/casement.png'
import slidingImage from '../assets/windows/sliding.png'
import pictureImage from '../assets/windows/picture.png'
import { pricingConfig } from '../data/pricing'
import { calculateCoreProductPrice } from '../services/pricingService'

type ProductCategory =
  | 'Single Hung'
  | 'Sliding'
  | 'Picture'
  | 'Casement'
  | 'Awning'
  | 'Sliding Door'
  | 'French Door'
  | 'Entry Door'
  | 'Transom'
  | 'Shape'

type GlassType =
  | 'Clear'
  | 'Low-E'
  | 'Tinted'
  | 'Laminated'
  | 'Other'

type ColorOption =
  | 'White'
  | 'Bronze'
  | 'Black'
  | 'Almond'
  | 'Custom'

type YesNoOption = 'Yes' | 'No'

type SwingDirection =
  | 'In Swing'
  | 'Out Swing'
  | 'Not Applicable'

type DoorHanding =
  | 'Left Hand'
  | 'Right Hand'
  | 'Left Hand Reverse'
  | 'Right Hand Reverse'
  | 'Not Applicable'

type SillOption =
  | 'Standard'
  | 'Low Profile'
  | 'ADA'
  | 'Bronze'
  | 'Custom'

type HardwareFinish =
  | 'White'
  | 'Black'
  | 'Bronze'
  | 'Satin Nickel'
  | 'Oil-Rubbed Bronze'
  | 'Custom'

type OpeningProduct = {
  id: string
  label: string
  position: string
  productCategory: ProductCategory
  series: string
  model: string
  width: string
  height: string
  color: ColorOption
  glassType: GlassType
  tinted: YesNoOption
  privacyGlass: YesNoOption
  tempered: YesNoOption
  grids: YesNoOption
  gridPattern: string
  screen: YesNoOption
  swingDirection: SwingDirection
  doorHanding: DoorHanding
  sill: SillOption
  handleSet: string
  lockset: string
  hardwareFinish: HardwareFinish
  installation: string
  notes: string
}

export type Opening = {
  id: string
  floor: number
  sequence: number
  openingNumber: string
  location: string
  locationDetail: string
  isMulled: boolean
  unitCount: number
  impact: boolean
  mullionCharge: number
  products: OpeningProduct[]
  interiorPhotos: string[]
  exteriorPhotos: string[]
}

type ProductPriceBreakdown = {
  squareFeet: number
  ratePerSquareFoot: number
  basePrice: number
  impact: number
  tempered: number
  tinted: number
  privacyGlass: number
  grids: number
  color: number
  screenAdjustment: number
  installation: number
  total: number
}

type OpeningPriceBreakdown = {
  products: ProductPriceBreakdown[]
  productsTotal: number
  mullionCharge: number
  total: number
}

type NewOpeningForm = {
  floor: number
  location: string
  locationDetail: string
  isMulled: boolean
  unitCount: number
  impact: boolean
}

const productCategoryOptions: ProductCategory[] = [
  'Single Hung',
  'Sliding',
  'Picture',
  'Casement',
  'Awning',
  'Sliding Door',
  'French Door',
  'Entry Door',
  'Transom',
  'Shape',
]

const productImages: Record<ProductCategory, string> = {
  'Single Hung': doubleHungImage,
  'Sliding': slidingImage,
  Picture: pictureImage,
  Casement: casementImage,
  Awning: casementImage,
  'Sliding Door': slidingImage,
  'French Door': pictureImage,
  'Entry Door': pictureImage,
  Transom: pictureImage,
  Shape: pictureImage,
}

const locationOptions = [
  'Front Entry',
  'Living Room',
  'Kitchen',
  'Dining Room',
  'Bedroom',
  'Bathroom',
  'Garage',
  'Hallway',
  'Patio',
  'Other',
]

const glassOptions: GlassType[] = [
  'Clear',
  'Low-E',
  'Tinted',
  'Laminated',
  'Other',
]

const colorOptions: ColorOption[] = [
  'White',
  'Bronze',
  'Black',
  'Almond',
  'Custom',
]

const yesNoOptions: YesNoOption[] = ['No', 'Yes']

const swingDirectionOptions: SwingDirection[] = [
  'In Swing',
  'Out Swing',
  'Not Applicable',
]

const doorHandingOptions: DoorHanding[] = [
  'Left Hand',
  'Right Hand',
  'Left Hand Reverse',
  'Right Hand Reverse',
  'Not Applicable',
]

const sillOptions: SillOption[] = [
  'Standard',
  'Low Profile',
  'ADA',
  'Bronze',
  'Custom',
]

const hardwareFinishOptions: HardwareFinish[] = [
  'White',
  'Black',
  'Bronze',
  'Satin Nickel',
  'Oil-Rubbed Bronze',
  'Custom',
]

const doorProductCategories: ProductCategory[] = [
  'Sliding Door',
  'French Door',
  'Entry Door',
]

function isWindowProduct(productCategory: ProductCategory) {
  return !doorProductCategories.includes(productCategory)
}

function parseMeasurement(value: string) {
  const parsedValue = Number.parseFloat(
    value.replace(/[^0-9.]/g, ''),
  )

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0
}

function calculateProductPrice(
  product: Product,
  impact: boolean,
): ProductPriceBreakdown {
  const windowProduct = isWindowProduct(
    product.productCategory,
  )

  const corePrice = calculateCoreProductPrice({
    width: product.width,
    height: product.height,
    isDoor: !windowProduct,
    impact,
  })

  const {
    squareFeet,
    ratePerSquareFoot,
    basePrice,
    impactPrice,
  } = corePrice

  const temperedPrice =
    product.tempered === 'Yes'
      ? pricingConfig.tempered
      : 0

  const tintedPrice =
    product.tinted === 'Yes'
      ? pricingConfig.tinted
      : 0

  const privacyGlassPrice =
    product.privacyGlass === 'Yes'
      ? pricingConfig.privacyGlass
      : 0

  const gridsPrice =
    product.grids === 'Yes'
      ? pricingConfig.grids
      : 0

  const colorPrice =
    product.color === 'White'
      ? 0
      : pricingConfig.nonStandardColor

  const screenAdjustment =
    windowProduct && product.screen === 'No'
      ? -pricingConfig.screenRemovalCredit
      : 0

  const installationPrice =
    pricingConfig.installation

  const total =
    basePrice +
    impactPrice +
    temperedPrice +
    tintedPrice +
    privacyGlassPrice +
    gridsPrice +
    colorPrice +
    screenAdjustment +
    installationPrice

  return {
    squareFeet,
    ratePerSquareFoot,
    basePrice,
    impact: impactPrice,
    tempered: temperedPrice,
    tinted: tintedPrice,
    privacyGlass: privacyGlassPrice,
    grids: gridsPrice,
    color: colorPrice,
    screenAdjustment,
    installation: installationPrice,
    total,
  }
}

function calculateOpeningPrice(
  opening: Opening,
): OpeningPriceBreakdown {
  const products = opening.products.map((product) =>
    calculateProductPrice(product, opening.impact),
  )

  const productsTotal = products.reduce(
    (total, product) => total + product.total,
    0,
  )

  return {
    products,
    productsTotal,
    mullionCharge: opening.mullionCharge,
    total: productsTotal + opening.mullionCharge,
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

const quoteDraftStorageKey = 'cronus_quote_draft_v1'

type StoredQuoteDraft = {
  openings: Opening[]
  savedAt: string
}

function loadQuoteDraft(): Opening[] {
  try {
    const storedDraft = localStorage.getItem(
      quoteDraftStorageKey,
    )

    if (!storedDraft) {
      return []
    }

    const parsedDraft = JSON.parse(
      storedDraft,
    ) as StoredQuoteDraft

    return Array.isArray(parsedDraft.openings)
      ? parsedDraft.openings
      : []
  } catch {
    return []
  }
}

function writeQuoteDraft(openings: Opening[]) {
  const draft: StoredQuoteDraft = {
    openings,
    savedAt: new Date().toISOString(),
  }

  localStorage.setItem(
    quoteDraftStorageKey,
    JSON.stringify(draft),
  )
}

type OpeningManagerProps = {
  embedded?: boolean
  initialOpenings?: Opening[]
  onOpeningsChange?: React.Dispatch<React.SetStateAction<Opening[]>>
  onSaveQuote?: React.Dispatch<React.SetStateAction<Opening[]>>
}

export default function OpeningManager({
  embedded = false,
  initialOpenings,
  onOpeningsChange,
  onSaveQuote,
}: OpeningManagerProps) {
  const [openings, setOpenings] = useState<Opening[]>(() =>
    initialOpenings ?? loadQuoteDraft(),
  )

  const [selectedOpeningId, setSelectedOpeningId] =
    useState<string | null>(null)

  const [showPricing, setShowPricing] = useState(false)

  const [saveStatus, setSaveStatus] = useState<
    'saved' | 'saving'
  >('saved')

  const [form, setForm] = useState<NewOpeningForm>({
    floor: 1,
    location: 'Front Entry',
    locationDetail: '',
    isMulled: false,
    unitCount: 1,
    impact: false,
  })

  useEffect(() => {
    onOpeningsChange?.(openings)
  }, [openings, onOpeningsChange])

  useEffect(() => {
  if (!embedded) return

  setOpenings(initialOpenings ?? [])
}, [embedded, initialOpenings])

  useEffect(() => {
    if (embedded) {
      setSaveStatus('saved')
      return
    }

    setSaveStatus('saving')

    const saveTimer = window.setTimeout(() => {
      writeQuoteDraft(openings)
      setSaveStatus('saved')
    }, 300)

    return () => {
      window.clearTimeout(saveTimer)
    }
  }, [embedded, openings])

  function saveQuoteDraft() {
    if (embedded) {
      onSaveQuote?.(openings)
      onOpeningsChange?.(openings)
      setSaveStatus('saved')
      return
    }

    writeQuoteDraft(openings)
    setSaveStatus('saved')
  }

  const floors = useMemo(() => {
    const floorNumbers = openings.map(
      (opening) => opening.floor,
    )

    return Array.from(new Set(floorNumbers)).sort(
      (a, b) => a - b,
    )
  }, [openings])

  const totalProducts = openings.reduce(
    (total, opening) =>
      total + opening.products.length,
    0,
  )

  const totalMullionCharges = openings.reduce(
    (total, opening) =>
      total + opening.mullionCharge,
    0,
  )

  const openingPrices = useMemo(
    () =>
      new Map(
        openings.map((opening) => [
          opening.id,
          calculateOpeningPrice(opening),
        ]),
      ),
    [openings],
  )

  const estimatedProjectTotal = Array.from(
    openingPrices.values(),
  ).reduce(
    (total, openingPrice) =>
      total + openingPrice.total,
    0,
  )

  function updateForm<Field extends keyof NewOpeningForm>(
    field: Field,
    value: NewOpeningForm[Field],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  function getNextSequence() {
    if (openings.length === 0) {
      return 1
    }

    return (
      Math.max(
        ...openings.map(
          (opening) => opening.sequence,
        ),
      ) + 1
    )
  }

  function calculateMullionCharge(
    isMulled: boolean,
    unitCount: number,
    impact: boolean,
  ) {
    if (!isMulled || !impact) {
      return 0
    }

    if (unitCount === 2) {
      return 250
    }

    if (unitCount >= 3) {
      return 450
    }

    return 0
  }

  function createEmptyProduct(
    label: string,
    position: string,
  ): OpeningProduct {
    return {
      id: crypto.randomUUID(),
      label,
      position,
      productCategory: 'Single Hung',
      series: '',
      model: '',
      width: '',
      height: '',
      color: 'White',
      glassType: 'Clear',
      tinted: 'No',
      privacyGlass: 'No',
      tempered: 'No',
      grids: 'No',
      gridPattern: '',
      screen: 'Yes',
      swingDirection: 'Not Applicable',
      doorHanding: 'Not Applicable',
      sill: 'Standard',
      handleSet: '',
      lockset: '',
      hardwareFinish: 'Satin Nickel',
      installation: '',
      notes: '',
    }
  }

  function createProducts(
    openingNumber: string,
    unitCount: number,
    isMulled: boolean,
  ): OpeningProduct[] {
    if (!isMulled) {
      return [
        createEmptyProduct(
          openingNumber,
          'Single unit',
        ),
      ]
    }

    return Array.from(
      { length: unitCount },
      (_, index) => {
        const letter = String.fromCharCode(65 + index)

        return createEmptyProduct(
          `${openingNumber}${letter}`,
          getExteriorPosition(index, unitCount),
        )
      },
    )
  }

  function handleCreateOpening() {
    if (!form.location.trim()) {
      return
    }

    const sequence = getNextSequence()
    const openingNumber = String(
      form.floor * 100 + sequence,
    )

    const unitCount = form.isMulled
      ? Math.max(2, form.unitCount)
      : 1

    const newOpening: Opening = {
      id: crypto.randomUUID(),
      floor: form.floor,
      sequence,
      openingNumber,
      location: form.location.trim(),
      locationDetail: form.locationDetail.trim(),
      isMulled: form.isMulled,
      unitCount,
      impact: form.impact,
      mullionCharge: calculateMullionCharge(
        form.isMulled,
        unitCount,
        form.impact,
      ),
      products: createProducts(
        openingNumber,
        unitCount,
        form.isMulled,
      ),
      interiorPhotos: [],
      exteriorPhotos: [],
    }

    setOpenings((currentOpenings) => [
      ...currentOpenings,
      newOpening,
    ])

    setSelectedOpeningId(newOpening.id)

    setForm((currentForm) => ({
      ...currentForm,
      locationDetail: '',
      isMulled: false,
      unitCount: 1,
      impact: false,
    }))
  }

  function handleDeleteOpening(openingId: string) {
    setOpenings((currentOpenings) =>
      currentOpenings.filter(
        (opening) => opening.id !== openingId,
      ),
    )

    if (selectedOpeningId === openingId) {
      setSelectedOpeningId(null)
    }
  }

  function updateOpeningConfiguration(
    openingId: string,
    updates: Partial<
      Pick<
        Opening,
        | 'location'
        | 'locationDetail'
        | 'isMulled'
        | 'unitCount'
        | 'impact'
      >
    >,
  ) {
    setOpenings((currentOpenings) =>
      currentOpenings.map((opening) => {
        if (opening.id !== openingId) {
          return opening
        }

        const nextIsMulled =
          updates.isMulled ?? opening.isMulled
        const nextImpact =
          updates.impact ?? opening.impact

        let nextUnitCount =
          updates.unitCount ?? opening.unitCount

        if (!nextIsMulled) {
          nextUnitCount = 1
        } else {
          nextUnitCount = Math.max(2, nextUnitCount)
        }

        let nextProducts = opening.products

        if (!nextIsMulled) {
          const firstProduct =
            opening.products[0] ??
            createEmptyProduct(
              opening.openingNumber,
              'Single unit',
            )

          nextProducts = [
            {
              ...firstProduct,
              label: opening.openingNumber,
              position: 'Single unit',
            },
          ]
        } else {
          nextProducts = Array.from(
            { length: nextUnitCount },
            (_, index) => {
              const existingProduct =
                opening.products[index]
              const letter = String.fromCharCode(
                65 + index,
              )

              if (existingProduct) {
                return {
                  ...existingProduct,
                  label: `${opening.openingNumber}${letter}`,
                  position: getExteriorPosition(
                    index,
                    nextUnitCount,
                  ),
                }
              }

              return createEmptyProduct(
                `${opening.openingNumber}${letter}`,
                getExteriorPosition(
                  index,
                  nextUnitCount,
                ),
              )
            },
          )
        }

        return {
          ...opening,
          ...updates,
          isMulled: nextIsMulled,
          unitCount: nextUnitCount,
          impact: nextImpact,
          mullionCharge: calculateMullionCharge(
            nextIsMulled,
            nextUnitCount,
            nextImpact,
          ),
          products: nextProducts,
        }
      }),
    )
  }

  function updateProductField<
    Field extends keyof OpeningProduct,
  >(
    openingId: string,
    productId: string,
    field: Field,
    value: OpeningProduct[Field],
  ) {
    setOpenings((currentOpenings) =>
      currentOpenings.map((opening) => {
        if (opening.id !== openingId) {
          return opening
        }

        return {
          ...opening,
          products: opening.products.map(
            (product) =>
              product.id === productId
                ? field === 'productCategory'
                  ? {
                      ...product,
                      productCategory:
                        value as ProductCategory,
                      screen: isWindowProduct(
                        value as ProductCategory,
                      )
                        ? product.screen
                        : 'No',
                      swingDirection: isWindowProduct(
                        value as ProductCategory,
                      )
                        ? 'Not Applicable'
                        : product.swingDirection ===
                            'Not Applicable'
                          ? 'In Swing'
                          : product.swingDirection,
                      doorHanding: isWindowProduct(
                        value as ProductCategory,
                      )
                        ? 'Not Applicable'
                        : product.doorHanding ===
                            'Not Applicable'
                          ? 'Left Hand'
                          : product.doorHanding,
                    }
                  : {
                      ...product,
                      [field]: value,
                    }
                : product,
          ),
        }
      }),
    )
  }

  function handlePhotoUpload(
    openingId: string,
    photoType: 'interior' | 'exterior',
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(
      event.target.files ?? [],
    )

    if (files.length === 0) {
      return
    }

    const photoNames = files.map(
      (file) => file.name,
    )

    setOpenings((currentOpenings) =>
      currentOpenings.map((opening) => {
        if (opening.id !== openingId) {
          return opening
        }

        if (photoType === 'interior') {
          return {
            ...opening,
            interiorPhotos: [
              ...opening.interiorPhotos,
              ...photoNames,
            ],
          }
        }

        return {
          ...opening,
          exteriorPhotos: [
            ...opening.exteriorPhotos,
            ...photoNames,
          ],
        }
      }),
    )

    event.target.value = ''
  }

  function handleDuplicateOpening(opening: Opening) {
    const sequence = getNextSequence()
    const openingNumber = String(
      opening.floor * 100 + sequence,
    )

    const duplicatedOpening: Opening = {
      ...opening,
      id: crypto.randomUUID(),
      sequence,
      openingNumber,
      products: opening.products.map(
        (product, index) => ({
          ...product,
          id: crypto.randomUUID(),
          label: opening.isMulled
            ? `${openingNumber}${String.fromCharCode(
                65 + index,
              )}`
            : openingNumber,
        }),
      ),
      interiorPhotos: [],
      exteriorPhotos: [],
    }

    setOpenings((currentOpenings) => [
      ...currentOpenings,
      duplicatedOpening,
    ])
    setSelectedOpeningId(duplicatedOpening.id)
  }

  function isProductComplete(product: OpeningProduct) {
    return Boolean(
      product.productCategory &&
        product.width.trim() &&
        product.height.trim(),
    )
  }

  function isOpeningComplete(opening: Opening) {
    return opening.products.every(isProductComplete)
  }

  function getOpeningImage(opening: Opening) {
    const firstProduct = opening.products[0]

    if (!firstProduct) {
      return pictureImage
    }

    return productImages[firstProduct.productCategory]
  }

  function getOpeningSummary(opening: Opening) {
    const firstProduct = opening.products[0]

    if (opening.isMulled) {
      return `${opening.products.length}-unit mulled opening`
    }

    return firstProduct?.productCategory ?? 'Product pending'
  }

  function getOpeningDimensions(opening: Opening) {
    if (opening.products.length !== 1) {
      const measured = opening.products.filter(
        (product) =>
          product.width.trim() &&
          product.height.trim(),
      ).length

      return `${measured}/${opening.products.length} units measured`
    }

    const product = opening.products[0]

    if (!product?.width || !product?.height) {
      return 'Measurements pending'
    }

    return `${product.width} × ${product.height}`
  }

  const canCreateOpening =
    form.location.trim().length > 0

  return (
    <section className="px-5 py-9 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Quote Builder
            </p>

            <h1 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              Opening Manager
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-[#888888]">
              Add each opening in measurement order and complete
              all product details without leaving this page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#999999]">
              {saveStatus === 'saving'
                ? 'Saving...'
                : 'Saved'}
            </span>

            <button
              type="button"
              onClick={saveQuoteDraft}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#D8D4CB] bg-white px-5 text-sm font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#9A8258]"
            >
              Save quote
            </button>

            <button
              type="button"
              onClick={() =>
                setShowPricing(
                  (currentValue) => !currentValue,
                )
              }
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#222222] px-5 text-sm font-medium text-white transition hover:bg-[#B59A68]"
            >
              {showPricing
                ? 'Hide pricing'
                : 'Show pricing'}
            </button>

            <Link
              to="/portal/quotes/new"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#D8D4CB] bg-white px-5 text-sm font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#9A8258]"
            >
              Back to project
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Openings"
            value={String(openings.length)}
            description="Numbered openings"
          />

          <SummaryCard
            title="Products"
            value={String(totalProducts)}
            description="Windows and doors"
          />

          <SummaryCard
            title="Complete"
            value={String(
              openings.filter(isOpeningComplete).length,
            )}
            description="Ready for pricing"
          />

          <SummaryCard
            title={showPricing ? 'Estimated total' : 'Pricing'}
            value={
              showPricing
                ? formatCurrency(estimatedProjectTotal)
                : 'Hidden'
            }
            description={
              showPricing
                ? `Includes ${formatCurrency(
                    totalMullionCharges,
                  )} in mullion charges`
                : 'Use Show pricing to display totals'
            }
          />
        </div>

        <div className="mt-7 grid gap-7 xl:grid-cols-[0.6fr_1.4fr]">
          <section className="h-fit rounded-[24px] border border-[#E8E5DE] bg-white p-6 sm:p-8 xl:sticky xl:top-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
              New opening
            </p>

            <h2 className="mt-3 text-2xl font-light text-[#444444]">
              Opening information
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#999999]">
              The number is assigned automatically using the
              selected floor and project sequence.
            </p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="opening-floor"
                  className="text-sm font-medium text-[#666666]"
                >
                  Floor
                </label>

                <select
                  id="opening-floor"
                  value={form.floor}
                  onChange={(event) =>
                    updateForm(
                      'floor',
                      Number(event.target.value),
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
                >
                  <option value={1}>First floor</option>
                  <option value={2}>Second floor</option>
                  <option value={3}>Third floor</option>
                  <option value={4}>Fourth floor</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="opening-location"
                  className="text-sm font-medium text-[#666666]"
                >
                  Location
                </label>

                <select
                  id="opening-location"
                  value={form.location}
                  onChange={(event) =>
                    updateForm(
                      'location',
                      event.target.value,
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
                >
                  {locationOptions.map((location) => (
                    <option
                      key={location}
                      value={location}
                    >
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="location-detail"
                  className="text-sm font-medium text-[#666666]"
                >
                  Location detail
                  <span className="ml-2 font-normal text-[#AAAAAA]">
                    Optional
                  </span>
                </label>

                <input
                  id="location-detail"
                  type="text"
                  value={form.locationDetail}
                  onChange={(event) =>
                    updateForm(
                      'locationDetail',
                      event.target.value,
                    )
                  }
                  placeholder="Example: Master bedroom, rear wall"
                  className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <OptionCard
                title="Mulled opening"
                description="Two or more products joined in one opening."
                checked={form.isMulled}
                onChange={(checked) => {
                  updateForm('isMulled', checked)
                  updateForm(
                    'unitCount',
                    checked ? 2 : 1,
                  )
                }}
              />

              {form.isMulled && (
                <div>
                  <label
                    htmlFor="unit-count"
                    className="text-sm font-medium text-[#666666]"
                  >
                    Number of joined units
                  </label>

                  <select
                    id="unit-count"
                    value={form.unitCount}
                    onChange={(event) =>
                      updateForm(
                        'unitCount',
                        Number(event.target.value),
                      )
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
                  >
                    <option value={2}>2 units</option>
                    <option value={3}>3 units</option>
                    <option value={4}>4 units</option>
                    <option value={5}>5 units</option>
                    <option value={6}>6 units</option>
                  </select>
                </div>
              )}

              <OptionCard
                title="Impact products"
                description="Apply impact requirements and mullion pricing."
                checked={form.impact}
                onChange={(checked) =>
                  updateForm('impact', checked)
                }
              />
            </div>

            {form.isMulled && form.impact && (
              <div className="mt-5 rounded-2xl border border-[#E4D7BB] bg-[#FBF6EA] p-5">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9A8258]">
                  Automatic mullion charge
                </p>

                <p className="mt-2 text-2xl font-light text-[#4C4539]">
                  $
                  {calculateMullionCharge(
                    true,
                    form.unitCount,
                    true,
                  )}
                </p>
              </div>
            )}

            <button
              type="button"
              disabled={!canCreateOpening}
              onClick={handleCreateOpening}
              className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#222222] px-6 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-[#B59A68] disabled:bg-[#D8D5CE] disabled:text-[#A8A39A]"
            >
              Add opening
            </button>
          </section>

          <section className="rounded-[24px] border border-[#E8E5DE] bg-white p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
                  Measurement sequence
                </p>

                <h2 className="mt-3 text-2xl font-light text-[#444444]">
                  Project openings
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#999999]">
                  Keep the project compact. Open only the row
                  you need to review or change.
                </p>
              </div>

              <span className="rounded-full bg-[#F3EFE6] px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-[#9A8258]">
                A = exterior left
              </span>
            </div>

            {openings.length === 0 ? (
              <div className="mt-8 flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-[#D8D4CB] bg-[#FAF9F6] px-6 text-center">
                <div className="max-w-sm">
                  <p className="text-lg font-medium text-[#666666]">
                    No openings added
                  </p>

                  <p className="mt-3 text-sm leading-7 text-[#999999]">
                    Begin at the front entry and continue clockwise.
                    The first opening will be numbered 101.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-8 space-y-7">
                {floors.map((floor) => {
                  const floorOpenings = openings.filter(
                    (opening) =>
                      opening.floor === floor,
                  )

                  return (
                    <div key={floor}>
                      <div className="mb-4 flex items-center gap-4">
                        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#777777]">
                          Floor {floor}
                        </p>

                        <div className="h-px flex-1 bg-[#ECE8DF]" />
                      </div>

                      <div className="space-y-3">
                        {floorOpenings.map((opening) => {
                          const isSelected =
                            opening.id ===
                            selectedOpeningId

                          return (
                            <article
                              key={opening.id}
                              className={`overflow-hidden rounded-2xl border transition ${
                                isSelected
                                  ? 'border-[#B59A68] bg-[#FCF9F2]'
                                  : 'border-[#E8E5DE] bg-white'
                              }`}
                            >
                              <div className="grid gap-4 p-5 lg:grid-cols-[auto_auto_1.35fr_1fr_auto] lg:items-center">
                                <div className="h-16 w-20 overflow-hidden rounded-xl border border-[#E4E0D7] bg-[#F7F7F5]">
                                  <img
                                    src={getOpeningImage(opening)}
                                    alt={`${opening.products[0]?.productCategory ?? 'Window'} preview`}
                                    className="h-full w-full object-cover"
                                  />
                                </div>

                                <span className="flex h-12 min-w-16 items-center justify-center rounded-xl bg-[#222222] px-3 text-base font-medium text-white">
                                  {opening.openingNumber}
                                </span>

                                <div>
                                  <p className="font-medium text-[#444444]">
                                    {opening.location}
                                    {opening.locationDetail
                                      ? ` · ${opening.locationDetail}`
                                      : ''}
                                  </p>

                                  <p className="mt-1 text-sm text-[#888888]">
                                    {getOpeningSummary(opening)}
                                    {' · '}
                                    {getOpeningDimensions(opening)}
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                      isOpeningComplete(opening)
                                        ? 'bg-[#EAF3EC] text-[#55705B]'
                                        : 'bg-[#F5EEE3] text-[#8B6D46]'
                                    }`}
                                  >
                                    {isOpeningComplete(opening)
                                      ? 'Complete'
                                      : 'Incomplete'}
                                  </span>

                                  <span className="rounded-full bg-[#F2F0EA] px-3 py-1.5 text-xs font-medium text-[#77716A]">
                                    {opening.impact
                                      ? 'Impact'
                                      : 'Non-impact'}
                                  </span>

                                  {showPricing && (
                                    <span className="rounded-full bg-[#F3EFE6] px-3 py-1.5 text-xs font-medium text-[#8E7854]">
                                      {formatCurrency(
                                        openingPrices.get(
                                          opening.id,
                                        )?.total ?? 0,
                                      )}
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedOpeningId(
                                        isSelected
                                          ? null
                                          : opening.id,
                                      )
                                    }
                                    className="rounded-lg border border-[#D8D4CB] px-3 py-2 text-xs font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#9A8258]"
                                  >
                                    {isSelected ? 'Close' : 'Edit'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDuplicateOpening(
                                        opening,
                                      )
                                    }
                                    className="rounded-lg border border-[#D8D4CB] px-3 py-2 text-xs font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#9A8258]"
                                  >
                                    Duplicate
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteOpening(
                                        opening.id,
                                      )
                                    }
                                    className="rounded-lg px-3 py-2 text-xs font-medium text-[#A76B62] transition hover:bg-[#F9ECE9] hover:text-[#7F4038]"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              {isSelected && (
                                <div className="border-t border-[#E8E2D8] bg-white p-5 sm:p-6">
                                  <div className="mb-6 rounded-2xl border border-[#E4E0D7] bg-[#FAF9F6] p-5">
                                    <div>
                                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#B59A68]">
                                        Opening settings
                                      </p>

                                      <p className="mt-2 text-sm leading-6 text-[#888888]">
                                        Change the location, impact status, or mulled configuration for this opening.
                                      </p>
                                    </div>

                                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                      <div>
                                        <label
                                          htmlFor={`edit-location-${opening.id}`}
                                          className="text-sm font-medium text-[#666666]"
                                        >
                                          Location
                                        </label>

                                        <select
                                          id={`edit-location-${opening.id}`}
                                          value={opening.location}
                                          onChange={(event) =>
                                            updateOpeningConfiguration(
                                              opening.id,
                                              {
                                                location:
                                                  event.target.value,
                                              },
                                            )
                                          }
                                          className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-white px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68]"
                                        >
                                          {locationOptions.map(
                                            (location) => (
                                              <option
                                                key={location}
                                                value={location}
                                              >
                                                {location}
                                              </option>
                                            ),
                                          )}
                                        </select>
                                      </div>

                                      <div className="sm:col-span-1 xl:col-span-2">
                                        <label
                                          htmlFor={`edit-location-detail-${opening.id}`}
                                          className="text-sm font-medium text-[#666666]"
                                        >
                                          Location detail
                                          <span className="ml-2 font-normal text-[#AAAAAA]">
                                            Optional
                                          </span>
                                        </label>

                                        <input
                                          id={`edit-location-detail-${opening.id}`}
                                          type="text"
                                          value={opening.locationDetail}
                                          onChange={(event) =>
                                            updateOpeningConfiguration(
                                              opening.id,
                                              {
                                                locationDetail:
                                                  event.target.value,
                                              },
                                            )
                                          }
                                          placeholder="Example: Master bedroom, rear wall"
                                          className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-white px-4 text-sm text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68]"
                                        />
                                      </div>
                                    </div>

                                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                      <OptionCard
                                        title="Mulled opening"
                                        description="Two or more products joined in one opening."
                                        checked={opening.isMulled}
                                        onChange={(checked) =>
                                          updateOpeningConfiguration(
                                            opening.id,
                                            {
                                              isMulled: checked,
                                              unitCount: checked
                                                ? Math.max(
                                                    2,
                                                    opening.unitCount,
                                                  )
                                                : 1,
                                            },
                                          )
                                        }
                                      />

                                      <OptionCard
                                        title="Impact products"
                                        description="Apply impact requirements and mullion pricing."
                                        checked={opening.impact}
                                        onChange={(checked) =>
                                          updateOpeningConfiguration(
                                            opening.id,
                                            {
                                              impact: checked,
                                            },
                                          )
                                        }
                                      />
                                    </div>

                                    {opening.isMulled && (
                                      <div className="mt-5 max-w-sm">
                                        <label
                                          htmlFor={`edit-unit-count-${opening.id}`}
                                          className="text-sm font-medium text-[#666666]"
                                        >
                                          Number of joined units
                                        </label>

                                        <select
                                          id={`edit-unit-count-${opening.id}`}
                                          value={opening.unitCount}
                                          onChange={(event) =>
                                            updateOpeningConfiguration(
                                              opening.id,
                                              {
                                                unitCount: Number(
                                                  event.target.value,
                                                ),
                                              },
                                            )
                                          }
                                          className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-white px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68]"
                                        >
                                          <option value={2}>
                                            2 units
                                          </option>
                                          <option value={3}>
                                            3 units
                                          </option>
                                          <option value={4}>
                                            4 units
                                          </option>
                                          <option value={5}>
                                            5 units
                                          </option>
                                          <option value={6}>
                                            6 units
                                          </option>
                                        </select>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-5">
                                    {opening.products.map(
                                      (product) => (
                                        <ProductEditor
                                          key={product.id}
                                          openingId={
                                            opening.id
                                          }
                                          product={product}
                                          impact={
                                            opening.impact
                                          }
                                          onChange={
                                            updateProductField
                                          }
                                        />
                                      ),
                                    )}
                                  </div>

                                  {opening.mullionCharge > 0 && (
                                    <div className="mt-5 flex items-center justify-between rounded-xl bg-[#F4EFE4] px-4 py-3">
                                      <span className="text-sm text-[#776A53]">
                                        Impact mullion charge
                                      </span>

                                      <span className="text-sm font-medium text-[#5D503B]">
                                        ${opening.mullionCharge}
                                      </span>
                                    </div>
                                  )}

                                  {showPricing && (
                                    <PricingPanel
                                      opening={opening}
                                      pricing={
                                        openingPrices.get(
                                          opening.id,
                                        ) ??
                                        calculateOpeningPrice(
                                          opening,
                                        )
                                      }
                                    />
                                  )}

                                  <div className="mt-5 grid gap-4 border-t border-[#E9E4DB] pt-5 sm:grid-cols-2">
                                    <PhotoUploader
                                      title="Interior photos"
                                      inputId={`interior-${opening.id}`}
                                      photos={
                                        opening.interiorPhotos
                                      }
                                      onChange={(event) =>
                                        handlePhotoUpload(
                                          opening.id,
                                          'interior',
                                          event,
                                        )
                                      }
                                    />

                                    <PhotoUploader
                                      title="Exterior photos"
                                      inputId={`exterior-${opening.id}`}
                                      photos={
                                        opening.exteriorPhotos
                                      }
                                      onChange={(event) =>
                                        handlePhotoUpload(
                                          opening.id,
                                          'exterior',
                                          event,
                                        )
                                      }
                                    />
                                  </div>

                                  <div className="mt-6 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        saveQuoteDraft()
                                        setSelectedOpeningId(
                                          null,
                                        )
                                      }}
                                      className="inline-flex h-11 items-center justify-center rounded-xl bg-[#222222] px-5 text-sm font-medium text-white transition hover:bg-[#B59A68]"
                                    >
                                      Save changes
                                    </button>
                                  </div>
                                </div>
                              )}
                            </article>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}

type PricingPanelProps = {
  opening: Opening
  pricing: OpeningPriceBreakdown
}

function PricingPanel({
  opening,
  pricing,
}: PricingPanelProps) {
  return (
    <section className="mt-5 rounded-2xl border border-[#E4E0D7] bg-[#FAF9F6] p-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#B59A68]">
            Pricing
          </p>

          <h4 className="mt-2 text-lg font-medium text-[#444444]">
            Opening {opening.openingNumber}
          </h4>
        </div>

        <p className="text-2xl font-light text-[#555555]">
          {formatCurrency(pricing.total)}
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {opening.products.map((product, index) => {
          const productPrice = pricing.products[index]

          return (
            <div
              key={product.id}
              className="rounded-xl border border-[#E9E4DB] bg-white p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-[#4D4D4D]">
                    {product.label} · {product.productCategory}
                  </p>

                  <p className="mt-1 text-xs text-[#999999]">
                    {productPrice.squareFeet.toFixed(2)} sq. ft. ×{' '}
                    {formatCurrency(
                      productPrice.ratePerSquareFoot,
                    )}
                  </p>
                </div>

                <p className="font-medium text-[#555555]">
                  {formatCurrency(productPrice.total)}
                </p>
              </div>

              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <PriceLine
                  label="Base price"
                  value={productPrice.basePrice}
                />

                {productPrice.impact !== 0 && (
                  <PriceLine
                    label="Impact"
                    value={productPrice.impact}
                  />
                )}

                {product.tempered === 'Yes' && (
                  <PriceLine
                    label="Tempered"
                    value={productPrice.tempered}
                  />
                )}

                {product.tinted === 'Yes' && (
                  <PriceLine
                    label="Tinted"
                    value={productPrice.tinted}
                  />
                )}

                {product.privacyGlass === 'Yes' && (
                  <PriceLine
                    label="Privacy glass"
                    value={productPrice.privacyGlass}
                  />
                )}

                {product.grids === 'Yes' && (
                  <PriceLine
                    label="Grids"
                    value={productPrice.grids}
                  />
                )}

                {product.color !== 'White' && (
                  <PriceLine
                    label={`${product.color} color`}
                    value={productPrice.color}
                  />
                )}

                {isWindowProduct(
                  product.productCategory,
                ) &&
                  product.screen === 'No' && (
                    <PriceLine
                      label="Screen removed"
                      value={
                        productPrice.screenAdjustment
                      }
                    />
                  )}
              </div>
            </div>
          )
        })}

        {pricing.mullionCharge > 0 && (
          <PriceLine
            label="Impact mullion charge"
            value={pricing.mullionCharge}
            emphasized
          />
        )}

        <div className="flex items-center justify-between border-t border-[#DED8CD] pt-4">
          <span className="font-medium text-[#444444]">
            Opening total
          </span>

          <span className="text-xl font-medium text-[#444444]">
            {formatCurrency(pricing.total)}
          </span>
        </div>
      </div>
    </section>
  )
}

type PriceLineProps = {
  label: string
  value: number
  emphasized?: boolean
}

function PriceLine({
  label,
  value,
  emphasized = false,
}: PriceLineProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        emphasized
          ? 'rounded-xl bg-[#F4EFE4] px-4 py-3'
          : ''
      }`}
    >
      <span
        className={
          emphasized
            ? 'text-[#776A53]'
            : 'text-[#777777]'
        }
      >
        {label}
      </span>

      <span
        className={
          emphasized
            ? 'font-medium text-[#5D503B]'
            : 'font-medium text-[#555555]'
        }
      >
        {formatCurrency(value)}
      </span>
    </div>
  )
}

type ProductEditorProps = {
  openingId: string
  product: OpeningProduct
  impact: boolean
  onChange: <Field extends keyof OpeningProduct>(
    openingId: string,
    productId: string,
    field: Field,
    value: OpeningProduct[Field],
  ) => void
}

function ProductEditor({
  openingId,
  product,
  impact,
  onChange,
}: ProductEditorProps) {
  const windowProduct = isWindowProduct(
    product.productCategory,
  )

  return (
    <div className="rounded-2xl border border-[#E4E0D7] bg-white p-5">
      <div className="flex flex-col justify-between gap-4 border-b border-[#EEEAE2] pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="h-20 w-24 overflow-hidden rounded-xl border border-[#E4E0D7] bg-[#F7F7F5]">
            <img
              src={productImages[product.productCategory]}
              alt={`${product.productCategory} preview`}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="text-lg font-medium text-[#444444]">
              Product {product.label}
            </p>

            <p className="mt-1 text-xs text-[#999999]">
              {product.position}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-[#F3EFE6] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.1em] text-[#8E7854]">
          {impact ? 'Impact' : 'Non-impact'}
        </span>
      </div>

      <div className="mt-5 space-y-6">
        <EditorSection
          number="1"
          title="Product"
          description="Choose the product style, series and model."
        >
          <SelectField
            label="Product type"
            value={product.productCategory}
            options={productCategoryOptions}
            onChange={(value) =>
              onChange(
                openingId,
                product.id,
                'productCategory',
                value as ProductCategory,
              )
            }
          />

          <TextField
            label="Series (optional)"
            value={product.series}
            placeholder="Example: 300 Series"
            onChange={(value) =>
              onChange(
                openingId,
                product.id,
                'series',
                value,
              )
            }
          />

          <TextField
            label="Model (optional)"
            value={product.model}
            placeholder="Model name"
            onChange={(value) =>
              onChange(
                openingId,
                product.id,
                'model',
                value,
              )
            }
          />
        </EditorSection>

        <EditorSection
          number="2"
          title="Dimensions"
          description="Enter the width and height of this unit."
        >
          <TextField
            label="Width"
            value={product.width}
            placeholder='Example: 36"'
            inputMode="decimal"
            onChange={(value) =>
              onChange(
                openingId,
                product.id,
                'width',
                value,
              )
            }
          />

          <TextField
            label="Height"
            value={product.height}
            placeholder='Example: 60"'
            inputMode="decimal"
            onChange={(value) =>
              onChange(
                openingId,
                product.id,
                'height',
                value,
              )
            }
          />
        </EditorSection>

        <EditorSection
          number="3"
          title="Glass"
          description="Configure the glass package and safety options."
        >
          <SelectField
            label="Glass package"
            value={product.glassType}
            options={glassOptions}
            onChange={(value) =>
              onChange(
                openingId,
                product.id,
                'glassType',
                value as GlassType,
              )
            }
          />

          <OptionCard
            title="Tinted glass"
            description="Add a tinted glass finish to this product."
            checked={product.tinted === 'Yes'}
            onChange={(checked) =>
              onChange(
                openingId,
                product.id,
                'tinted',
                checked ? 'Yes' : 'No',
              )
            }
          />

          <OptionCard
            title="Privacy glass"
            description="Use obscure glass for added privacy."
            checked={product.privacyGlass === 'Yes'}
            onChange={(checked) =>
              onChange(
                openingId,
                product.id,
                'privacyGlass',
                checked ? 'Yes' : 'No',
              )
            }
          />

          <OptionCard
            title="Tempered glass"
            description="Mark this product as tempered glass."
            checked={product.tempered === 'Yes'}
            onChange={(checked) =>
              onChange(
                openingId,
                product.id,
                'tempered',
                checked ? 'Yes' : 'No',
              )
            }
          />
        </EditorSection>

        <EditorSection
          number="4"
          title="Appearance"
          description="Choose colors, grids and window screen options."
        >
          <SelectField
            label="Color"
            value={product.color}
            options={colorOptions}
            onChange={(value) =>
              onChange(
                openingId,
                product.id,
                'color',
                value as ColorOption,
              )
            }
          />

          <OptionCard
            title="Include grids"
            description="Add a decorative grid pattern."
            checked={product.grids === 'Yes'}
            onChange={(checked) =>
              onChange(
                openingId,
                product.id,
                'grids',
                checked ? 'Yes' : 'No',
              )
            }
          />

          {product.grids === 'Yes' && (
            <TextField
              label="Grid pattern"
              value={product.gridPattern}
              placeholder="Example: 2 x 2"
              onChange={(value) =>
                onChange(
                  openingId,
                  product.id,
                  'gridPattern',
                  value,
                )
              }
            />
          )}

          {windowProduct && (
            <OptionCard
              title="Screen included"
              description="Included by default. Turn this off to remove the screen."
              checked={product.screen === 'Yes'}
              onChange={(checked) =>
                onChange(
                  openingId,
                  product.id,
                  'screen',
                  checked ? 'Yes' : 'No',
                )
              }
            />
          )}
        </EditorSection>

        {!windowProduct && (
          <EditorSection
            number="5"
            title="Door Configuration"
            description="Configure operation, handing, sill and hardware."
          >
            <SelectField
              label="Swing direction"
              value={product.swingDirection}
              options={swingDirectionOptions}
              onChange={(value) =>
                onChange(
                  openingId,
                  product.id,
                  'swingDirection',
                  value as SwingDirection,
                )
              }
            />

            <SelectField
              label="Door handing"
              value={product.doorHanding}
              options={doorHandingOptions}
              onChange={(value) =>
                onChange(
                  openingId,
                  product.id,
                  'doorHanding',
                  value as DoorHanding,
                )
              }
            />

            <SelectField
              label="Sill"
              value={product.sill}
              options={sillOptions}
              onChange={(value) =>
                onChange(
                  openingId,
                  product.id,
                  'sill',
                  value as SillOption,
                )
              }
            />

            <TextField
              label="Handle set"
              value={product.handleSet}
              placeholder="Example: Contemporary handle"
              onChange={(value) =>
                onChange(
                  openingId,
                  product.id,
                  'handleSet',
                  value,
                )
              }
            />

            <TextField
              label="Lockset"
              value={product.lockset}
              placeholder="Example: Multi-point lock"
              onChange={(value) =>
                onChange(
                  openingId,
                  product.id,
                  'lockset',
                  value,
                )
              }
            />

            <SelectField
              label="Hardware finish"
              value={product.hardwareFinish}
              options={hardwareFinishOptions}
              onChange={(value) =>
                onChange(
                  openingId,
                  product.id,
                  'hardwareFinish',
                  value as HardwareFinish,
                )
              }
            />
          </EditorSection>
        )}

        <EditorSection
          number={windowProduct ? '5' : '6'}
          title="Installation"
          description="Add installation details and production notes."
        >
          <TextField
            label="Installation"
            value={product.installation}
            placeholder="Example: Block installation"
            onChange={(value) =>
              onChange(
                openingId,
                product.id,
                'installation',
                value,
              )
            }
          />

          <div className="sm:col-span-2 xl:col-span-3">
            <label
              htmlFor={`notes-${product.id}`}
              className="text-sm font-medium text-[#666666]"
            >
              Product notes
            </label>

            <textarea
              id={`notes-${product.id}`}
              value={product.notes}
              onChange={(event) =>
                onChange(
                  openingId,
                  product.id,
                  'notes',
                  event.target.value,
                )
              }
              placeholder="Add special instructions or production notes..."
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 py-3 text-sm leading-6 text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
            />
          </div>
        </EditorSection>
      </div>
    </div>
  )
}

type EditorSectionProps = {
  number: string
  title: string
  description: string
  children: ReactNode
}

function EditorSection({
  number,
  title,
  description,
  children,
}: EditorSectionProps) {
  return (
    <section className="rounded-2xl bg-[#FAF9F6] p-5">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#222222] text-xs font-medium text-white">
          {number}
        </span>

        <div>
          <h4 className="text-base font-medium text-[#4C4C4C]">
            {title}
          </h4>

          <p className="mt-1 text-xs leading-5 text-[#999999]">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  )
}

function getExteriorPosition(
  index: number,
  unitCount: number,
) {
  if (unitCount === 2) {
    return index === 0
      ? 'Left viewed from exterior'
      : 'Right viewed from exterior'
  }

  if (index === 0) {
    return 'Far left viewed from exterior'
  }

  if (index === unitCount - 1) {
    return 'Far right viewed from exterior'
  }

  return `Position ${index + 1} from exterior left`
}

type SummaryCardProps = {
  title: string
  value: string
  description: string
}

function SummaryCard({
  title,
  value,
  description,
}: SummaryCardProps) {
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

type OptionCardProps = {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function OptionCard({
  title,
  description,
  checked,
  onChange,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
        checked
          ? 'border-[#B59A68] bg-[#F8F4EB]'
          : 'border-[#DEDAD1] bg-[#FAF9F6] hover:border-[#C9C2B5]'
      }`}
    >
      <span>
        <span className="block text-sm font-medium text-[#555555]">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-[#999999]">
          {description}
        </span>
      </span>

      <span
        className={`relative ml-4 h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-[#B59A68]' : 'bg-[#D5D1C8]'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </span>
    </button>
  )
}

type TextFieldProps = {
  label: string
  value: string
  placeholder: string
  inputMode?: 'text' | 'decimal' | 'numeric'
  onChange: (value: string) => void
}

function TextField({
  label,
  value,
  placeholder,
  inputMode = 'text',
  onChange,
}: TextFieldProps) {
  const inputId = `${label
    .toLowerCase()
    .replaceAll(' ', '-')}-${placeholder
    .toLowerCase()
    .replaceAll(' ', '-')}`

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
        inputMode={inputMode}
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

type SelectFieldProps = {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  const inputId = `${label
    .toLowerCase()
    .replaceAll(' ', '-')}-${value
    .toLowerCase()
    .replaceAll(' ', '-')}`

  return (
    <div>
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-[#666666]"
      >
        {label}
      </label>

      <select
        id={inputId}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-12 w-full rounded-xl border border-[#DEDAD1] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

type PhotoUploaderProps = {
  title: string
  inputId: string
  photos: string[]
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void
}

function PhotoUploader({
  title,
  inputId,
  photos,
  onChange,
}: PhotoUploaderProps) {
  return (
    <div className="rounded-xl border border-[#E4E0D7] bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#555555]">
            {title}
          </p>

          <p className="mt-1 text-xs text-[#999999]">
            {photos.length} uploaded
          </p>
        </div>

        <label
          htmlFor={inputId}
          className="cursor-pointer rounded-lg bg-[#222222] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#B59A68]"
        >
          Add photos
        </label>

        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          onChange={onChange}
          className="hidden"
        />
      </div>

      {photos.length > 0 && (
        <div className="mt-4 space-y-2">
          {photos.map((photo, index) => (
            <p
              key={`${photo}-${index}`}
              className="truncate rounded-lg bg-[#FAF9F6] px-3 py-2 text-xs text-[#777777]"
            >
              {photo}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
