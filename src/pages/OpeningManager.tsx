import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'

import doubleHungImage from '../assets/windows/double-hung.png'
import doubleHungHouseImage from '../assets/windows/double-hung-house.png'
import specialtyHouseImage from '../assets/windows/specialty-house.png'
import equalLegArchImage from '../assets/windows/specialty/equal-leg-arch.png'
import springlineImage from '../assets/windows/specialty/springline.png'
import unequalLegArchLeftImage from '../assets/windows/specialty/unequal-leg-arch-left.png'
import unequalLegArchRightImage from '../assets/windows/specialty/unequal-leg-arch-right.png'

import trapezoidImage from '../assets/windows/specialty/trapezoid.png'
import rightTriangleLeftImage from '../assets/windows/specialty/right-triangle-left.png'
import rightTriangleRightImage from '../assets/windows/specialty/right-triangle-right.png'
import triangleImage from '../assets/windows/specialty/triangle.png'

import octagonImage from '../assets/windows/specialty/octagon.png'
import hexagonImage from '../assets/windows/specialty/hexagon.png'

import circleImage from '../assets/windows/specialty/circle.png'

import peakPentagonImage from '../assets/windows/specialty/peak-pentagon.png'
import pentagonImage from '../assets/windows/specialty/pentagon.png'

import circleTopImage from '../assets/windows/specialty/circle-top.png'
import chordImage from '../assets/windows/specialty/chord.png'
import quarterCircleLeftImage from '../assets/windows/specialty/quarter-circle-left.png'
import quarterCircleRightImage from '../assets/windows/specialty/quarter-circle-right.png'
import awningHouseImage from '../assets/windows/awning-house.png'
import casementImage from '../assets/windows/casement.png'
import slidingImage from '../assets/windows/sliding.png'
import pictureImage from '../assets/windows/picture.png'
import slidingGlassDoorImage from '../assets/doors/sliding-glass-door.png'
import frenchDoorImage from '../assets/doors/french-door.png'
import entryDoorImage from '../assets/doors/entry-door.png'
import { calculateCoreProductPrice } from '../services/pricingService'
import {
  getProductPrices,
  type ApiProductPrice,
} from '../services/pricingApi'

type ProductCategory =
  | 'Single Hung'
  | 'Double Hung'
  | 'Sliding Window'
  | 'Picture Window'
  | 'Casement'
  | 'Awning'
  | 'Sliding Glass Door'
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
  supplier: string
  manufacturer: string
  material: string
  productCategory: ProductCategory
  configuration: string
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

const productConfigurationOptions: Partial<
  Record<ProductCategory, string[]>
> = {
  'Sliding Glass Door': [
    '2 Panels',
    '3 Panels',
    '4 Panels',
  ],
  'French Door': [
    '1 Panel',
    '2 Panels',
  ],
  'Entry Door': [
    '1 Panel',
    '2 Panels',
    '1 Panel + 1 Sidelight',
    '1 Panel + 2 Sidelights',
  ],
}

const productImages: Record<ProductCategory, string> = {
  'Single Hung': doubleHungImage,
  'Double Hung': doubleHungImage,
  'Sliding Window': slidingImage,
  'Picture Window': pictureImage,
  Casement: casementImage,
  Awning: casementImage,
  'Sliding Glass Door': slidingGlassDoorImage,
  'French Door': frenchDoorImage,
  'Entry Door': entryDoorImage,
  Transom: pictureImage,
  Shape: specialtyHouseImage,
}

const specialtyProductImages: Record<string, string> = {
  'Equal Leg Arch': equalLegArchImage,
  'Springline': springlineImage,
  'Unequal Leg Arch - Left': unequalLegArchLeftImage,
  'Unequal Leg Arch - Right': unequalLegArchRightImage,
  'Trapezoid': trapezoidImage,
  'Right Triangle - Left': rightTriangleLeftImage,
  'Right Triangle - Right': rightTriangleRightImage,
  'Triangle': triangleImage,
  'Octagon': octagonImage,
  'Hexagon': hexagonImage,
  'Circle': circleImage,
  'Peak Pentagon': peakPentagonImage,
  'Pentagon': pentagonImage,
  'Circle Top': circleTopImage,
  'Chord': chordImage,
  'Quarter Circle - Left': quarterCircleLeftImage,
  'Quarter Circle - Right': quarterCircleRightImage,
}

function getProductImage(product: OpeningProduct) {
  if (product.productCategory === 'Shape') {
    return (
      specialtyProductImages[product.configuration] ??
      specialtyHouseImage
    )
  }

  return productImages[product.productCategory]
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
  'Sliding Glass Door',
  'French Door',
  'Entry Door',
]

function isWindowProduct(productCategory: ProductCategory) {
  return !doorProductCategories.includes(productCategory)
}

function calculateProductPrice(
  product: OpeningProduct,
  impact: boolean,
): ProductPriceBreakdown {
  const windowProduct = isWindowProduct(
    product.productCategory,
  )

  const calculatedPrice =
    calculateCoreProductPrice({
      width: product.width,
      height: product.height,
      productCategory:
        product.productCategory,
      configuration:
        product.configuration,
      isDoor: !windowProduct,
      impact: Boolean(impact),
      tempered: product.tempered === 'Yes',
      tinted: product.tinted === 'Yes',
      privacyGlass:
        product.privacyGlass === 'Yes',
      grids: product.grids === 'Yes',
      color: product.color,
      screen: product.screen !== 'No',
    })

  return {
    squareFeet:
      calculatedPrice.squareFeet,
    ratePerSquareFoot:
      calculatedPrice.ratePerSquareFoot,
    basePrice:
      calculatedPrice.basePrice,
    impact:
      calculatedPrice.impactPrice,
    tempered:
      calculatedPrice.temperedPrice,
    tinted:
      calculatedPrice.tintedPrice,
    privacyGlass:
      calculatedPrice.privacyGlassPrice,
    grids:
      calculatedPrice.gridsPrice,
    color:
      calculatedPrice.colorPrice,
    screenAdjustment:
      calculatedPrice.screenAdjustment,
    installation:
      calculatedPrice.installationPrice,
    total:
      calculatedPrice.total,
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

  const [pricingProducts, setPricingProducts] =
    useState<ApiProductPrice[]>([])

  const [selectedOpeningId, setSelectedOpeningId] =
    useState<string | null>(null)

  const [showPricing, setShowPricing] = useState(false)
  const [isProductSelectorOpen, setIsProductSelectorOpen] =
    useState(false)

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
    async function loadPricingProducts() {
      try {
        const products =
          await getProductPrices()

        setPricingProducts(products)

        console.log(
          'Pricing products loaded:',
          products.length,
        )
      } catch (error) {
        console.error(
          'Unable to load pricing products:',
          error,
        )
      }
    }

    loadPricingProducts()
  }, [])

  useEffect(() => {
    onOpeningsChange?.(openings)
  }, [openings, onOpeningsChange])

  useEffect(() => {
    if (!embedded) return

    setOpenings((currentOpenings) => {
      if (currentOpenings.length > 0) {
        return currentOpenings
      }

      return initialOpenings ?? []
    })
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
    productCategory: ProductCategory = 'Single Hung',
  ): OpeningProduct {
    return {
      id: crypto.randomUUID(),
      label,
      position,
      supplier: 'GL',
      manufacturer: 'Ply Gem',
      material: 'Vinyl',
      productCategory,
      configuration: 'Standard',
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
    productCategory: ProductCategory = 'Single Hung',
  ): OpeningProduct[] {
    if (!isMulled) {
      return [
        createEmptyProduct(
          openingNumber,
          'Single unit',
          productCategory,
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
          productCategory,
        )
      },
    )
  }

  function handleCreateOpening(
    productCategory: ProductCategory = 'Single Hung',
    impact = form.impact,
    configuration = 'Standard',
  ) {
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
      impact,
      mullionCharge: calculateMullionCharge(
        form.isMulled,
        unitCount,
        impact,
      ),
      products: createProducts(
        openingNumber,
        unitCount,
        form.isMulled,
        productCategory,
      ).map((product) => ({
        ...product,
        configuration,
      })),
      interiorPhotos: [],
      exteriorPhotos: [],
    }

    setOpenings((currentOpenings) => [
      ...currentOpenings,
      newOpening,
    ])

    setSelectedOpeningId(newOpening.id)
    setIsProductSelectorOpen(false)

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
                    configuration:
                      productConfigurationOptions[
                      value as ProductCategory
                      ]?.[0] ?? 'Standard',
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

    return getProductImage(firstProduct)
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
              onClick={() => setIsProductSelectorOpen(true)}
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
                              className={`overflow-hidden rounded-2xl border transition ${isSelected
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
                                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${isOpeningComplete(opening)
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
                                          pricingProducts={
                                            pricingProducts
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

      {isProductSelectorOpen && (
        <VisualProductSelector
          impact={form.impact}
          onImpactChange={(impact) =>
            setForm((currentForm) => ({
              ...currentForm,
              impact,
            }))
          }
          onSelect={(productCategory, impact, configuration) =>
            handleCreateOpening(
              productCategory,
              impact,
              configuration,
            )
          }
          onClose={() =>
            setIsProductSelectorOpen(false)
          }
        />
      )}
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
      className={`flex items-center justify-between gap-4 ${emphasized
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
  pricingProducts: ApiProductPrice[]
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
  pricingProducts,
  onChange,
}: ProductEditorProps) {
  const windowProduct = isWindowProduct(
    product.productCategory,
  )

  const supplierOptions = Array.from(
    new Set(
      pricingProducts
        .map((item) => item.supplier)
        .filter(Boolean),
    ),
  ).sort()

  const manufacturerOptions = Array.from(
    new Set(
      pricingProducts
        .filter(
          (item) =>
            item.supplier === product.supplier,
        )
        .map((item) => item.manufacturer)
        .filter(Boolean),
    ),
  ).sort()

  const materialOptions = Array.from(
    new Set(
      pricingProducts
        .filter(
          (item) =>
            item.supplier === product.supplier &&
            item.manufacturer === product.manufacturer,
        )
        .map((item) => item.material)
        .filter(Boolean),
    ),
  ).sort()

  const productOptions = Array.from(
    new Set(
      pricingProducts
        .filter(
          (item) =>
            item.supplier === product.supplier &&
            item.manufacturer === product.manufacturer &&
            item.material === product.material,
        )
        .map((item) => item.name)
        .filter(Boolean),
    ),
  ).sort()

  const configurationOptions = Array.from(
    new Set([
      product.configuration,
      ...(productConfigurationOptions[
        product.productCategory
      ] ?? ['Standard']),
    ].filter(Boolean)),
  )

  const productTypeOptions = Array.from(
    new Set([
      product.productCategory,
      ...productOptions,
    ].filter(Boolean)),
  )

  return (
    <div className="rounded-2xl border border-[#E4E0D7] bg-white p-5">
      <div className="flex flex-col justify-between gap-4 border-b border-[#EEEAE2] pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="h-20 w-24 overflow-hidden rounded-xl border border-[#E4E0D7] bg-[#F7F7F5]">
            <img
              src={getProductImage(product)}
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
            label="Supplier"
            value={product.supplier}
            options={supplierOptions}
            onChange={(value) => {
              const nextManufacturer =
                pricingProducts.find(
                  (item) =>
                    item.supplier === value,
                )?.manufacturer ?? ''

              const nextMaterial =
                pricingProducts.find(
                  (item) =>
                    item.supplier === value &&
                    item.manufacturer === nextManufacturer,
                )?.material ?? ''

              const nextProduct =
                pricingProducts.find(
                  (item) =>
                    item.supplier === value &&
                    item.manufacturer === nextManufacturer &&
                    item.material === nextMaterial,
                )

              onChange(
                openingId,
                product.id,
                'supplier',
                value,
              )

              onChange(
                openingId,
                product.id,
                'manufacturer',
                nextManufacturer,
              )

              onChange(
                openingId,
                product.id,
                'material',
                nextMaterial,
              )

              if (nextProduct) {
                onChange(
                  openingId,
                  product.id,
                  'productCategory',
                  nextProduct.name as ProductCategory,
                )

                onChange(
                  openingId,
                  product.id,
                  'configuration',
                  nextProduct.configuration,
                )
              }
            }}
          />

          <SelectField
            label="Manufacturer"
            value={product.manufacturer}
            options={manufacturerOptions}
            onChange={(value) => {
              const nextMaterial =
                pricingProducts.find(
                  (item) =>
                    item.supplier === product.supplier &&
                    item.manufacturer === value,
                )?.material ?? ''

              const nextProduct =
                pricingProducts.find(
                  (item) =>
                    item.supplier === product.supplier &&
                    item.manufacturer === value &&
                    item.material === nextMaterial,
                )

              onChange(
                openingId,
                product.id,
                'manufacturer',
                value,
              )

              onChange(
                openingId,
                product.id,
                'material',
                nextMaterial,
              )

              if (nextProduct) {
                onChange(
                  openingId,
                  product.id,
                  'productCategory',
                  nextProduct.name as ProductCategory,
                )

                onChange(
                  openingId,
                  product.id,
                  'configuration',
                  nextProduct.configuration,
                )
              }
            }}
          />

          <SelectField
            label="Material"
            value={product.material}
            options={materialOptions}
            onChange={(value) => {
              const nextProduct =
                pricingProducts.find(
                  (item) =>
                    item.supplier === product.supplier &&
                    item.manufacturer === product.manufacturer &&
                    item.material === value,
                )

              onChange(
                openingId,
                product.id,
                'material',
                value,
              )

              if (nextProduct) {
                onChange(
                  openingId,
                  product.id,
                  'productCategory',
                  nextProduct.name as ProductCategory,
                )

                onChange(
                  openingId,
                  product.id,
                  'configuration',
                  nextProduct.configuration,
                )
              }
            }}
          />

          <SelectField
            label="Product type"
            value={product.productCategory}
            options={productTypeOptions}
            onChange={(value) =>
              onChange(
                openingId,
                product.id,
                'productCategory',
                value as ProductCategory,
              )
            }
          />

          <SelectField
            label="Configuration"
            value={product.configuration}
            options={configurationOptions}
            onChange={(value) =>
              onChange(
                openingId,
                product.id,
                'configuration',
                value,
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
      className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${checked
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
        className={`relative ml-4 h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-[#B59A68]' : 'bg-[#D5D1C8]'
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

type ProductGroup =
  | 'Windows'
  | 'Specialty'
  | 'Patio Doors'
  | 'Entry Doors'


type SpecialtyVariant = {
  title: string
  subtitle: string
  image: string
}

type SpecialtyFamily = {
  title: string
  subtitle: string
  variants: SpecialtyVariant[]
}

const specialtyFamilies: SpecialtyFamily[] = [
  {
    title: 'Radius Top',
    subtitle: 'Arched architectural windows',
    variants: [
      {
        title: 'Equal Leg Arch',
        subtitle: 'Symmetrical radius top',
        image: equalLegArchImage,
      },
      {
        title: 'Springline',
        subtitle: 'Classic springline arch',
        image: springlineImage,
      },
      {
        title: 'Unequal Leg Arch - Left',
        subtitle: 'Exterior view · Left',
        image: unequalLegArchLeftImage,
      },
      {
        title: 'Unequal Leg Arch - Right',
        subtitle: 'Exterior view · Right',
        image: unequalLegArchRightImage,
      },
    ],
  },
  {
    title: 'Triangle',
    subtitle: 'Angular architectural windows',
    variants: [
      {
        title: 'Trapezoid',
        subtitle: 'Sloped geometric window',
        image: trapezoidImage,
      },
      {
        title: 'Right Triangle - Left',
        subtitle: 'Exterior view · Left',
        image: rightTriangleLeftImage,
      },
      {
        title: 'Right Triangle - Right',
        subtitle: 'Exterior view · Right',
        image: rightTriangleRightImage,
      },
      {
        title: 'Triangle',
        subtitle: 'Symmetrical triangle',
        image: triangleImage,
      },
    ],
  },
  {
    title: 'Polygon',
    subtitle: 'Multi-sided geometric windows',
    variants: [
      {
        title: 'Octagon',
        subtitle: 'Eight-sided window',
        image: octagonImage,
      },
      {
        title: 'Hexagon',
        subtitle: 'Six-sided window',
        image: hexagonImage,
      },
    ],
  },
  {
    title: 'Circle',
    subtitle: 'Round architectural windows',
    variants: [
      {
        title: 'Circle',
        subtitle: 'Full round window',
        image: circleImage,
      },
    ],
  },
  {
    title: 'Pentagon',
    subtitle: 'Five-sided architectural windows',
    variants: [
      {
        title: 'Peak Pentagon',
        subtitle: 'Tall peaked pentagon',
        image: peakPentagonImage,
      },
      {
        title: 'Pentagon',
        subtitle: 'Classic pentagon',
        image: pentagonImage,
      },
    ],
  },
  {
    title: 'Part-Circle',
    subtitle: 'Partial-radius architectural windows',
    variants: [
      {
        title: 'Circle Top',
        subtitle: 'Half-round window',
        image: circleTopImage,
      },
      {
        title: 'Chord',
        subtitle: 'Segmented radius window',
        image: chordImage,
      },
      {
        title: 'Quarter Circle - Left',
        subtitle: 'Exterior view · Left',
        image: quarterCircleLeftImage,
      },
      {
        title: 'Quarter Circle - Right',
        subtitle: 'Exterior view · Right',
        image: quarterCircleRightImage,
      },
    ],
  },
]

type SpecialtySelectorProps = {
  impact: boolean
  onSelect: (
    category: ProductCategory,
    impact: boolean,
    configuration?: string,
  ) => void
}

function SpecialtySelector({
  impact,
  onSelect,
}: SpecialtySelectorProps) {
  const [variantIndexes, setVariantIndexes] =
    useState<number[]>(
      () => specialtyFamilies.map(() => 0),
    )

  function moveVariant(
    familyIndex: number,
    direction: number,
  ) {
    setVariantIndexes((current) => {
      const next = [...current]
      const count =
        specialtyFamilies[familyIndex].variants.length

      next[familyIndex] =
        (next[familyIndex] + direction + count) % count

      return next
    })
  }

  return (
    <div className="overflow-y-auto px-7 py-8 sm:px-10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B59A68]">
            Specialty shapes
          </p>
          <p className="mt-1 text-sm text-[#888888]">
            Scroll left or right between families. Use ↑ ↓ to explore each shape.
          </p>
        </div>

        <div className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-[#999999] md:block">
          ← Scroll to explore →
        </div>
      </div>

      <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6">
        {specialtyFamilies.map((family, familyIndex) => {
          const variantIndex =
            variantIndexes[familyIndex] ?? 0

          const variant =
            family.variants[variantIndex]

          return (
            <div
              key={family.title}
              className="group relative flex min-h-[560px] w-[300px] flex-none snap-start flex-col overflow-hidden rounded-[24px] border border-[#DEDAD1] bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#B59A68] hover:shadow-xl sm:w-[340px]"
            >
              <div className="relative h-[380px] overflow-hidden bg-[#F1EFEA]">
                <img
                  src={variant.image}
                  alt={variant.title}
                  className="h-full w-full object-cover object-center transition duration-500"
                />

                <span
                  className={`absolute left-5 top-5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                    impact
                      ? 'bg-[#B59A68] text-white'
                      : 'bg-[#222222] text-white'
                  }`}
                >
                  {impact ? 'Impact' : 'Non-Impact'}
                </span>

                {family.variants.length > 1 && (
                  <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        moveVariant(familyIndex, -1)
                      }}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/90 text-xl text-[#444444] shadow-md backdrop-blur transition hover:bg-white hover:text-[#B59A68]"
                      aria-label={`Previous ${family.title} shape`}
                    >
                      ↑
                    </button>

                    <div className="rounded-full bg-black/65 px-2.5 py-1 text-center text-[10px] font-semibold text-white backdrop-blur">
                      {variantIndex + 1}/{family.variants.length}
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        moveVariant(familyIndex, 1)
                      }}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/90 text-xl text-[#444444] shadow-md backdrop-blur transition hover:bg-white hover:text-[#B59A68]"
                      aria-label={`Next ${family.title} shape`}
                    >
                      ↓
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B59A68]">
                  {family.title}
                </p>

                <h3 className="mt-2 text-2xl font-light text-[#333333]">
                  {variant.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#888888]">
                  {variant.subtitle}
                </p>

                {family.variants.length > 1 && (
                  <div className="mt-4 flex gap-1.5">
                    {family.variants.map((_, index) => (
                      <span
                        key={index}
                        className={`h-1.5 rounded-full transition-all ${
                          index === variantIndex
                            ? 'w-6 bg-[#B59A68]'
                            : 'w-1.5 bg-[#DDD8CE]'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                      onSelect(
                        'Shape',
                        impact,
                        variant.title,
                      )
                    }
                  className="mt-auto pt-5 text-left"
                >
                  <span className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.14em] text-[#555555] transition hover:text-[#B59A68]">
                    Select {variant.title} →
                  </span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-1 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#AAA49A]">
        ← Scroll to explore all specialty shapes →
      </p>
    </div>
  )
}

type VisualProductSelectorProps = {
  impact: boolean
  onImpactChange: (impact: boolean) => void
  onSelect: (
    category: ProductCategory,
    impact: boolean,
    configuration?: string,
  ) => void
  onClose: () => void
}

function VisualProductSelector({
  impact,
  onImpactChange,
  onSelect,
  onClose,
}: VisualProductSelectorProps) {
  const [selectedGroup, setSelectedGroup] =
    useState<ProductGroup | null>(null)

  const visualProducts: {
    category: ProductCategory
    group: ProductGroup
    title: string
    subtitle: string
    image: string
  }[] = [
    {
      category: 'Double Hung',
      group: 'Windows',
      title: 'Double Hung',
      subtitle: 'Both upper & lower sash operable',
      image: doubleHungHouseImage,
    },
    {
      category: 'Single Hung',
      group: 'Windows',
      title: 'Single Hung',
      subtitle: 'Fixed upper sash · operable lower sash',
      image: doubleHungHouseImage,
    },
    {
      category: 'Sliding Window',
      group: 'Windows',
      title: 'Slider / Glider',
      subtitle: 'Horizontal operation',
      image: slidingImage,
    },
    {
      category: 'Casement',
      group: 'Windows',
      title: 'Casement',
      subtitle: 'Crank-out operation',
      image: casementImage,
    },
    {
      category: 'Awning',
      group: 'Windows',
      title: 'Awning',
      subtitle: 'Top-hinged operation',
      image: awningHouseImage,
    },
    {
      category: 'Picture Window',
      group: 'Windows',
      title: 'Picture',
      subtitle: 'Fixed glass',
      image: pictureImage,
    },
    {
      category: 'Shape',
      group: 'Specialty',
      title: 'Geometric / Shape',
      subtitle: 'Custom architectural shapes',
      image: pictureImage,
    },
    {
      category: 'Transom',
      group: 'Specialty',
      title: 'Transom',
      subtitle: 'Fixed transom window',
      image: pictureImage,
    },
    {
      category: 'Sliding Glass Door',
      group: 'Patio Doors',
      title: 'Sliding Glass Door',
      subtitle: 'Sliding patio door system',
      image: slidingGlassDoorImage,
    },
    {
      category: 'French Door',
      group: 'Patio Doors',
      title: 'French Door',
      subtitle: 'Hinged patio door system',
      image: frenchDoorImage,
    },
    {
      category: 'Entry Door',
      group: 'Entry Doors',
      title: 'Entry Door',
      subtitle: 'Exterior entry system',
      image: entryDoorImage,
    },
  ]

  const categoryCards: {
    group: ProductGroup
    title: string
    subtitle: string
    image: string
  }[] = [
    {
      group: 'Windows',
      title: 'Windows',
      subtitle: 'Hung, sliding, casement, awning & picture',
      image: doubleHungHouseImage,
    },
    {
      group: 'Specialty',
      title: 'Specialty',
      subtitle: 'Shapes, geometric & transom windows',
      image: specialtyHouseImage,
    },
    {
      group: 'Patio Doors',
      title: 'Patio Doors',
      subtitle: 'Sliding glass & French doors',
      image: slidingGlassDoorImage,
    },
    {
      group: 'Entry Doors',
      title: 'Entry Doors',
      subtitle: 'Exterior entry door systems',
      image: entryDoorImage,
    },
  ]

  const filteredProducts = visualProducts.filter(
    (product) => product.group === selectedGroup,
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-[28px] bg-[#F7F5F0] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#DDD8CE] bg-white px-7 py-6 sm:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B59A68]">
              Add opening
            </p>

            <h2 className="mt-2 text-3xl font-light text-[#333333]">
              {selectedGroup
                ? `Select ${selectedGroup}`
                : 'Select category'}
            </h2>

            <p className="mt-2 text-sm text-[#888888]">
              {selectedGroup
                ? 'Choose the product type for this opening.'
                : 'Choose a product category to continue.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DDD8CE] bg-white text-2xl font-light text-[#777777] transition hover:border-[#B59A68] hover:text-[#B59A68]"
            aria-label="Close product selector"
          >
            ×
          </button>
        </div>

        {!selectedGroup ? (
          <div className="overflow-y-auto px-7 py-8 sm:px-10">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {categoryCards.map((category) => (
                <button
                  key={category.group}
                  type="button"
                  onClick={() =>
                    setSelectedGroup(category.group)
                  }
                  className="group flex min-h-[560px] flex-col overflow-hidden rounded-[24px] border border-[#DEDAD1] bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#B59A68] hover:shadow-xl"
                >
                  <div className="flex h-[400px] items-center justify-center overflow-hidden bg-[#F1EFEA]">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B59A68]">
                      Category
                    </p>

                    <h3 className="mt-2 text-2xl font-light text-[#333333]">
                      {category.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#888888]">
                      {category.subtitle}
                    </p>

                    <div className="mt-auto pt-5">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#555555] transition group-hover:text-[#B59A68]">
                        View products →
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDD8CE] bg-[#EEEAE2] px-7 py-4 sm:px-10">
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[#666666] transition hover:text-[#B59A68]"
              >
                ← Back to categories
              </button>

              <div className="flex items-center rounded-full bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => onImpactChange(false)}
                  className={`rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    !impact
                      ? 'bg-[#222222] text-white'
                      : 'text-[#888888] hover:text-[#333333]'
                  }`}
                >
                  Non-Impact
                </button>

                <button
                  type="button"
                  onClick={() => onImpactChange(true)}
                  className={`rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    impact
                      ? 'bg-[#B59A68] text-white'
                      : 'text-[#888888] hover:text-[#333333]'
                  }`}
                >
                  Impact
                </button>
              </div>
            </div>

            {selectedGroup === 'Specialty' ? (
              <SpecialtySelector
                impact={impact}
                onSelect={onSelect}
              />
            ) : (
            <div className="overflow-y-auto px-7 py-8 sm:px-10">
              <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6">
                {filteredProducts.map((product) => (
                  <button
                    key={product.category}
                    type="button"
                    onClick={() =>
                      onSelect(product.category, impact)
                    }
                    className="group relative flex min-h-[520px] w-[300px] flex-none snap-start flex-col overflow-hidden rounded-[24px] border border-[#DEDAD1] bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#B59A68] hover:shadow-xl sm:w-[340px]"
                  >
                    <div className="relative flex h-[360px] items-center justify-center overflow-hidden bg-[#F1EFEA] p-7">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain transition duration-500 group-hover:scale-[1.04]"
                      />

                      <span
                        className={`absolute left-5 top-5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                          impact
                            ? 'bg-[#B59A68] text-white'
                            : 'bg-[#222222] text-white'
                        }`}
                      >
                        {impact ? 'Impact' : 'Non-Impact'}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B59A68]">
                        Product
                      </p>

                      <h3 className="mt-2 text-2xl font-light text-[#333333]">
                        {product.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[#888888]">
                        {product.subtitle}
                      </p>

                      <div className="mt-auto pt-5">
                        <span className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.14em] text-[#555555] transition group-hover:text-[#B59A68]">
                          Select product →
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

