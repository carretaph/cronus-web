import { pricingConfig } from '../data/pricing'

export type MeasurementValue =
  | string
  | number
  | null
  | undefined

export type PricingUnit =
  | 'Per sq. ft.'
  | 'Per opening'
  | 'Fixed'
  | 'Percentage'
  | 'Per linear ft.'
  | 'Per mile'

type ProductCategory = 'Window' | 'Door'

type ProductPrice = {
  id: string
  name: string
  configuration?: string
  category: ProductCategory
  pricingUnit: PricingUnit
  standardRate: number
  smallOpeningRate: number
  smallOpeningThreshold: number
  active: boolean
}

type CostItem = {
  id: string
  name: string
  pricingUnit: PricingUnit
  cost: number
  active: boolean
}

type BusinessRules = {
  defaultMarkup: number
  minimumGrossMargin: number
  minimumProjectProfit: number
  maximumSalesDiscount: number
  salesTax: number
}

type StoredPriceBook = {
  manufacturer: string
  distributor: string
  priceBookName: string
  effectiveDate: string
  products: ProductPrice[]
  additionalCosts: CostItem[]
  laborCosts: CostItem[]
  businessRules: BusinessRules
}

export type CoreProductPriceInput = {
  width: MeasurementValue
  height: MeasurementValue
  productCategory?: string
  configuration?: string
  isDoor: boolean
  impact: boolean
  tempered?: boolean
  tinted?: boolean
  privacyGlass?: boolean
  grids?: boolean
  color?: string
  screen?: boolean
}

export type CoreProductPriceBreakdown = {
  width: number
  height: number
  squareFeet: number
  ratePerSquareFoot: number

  supplierBaseCost: number
  supplierImpactCost: number
  supplierTemperedCost: number
  supplierTintedCost: number
  supplierPrivacyGlassCost: number
  supplierGridsCost: number
  supplierColorCost: number
  supplierScreenAdjustment: number
  supplierInstallationCost: number
  supplierTotalCost: number

  markupPercent: number

  basePrice: number
  impactPrice: number
  temperedPrice: number
  tintedPrice: number
  privacyGlassPrice: number
  gridsPrice: number
  colorPrice: number
  screenAdjustment: number
  installationPrice: number
  total: number
}

const PRICING_STORAGE_KEY =
  'cronus_pricing_engine_v1'

function normalizeName(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_()-]/g, ' ')
    .replace(/\s+/g, ' ')
}

function getFallbackPriceBook(): StoredPriceBook {
  const windowRate =
    pricingConfig.window10SquareFeetOrMore

  const smallWindowRate =
    pricingConfig.windowUnder10SquareFeet

  const doorRate =
    pricingConfig.doorPerSquareFoot

  return {
    manufacturer: 'Ply Gem',
    distributor: 'GL',
    priceBookName: 'Fallback Pricing',
    effectiveDate: '',

    products: [
      {
        id: 'single-hung',
        name: 'Single Hung',
        configuration: 'Standard',
        category: 'Window',
        pricingUnit: 'Per sq. ft.',
        standardRate: windowRate,
        smallOpeningRate: smallWindowRate,
        smallOpeningThreshold: 10,
        active: true,
      },

      {
        id: 'double-hung',
        name: 'Double Hung',
        configuration: 'Standard',
        category: 'Window',
        pricingUnit: 'Per sq. ft.',
        standardRate: windowRate,
        smallOpeningRate: smallWindowRate,
        smallOpeningThreshold: 10,
        active: true,
      },

      {
        id: 'sliding-window',
        name: 'Sliding Window',
        configuration: 'Standard',
        category: 'Window',
        pricingUnit: 'Per sq. ft.',
        standardRate: windowRate,
        smallOpeningRate: smallWindowRate,
        smallOpeningThreshold: 10,
        active: true,
      },

      {
        id: 'picture-window',
        name: 'Picture Window',
        configuration: 'Standard',
        category: 'Window',
        pricingUnit: 'Per sq. ft.',
        standardRate: windowRate,
        smallOpeningRate: smallWindowRate,
        smallOpeningThreshold: 10,
        active: true,
      },

      {
        id: 'casement',
        name: 'Casement',
        configuration: 'Standard',
        category: 'Window',
        pricingUnit: 'Per sq. ft.',
        standardRate: windowRate,
        smallOpeningRate: smallWindowRate,
        smallOpeningThreshold: 10,
        active: true,
      },

      {
        id: 'awning',
        name: 'Awning',
        configuration: 'Standard',
        category: 'Window',
        pricingUnit: 'Per sq. ft.',
        standardRate: windowRate,
        smallOpeningRate: smallWindowRate,
        smallOpeningThreshold: 10,
        active: true,
      },

      {
        id: 'sliding-door-2-panel',
        name: 'Sliding Glass Door',
        configuration: '2 Panels',
        category: 'Door',
        pricingUnit: 'Per sq. ft.',
        standardRate: doorRate,
        smallOpeningRate: 0,
        smallOpeningThreshold: 0,
        active: true,
      },

      {
        id: 'sliding-door-3-panel',
        name: 'Sliding Glass Door',
        configuration: '3 Panels',
        category: 'Door',
        pricingUnit: 'Per sq. ft.',
        standardRate: doorRate,
        smallOpeningRate: 0,
        smallOpeningThreshold: 0,
        active: true,
      },

      {
        id: 'sliding-door-4-panel',
        name: 'Sliding Glass Door',
        configuration: '4 Panels',
        category: 'Door',
        pricingUnit: 'Per sq. ft.',
        standardRate: doorRate,
        smallOpeningRate: 0,
        smallOpeningThreshold: 0,
        active: true,
      },

      {
        id: 'french-door-1-panel',
        name: 'French Door',
        configuration: '1 Panel',
        category: 'Door',
        pricingUnit: 'Per sq. ft.',
        standardRate: doorRate,
        smallOpeningRate: 0,
        smallOpeningThreshold: 0,
        active: true,
      },

      {
        id: 'french-door-2-panel',
        name: 'French Door',
        configuration: '2 Panels',
        category: 'Door',
        pricingUnit: 'Per sq. ft.',
        standardRate: doorRate,
        smallOpeningRate: 0,
        smallOpeningThreshold: 0,
        active: true,
      },

      {
        id: 'entry-door-1-panel',
        name: 'Entry Door',
        configuration: '1 Panel',
        category: 'Door',
        pricingUnit: 'Per sq. ft.',
        standardRate: doorRate,
        smallOpeningRate: 0,
        smallOpeningThreshold: 0,
        active: true,
      },

      {
        id: 'entry-door-2-panel',
        name: 'Entry Door',
        configuration: '2 Panels',
        category: 'Door',
        pricingUnit: 'Per sq. ft.',
        standardRate: doorRate,
        smallOpeningRate: 0,
        smallOpeningThreshold: 0,
        active: true,
      },

      {
        id: 'entry-door-1-sidelight',
        name: 'Entry Door',
        configuration:
          '1 Panel + 1 Sidelight',
        category: 'Door',
        pricingUnit: 'Per sq. ft.',
        standardRate: doorRate,
        smallOpeningRate: 0,
        smallOpeningThreshold: 0,
        active: true,
      },

      {
        id: 'entry-door-2-sidelights',
        name: 'Entry Door',
        configuration:
          '1 Panel + 2 Sidelights',
        category: 'Door',
        pricingUnit: 'Per sq. ft.',
        standardRate: doorRate,
        smallOpeningRate: 0,
        smallOpeningThreshold: 0,
        active: true,
      },
    ],

    additionalCosts: [],

    laborCosts: [],

    businessRules: {
      defaultMarkup: 100,
      minimumGrossMargin: 35,
      minimumProjectProfit: 3000,
      maximumSalesDiscount: 10,
      salesTax: 0,
    },
  }
}

export function getPricingPriceBook(): StoredPriceBook {
  const fallbackPriceBook =
    getFallbackPriceBook()

  try {
    const storedValue = localStorage.getItem(
      PRICING_STORAGE_KEY,
    )

    if (!storedValue) {
      return fallbackPriceBook
    }

    const parsedValue = JSON.parse(
      storedValue,
    ) as Partial<StoredPriceBook>

    return {
      ...fallbackPriceBook,
      ...parsedValue,

      products:
        parsedValue.products ??
        fallbackPriceBook.products,

      additionalCosts:
        parsedValue.additionalCosts ??
        fallbackPriceBook.additionalCosts,

      laborCosts:
        parsedValue.laborCosts ??
        fallbackPriceBook.laborCosts,

      businessRules: {
        ...fallbackPriceBook.businessRules,
        ...parsedValue.businessRules,
      },
    }
  } catch {
    return fallbackPriceBook
  }
}

export function parsePricingMeasurement(
  value: MeasurementValue,
): number {
  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? value
      : 0
  }

  if (typeof value !== 'string') {
    return 0
  }

  const parsedValue = Number.parseFloat(
    value.replace(/[^0-9.]/g, ''),
  )

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0
}

export function calculateSquareFeet(
  widthValue: MeasurementValue,
  heightValue: MeasurementValue,
): number {
  const width =
    parsePricingMeasurement(widthValue)

  const height =
    parsePricingMeasurement(heightValue)

  if (width <= 0 || height <= 0) {
    return 0
  }

  return (width * height) / 144
}

function calculateLinearFeet(
  width: number,
  height: number,
) {
  if (width <= 0 || height <= 0) {
    return 0
  }

  return (width * 2 + height * 2) / 12
}

function applyMarkup(
  supplierCost: number,
  markupPercent: number,
) {
  return (
    supplierCost *
    (1 + markupPercent / 100)
  )
}

function calculateConfiguredCost(
  item: CostItem | undefined,
  squareFeet: number,
  linearFeet: number,
  baseCost: number,
) {
  if (
    !item ||
    !item.active ||
    item.cost === 0
  ) {
    return 0
  }

  switch (item.pricingUnit) {
    case 'Per sq. ft.':
      return squareFeet * item.cost

    case 'Per linear ft.':
      return linearFeet * item.cost

    case 'Percentage':
      return baseCost * (item.cost / 100)

    case 'Per opening':
    case 'Fixed':
      return item.cost

    case 'Per mile':
      return 0

    default:
      return 0
  }
}

function findCostItem(
  items: CostItem[],
  possibleNames: string[],
) {
  const normalizedNames =
    possibleNames.map(normalizeName)

  return items.find((item) => {
    const itemName =
      normalizeName(item.name)

    return normalizedNames.some(
      (possibleName) =>
        itemName === possibleName ||
        itemName.includes(possibleName),
    )
  })
}

function productNameMatches(
  configuredName: string,
  requestedName: string,
) {
  const aliases: Record<
    string,
    string[]
  > = {
    'single hung': [
      'single hung',
      'singlehung',
    ],

    'double hung': [
      'double hung',
      'doublehung',
    ],

    'sliding window': [
      'sliding window',
      'sliding',
      'slider',
      'horizontal roller',
    ],

    'picture window': [
      'picture window',
      'picture',
      'fixed window',
      'fixed',
    ],

    casement: [
      'casement',
    ],

    awning: [
      'awning',
    ],

    geometric: [
      'geometric',
      'shape',
      'special shape',
    ],

    'sliding glass door': [
      'sliding glass door',
      'sliding door',
      'patio door',
    ],

    'entry door': [
      'entry door',
      'front door',
    ],

    'french door': [
      'french door',
    ],
  }

  if (configuredName === requestedName) {
    return true
  }

  const matchingAliases =
    aliases[configuredName] ?? [
      configuredName,
    ]

  return matchingAliases.some(
    (alias) =>
      requestedName === alias ||
      requestedName.includes(alias) ||
      alias.includes(requestedName),
  )
}

function findConfiguredProduct(
  products: ProductPrice[],
  productCategory: string | undefined,
  configuration: string | undefined,
  isDoor: boolean,
) {
  const requestedName =
    normalizeName(productCategory)

  const requestedConfiguration =
    normalizeName(configuration)

  const activeProducts =
    products.filter(
      (product) =>
        product.active &&
        product.category ===
          (isDoor ? 'Door' : 'Window'),
    )

  const matchingProducts =
    activeProducts.filter((product) =>
      productNameMatches(
        normalizeName(product.name),
        requestedName,
      ),
    )

  if (matchingProducts.length === 0) {
    return activeProducts[0]
  }

  if (
    requestedConfiguration &&
    requestedConfiguration !== 'standard'
  ) {
    const exactConfigurationMatch =
      matchingProducts.find(
        (product) =>
          normalizeName(
            product.configuration,
          ) === requestedConfiguration,
      )

    if (exactConfigurationMatch) {
      return exactConfigurationMatch
    }
  }

  const standardConfiguration =
    matchingProducts.find(
      (product) =>
        !product.configuration ||
        normalizeName(
          product.configuration,
        ) === 'standard',
    )

  if (standardConfiguration) {
    return standardConfiguration
  }

  return matchingProducts[0]
}

export function calculateCoreProductPrice({
  width: widthValue,
  height: heightValue,
  productCategory,
  configuration,
  isDoor,
  impact,
  tempered = false,
  tinted = false,
  privacyGlass = false,
  grids = false,
  color = 'White',
  screen = true,
}: CoreProductPriceInput): CoreProductPriceBreakdown {
  const priceBook =
    getPricingPriceBook()

  const width =
    parsePricingMeasurement(widthValue)

  const height =
    parsePricingMeasurement(heightValue)

  const squareFeet =
    width > 0 && height > 0
      ? (width * height) / 144
      : 0

  const linearFeet =
    calculateLinearFeet(
      width,
      height,
    )

  const configuredProduct =
    findConfiguredProduct(
      priceBook.products,
      productCategory,
      configuration,
      isDoor,
    )

  const smallOpeningThreshold =
    configuredProduct
      ?.smallOpeningThreshold ??
    (isDoor ? 0 : 10)

  const standardRate =
    configuredProduct?.standardRate ??
    (isDoor
      ? pricingConfig.doorPerSquareFoot
      : pricingConfig
          .window10SquareFeetOrMore)

  const smallOpeningRate =
    configuredProduct
      ?.smallOpeningRate ??
    (isDoor
      ? standardRate
      : pricingConfig
          .windowUnder10SquareFeet)

  const ratePerSquareFoot =
    !isDoor &&
    smallOpeningThreshold > 0 &&
    squareFeet < smallOpeningThreshold
      ? smallOpeningRate
      : standardRate

  const supplierBaseCost =
    squareFeet * ratePerSquareFoot

  const impactItem = findCostItem(
    priceBook.additionalCosts,
    [
      'Impact Glass',
      'Impact',
    ],
  )

  const temperedItem = findCostItem(
    priceBook.additionalCosts,
    [
      'Tempered Glass',
      'Tempered',
    ],
  )

  const tintedItem = findCostItem(
    priceBook.additionalCosts,
    [
      'Tinted Glass',
      'Tinted',
      'Tint',
    ],
  )

  const privacyGlassItem = findCostItem(
    priceBook.additionalCosts,
    [
      'Privacy Glass',
      'Obscure Glass',
      'Obscure',
    ],
  )

  const gridsItem = findCostItem(
    priceBook.additionalCosts,
    [
      'Grids',
      'Grid',
    ],
  )

  const colorItem = findCostItem(
    priceBook.additionalCosts,
    [
      'Exterior Color Upgrade',
      'Color Upgrade',
      'Color',
    ],
  )

  const screenRemovalItem =
    findCostItem(
      priceBook.additionalCosts,
      [
        'Screen Removal Credit',
        'Screen Credit',
      ],
    )

  const installationItem =
    findCostItem(
      priceBook.laborCosts,
      isDoor
        ? [
            'Door Installation',
            'Installation Door',
          ]
        : [
            'Window Installation',
            'Installation Window',
          ],
    )

  const supplierImpactCost =
    impact
      ? calculateConfiguredCost(
          impactItem,
          squareFeet,
          linearFeet,
          supplierBaseCost,
        )
      : 0

  const supplierTemperedCost =
    tempered
      ? calculateConfiguredCost(
          temperedItem,
          squareFeet,
          linearFeet,
          supplierBaseCost,
        )
      : 0

  const supplierTintedCost =
    tinted
      ? calculateConfiguredCost(
          tintedItem,
          squareFeet,
          linearFeet,
          supplierBaseCost,
        )
      : 0

  const supplierPrivacyGlassCost =
    privacyGlass
      ? calculateConfiguredCost(
          privacyGlassItem,
          squareFeet,
          linearFeet,
          supplierBaseCost,
        )
      : 0

  const supplierGridsCost =
    grids
      ? calculateConfiguredCost(
          gridsItem,
          squareFeet,
          linearFeet,
          supplierBaseCost,
        )
      : 0

  const supplierColorCost =
    normalizeName(color) !== 'white'
      ? calculateConfiguredCost(
          colorItem,
          squareFeet,
          linearFeet,
          supplierBaseCost,
        )
      : 0

  const supplierScreenAdjustment =
    !isDoor && !screen
      ? -calculateConfiguredCost(
          screenRemovalItem,
          squareFeet,
          linearFeet,
          supplierBaseCost,
        )
      : 0

  const supplierInstallationCost =
    calculateConfiguredCost(
      installationItem,
      squareFeet,
      linearFeet,
      supplierBaseCost,
    )

  const supplierTotalCost =
    supplierBaseCost +
    supplierImpactCost +
    supplierTemperedCost +
    supplierTintedCost +
    supplierPrivacyGlassCost +
    supplierGridsCost +
    supplierColorCost +
    supplierScreenAdjustment +
    supplierInstallationCost

  const markupPercent =
    priceBook.businessRules
      .defaultMarkup

  const basePrice =
    applyMarkup(
      supplierBaseCost,
      markupPercent,
    )

  const impactPrice =
    applyMarkup(
      supplierImpactCost,
      markupPercent,
    )

  const temperedPrice =
    applyMarkup(
      supplierTemperedCost,
      markupPercent,
    )

  const tintedPrice =
    applyMarkup(
      supplierTintedCost,
      markupPercent,
    )

  const privacyGlassPrice =
    applyMarkup(
      supplierPrivacyGlassCost,
      markupPercent,
    )

  const gridsPrice =
    applyMarkup(
      supplierGridsCost,
      markupPercent,
    )

  const colorPrice =
    applyMarkup(
      supplierColorCost,
      markupPercent,
    )

  const screenAdjustment =
    applyMarkup(
      supplierScreenAdjustment,
      markupPercent,
    )

  const installationPrice =
    applyMarkup(
      supplierInstallationCost,
      markupPercent,
    )

  return {
    width,
    height,
    squareFeet,
    ratePerSquareFoot,

    supplierBaseCost,
    supplierImpactCost,
    supplierTemperedCost,
    supplierTintedCost,
    supplierPrivacyGlassCost,
    supplierGridsCost,
    supplierColorCost,
    supplierScreenAdjustment,
    supplierInstallationCost,
    supplierTotalCost,

    markupPercent,

    basePrice,
    impactPrice,
    temperedPrice,
    tintedPrice,
    privacyGlassPrice,
    gridsPrice,
    colorPrice,
    screenAdjustment,
    installationPrice,

    total: applyMarkup(
      supplierTotalCost,
      markupPercent,
    ),
  }
}

