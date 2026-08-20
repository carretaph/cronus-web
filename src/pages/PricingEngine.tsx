import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getProductPrices,
  createProductPrice,
  updateProductPrice,
  deleteProductPrice,
  getAdditionalCosts,
  createAdditionalCost,
  updateAdditionalCostApi,
  deleteAdditionalCost,
  getLaborCosts,
  createLaborCost,
  updateLaborCostApi,
  deleteLaborCost,
  getBusinessRules,
  createBusinessRules,
  updateBusinessRulesApi,
} from '../services/pricingApi'

type PricingUnit =
  | 'Per sq. ft.'
  | 'Per opening'
  | 'Fixed'
  | 'Percentage'
  | 'Per linear ft.'
  | 'Per mile'

type ProductCategory = 'Window' | 'Door'

type ProductPrice = {
  id: string
  databaseId?: number
  manufacturer: string
  supplier: string
  name: string
  configuration: string
  material?: string
  category: ProductCategory
  pricingUnit: PricingUnit
  standardRate: number
  smallOpeningRate: number
  smallOpeningThreshold: number
  active: boolean
}

type AdditionalCost = {
  id: string
  databaseId?: number
  name: string
  pricingUnit: PricingUnit
  cost: number
  active: boolean
}

type LaborCost = {
  id: string
  databaseId?: number
  name: string
  pricingUnit: PricingUnit
  cost: number
  newConstructionCost: number
  commercialCost: number
  active: boolean
}

type BusinessRules = {
  databaseId?: number
  defaultMarkup: number
  newConstructionMarkup: number
  commercialMarkup: number
  minimumGrossMargin: number
  minimumProjectProfit: number
  maximumSalesDiscount: number
  salesTax: number
}

type PriceBook = {
  manufacturer: string
  distributor: string
  priceBookName: string
  effectiveDate: string
  products: ProductPrice[]
  additionalCosts: AdditionalCost[]
  laborCosts: LaborCost[]
  businessRules: BusinessRules
}

const STORAGE_KEY =
  'cronus_pricing_engine_v1'

const pricingUnits: PricingUnit[] = [
  'Per sq. ft.',
  'Per opening',
  'Fixed',
  'Percentage',
  'Per linear ft.',
  'Per mile',
]

const windowProductOptions = [
  'Single Hung',
  'Double Hung',
  'Sliding Window',
  'Picture Window',
  'Casement',
  'Awning',
] as const

const doorProductOptions = [
  'Sliding Glass Door',
  'French Door',
  'Entry Door',
] as const

const productConfigurationOptions: Record<
  string,
  readonly string[]
> = {
  'Single Hung': ['Standard'],
  'Double Hung': ['Standard'],
  'Sliding Window': ['Standard'],
  'Picture Window': ['Standard'],
  Casement: ['Standard'],
  Awning: ['Standard'],

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

const defaultPriceBook: PriceBook = {
  manufacturer: 'Ply Gem',
  distributor: 'GL',
  priceBookName: 'Current Price Database',
  effectiveDate: new Date()
    .toISOString()
    .slice(0, 10),

  products: [
    {
      id: 'single-hung',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'Single Hung',
      configuration: 'Standard',
      category: 'Window',
      pricingUnit: 'Per sq. ft.',
      standardRate: 106,
      smallOpeningRate: 135,
      smallOpeningThreshold: 10,
      active: true,
    },
    {
      id: 'double-hung',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'Double Hung',
      configuration: 'Standard',
      category: 'Window',
      pricingUnit: 'Per sq. ft.',
      standardRate: 106,
      smallOpeningRate: 135,
      smallOpeningThreshold: 10,
      active: true,
    },
    {
      id: 'sliding-window',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'Sliding Window',
      configuration: 'Standard',
      category: 'Window',
      pricingUnit: 'Per sq. ft.',
      standardRate: 106,
      smallOpeningRate: 135,
      smallOpeningThreshold: 10,
      active: true,
    },
    {
      id: 'picture-window',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'Picture Window',
      configuration: 'Standard',
      category: 'Window',
      pricingUnit: 'Per sq. ft.',
      standardRate: 106,
      smallOpeningRate: 135,
      smallOpeningThreshold: 10,
      active: true,
    },
    {
      id: 'casement',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'Casement',
      configuration: 'Standard',
      category: 'Window',
      pricingUnit: 'Per sq. ft.',
      standardRate: 106,
      smallOpeningRate: 135,
      smallOpeningThreshold: 10,
      active: true,
    },
    {
      id: 'awning',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'Awning',
      configuration: 'Standard',
      category: 'Window',
      pricingUnit: 'Per sq. ft.',
      standardRate: 106,
      smallOpeningRate: 135,
      smallOpeningThreshold: 10,
      active: true,
    },

    {
      id: 'sliding-door-2-panel',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'Sliding Glass Door',
      configuration: '2 Panels',
      category: 'Door',
      pricingUnit: 'Per sq. ft.',
      standardRate: 51,
      smallOpeningRate: 0,
      smallOpeningThreshold: 0,
      active: true,
    },
    {
      id: 'sliding-door-3-panel',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'Sliding Glass Door',
      configuration: '3 Panels',
      category: 'Door',
      pricingUnit: 'Per sq. ft.',
      standardRate: 51,
      smallOpeningRate: 0,
      smallOpeningThreshold: 0,
      active: true,
    },
    {
      id: 'sliding-door-4-panel',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'Sliding Glass Door',
      configuration: '4 Panels',
      category: 'Door',
      pricingUnit: 'Per sq. ft.',
      standardRate: 51,
      smallOpeningRate: 0,
      smallOpeningThreshold: 0,
      active: true,
    },

    {
      id: 'french-door-1-panel',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'French Door',
      configuration: '1 Panel',
      category: 'Door',
      pricingUnit: 'Per sq. ft.',
      standardRate: 51,
      smallOpeningRate: 0,
      smallOpeningThreshold: 0,
      active: true,
    },
    {
      id: 'french-door-2-panel',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'French Door',
      configuration: '2 Panels',
      category: 'Door',
      pricingUnit: 'Per sq. ft.',
      standardRate: 51,
      smallOpeningRate: 0,
      smallOpeningThreshold: 0,
      active: true,
    },

    {
      id: 'entry-door-1-panel',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'Entry Door',
      configuration: '1 Panel',
      category: 'Door',
      pricingUnit: 'Per sq. ft.',
      standardRate: 51,
      smallOpeningRate: 0,
      smallOpeningThreshold: 0,
      active: true,
    },
    {
      id: 'entry-door-2-panel',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'Entry Door',
      configuration: '2 Panels',
      category: 'Door',
      pricingUnit: 'Per sq. ft.',
      standardRate: 51,
      smallOpeningRate: 0,
      smallOpeningThreshold: 0,
      active: true,
    },
    {
      id: 'entry-door-1-sidelight',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'Entry Door',
      configuration:
        '1 Panel + 1 Sidelight',
      category: 'Door',
      pricingUnit: 'Per sq. ft.',
      standardRate: 51,
      smallOpeningRate: 0,
      smallOpeningThreshold: 0,
      active: true,
    },
    {
      id: 'entry-door-2-sidelights',
      manufacturer: 'Ply Gem',
      supplier: 'GL',
      name: 'Entry Door',
      configuration:
        '1 Panel + 2 Sidelights',
      category: 'Door',
      pricingUnit: 'Per sq. ft.',
      standardRate: 51,
      smallOpeningRate: 0,
      smallOpeningThreshold: 0,
      active: true,
    },
  ],

  additionalCosts: [
    {
      id: 'impact-glass',
      name: 'Impact Glass',
      pricingUnit: 'Percentage',
      cost: 100,
      active: true,
    },
    {
      id: 'tempered-glass',
      name: 'Tempered Glass',
      pricingUnit: 'Per sq. ft.',
      cost: 0,
      active: true,
    },
    {
      id: 'tinted-glass',
      name: 'Tinted Glass',
      pricingUnit: 'Per sq. ft.',
      cost: 0,
      active: true,
    },
    {
      id: 'obscure-glass',
      name: 'Obscure Glass',
      pricingUnit: 'Per sq. ft.',
      cost: 0,
      active: true,
    },
    {
      id: 'exterior-color',
      name: 'Exterior Color Upgrade',
      pricingUnit: 'Per opening',
      cost: 0,
      active: true,
    },
    {
      id: 'grids',
      name: 'Grids',
      pricingUnit: 'Per sq. ft.',
      cost: 0,
      active: true,
    },
    {
      id: 'screen-removal-credit',
      name: 'Screen Removal Credit',
      pricingUnit: 'Per opening',
      cost: 0,
      active: true,
    },
  ],

  laborCosts: [
    {
      id: 'window-installation',
      name: 'Window Installation',
      pricingUnit: 'Per opening',
      cost: 0,
      newConstructionCost: 0,
      commercialCost: 0,
      active: true,
    },
    {
      id: 'door-installation',
      name: 'Door Installation',
      pricingUnit: 'Per opening',
      cost: 0,
      newConstructionCost: 0,
      commercialCost: 0,
      active: true,
    },
    {
      id: 'installation-materials',
      name: 'Installation Materials',
      pricingUnit: 'Per opening',
      cost: 0,
      newConstructionCost: 0,
      commercialCost: 0,
      active: true,
    },
    {
      id: 'permit',
      name: 'Permit',
      pricingUnit: 'Fixed',
      cost: 0,
      newConstructionCost: 0,
      commercialCost: 0,
      active: true,
    },
    {
      id: 'engineering',
      name: 'Engineering',
      pricingUnit: 'Fixed',
      cost: 0,
      newConstructionCost: 0,
      commercialCost: 0,
      active: true,
    },
    {
      id: 'dumpster',
      name: 'Dumpster',
      pricingUnit: 'Fixed',
      cost: 0,
      newConstructionCost: 0,
      commercialCost: 0,
      active: true,
    },
    {
      id: 'travel',
      name: 'Travel',
      pricingUnit: 'Fixed',
      cost: 0,
      newConstructionCost: 0,
      commercialCost: 0,
      active: true,
    },
  ],

  businessRules: {
    defaultMarkup: 100,
    newConstructionMarkup: 100,
    commercialMarkup: 100,
    minimumGrossMargin: 35,
    minimumProjectProfit: 3000,
    maximumSalesDiscount: 10,
    salesTax: 0,
  },
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function parseNumber(value: string) {
  const parsedValue = Number(value)

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function normalizeProduct(
  product: Partial<ProductPrice>,
  manufacturer: string,
  supplier: string,
): ProductPrice {
  return {
    id:
      product.id ??
      createId('product'),

    manufacturer:
      product.manufacturer ??
      manufacturer,

    supplier:
      product.supplier ??
      supplier,

    name:
      product.name ??
      'New Product',

    configuration:
      product.configuration ??
      'Standard',

    category:
      product.category ??
      'Window',

    pricingUnit:
      product.pricingUnit ??
      'Per sq. ft.',

    standardRate:
      product.standardRate ?? 0,

    smallOpeningRate:
      product.smallOpeningRate ?? 0,

    smallOpeningThreshold:
      product.smallOpeningThreshold ?? 10,

    active:
      product.active ?? true,
  }
}

function loadStoredPriceBook(): PriceBook {
  try {
    const storedValue =
      localStorage.getItem(STORAGE_KEY)

    if (!storedValue) {
      return defaultPriceBook
    }

    const parsedValue = JSON.parse(
      storedValue,
    ) as Partial<PriceBook>

    const manufacturer =
      parsedValue.manufacturer ??
      defaultPriceBook.manufacturer

    const distributor =
      parsedValue.distributor ??
      defaultPriceBook.distributor

    const storedProducts =
      parsedValue.products ??
      defaultPriceBook.products

    return {
      ...defaultPriceBook,
      ...parsedValue,

      manufacturer,
      distributor,

      products:
        storedProducts.map((product) =>
          normalizeProduct(
            product,
            manufacturer,
            distributor,
          ),
        ),

      additionalCosts:
        parsedValue.additionalCosts ??
        defaultPriceBook.additionalCosts,

      laborCosts:
        parsedValue.laborCosts ??
        defaultPriceBook.laborCosts,

      businessRules: {
        ...defaultPriceBook.businessRules,
        ...parsedValue.businessRules,
      },
    }
  } catch {
    return defaultPriceBook
  }
}

export default function PricingEngine() {
  const [priceBook, setPriceBook] =
    useState<PriceBook>(
      loadStoredPriceBook,
    )

  const [
    savedPriceBook,
    setSavedPriceBook,
  ] = useState<PriceBook>(
    loadStoredPriceBook,
  )

  const [
    pricingDatabaseLoaded,
    setPricingDatabaseLoaded,
  ] = useState(false)

  const [saveMessage, setSaveMessage] =
    useState('')

  const [search, setSearch] =
    useState('')

  const [
    manufacturerFilter,
    setManufacturerFilter,
  ] = useState('All')

  const [
    supplierFilter,
    setSupplierFilter,
  ] = useState('All')

  const hasUnsavedChanges = useMemo(
    () =>
      JSON.stringify(priceBook) !==
      JSON.stringify(savedPriceBook),
    [priceBook, savedPriceBook],
  )

  const manufacturers = useMemo(
    () =>
      Array.from(
        new Set(
          priceBook.products
            .map(
              (product) =>
                product.manufacturer,
            )
            .filter(Boolean),
        ),
      ).sort(),
    [priceBook.products],
  )

  const suppliers = useMemo(
    () =>
      Array.from(
        new Set(
          priceBook.products
            .map(
              (product) =>
                product.supplier,
            )
            .filter(Boolean),
        ),
      ).sort(),
    [priceBook.products],
  )

  const filteredProducts =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase()

      return priceBook.products.filter(
        (product) => {
          if (
            manufacturerFilter !== 'All' &&
            product.manufacturer !==
            manufacturerFilter
          ) {
            return false
          }

          if (
            supplierFilter !== 'All' &&
            product.supplier !==
            supplierFilter
          ) {
            return false
          }

          if (!normalizedSearch) {
            return true
          }

          const haystack = [
            product.manufacturer,
            product.supplier,
            product.name,
            product.configuration,
            product.category,
          ]
            .join(' ')
            .toLowerCase()

          return haystack.includes(
            normalizedSearch,
          )
        },
      )
    }, [
      priceBook.products,
      search,
      manufacturerFilter,
      supplierFilter,
    ])

  const activeProducts =
    priceBook.products.filter(
      (product) => product.active,
    ).length

  useEffect(() => {
    async function loadProductsFromDatabase() {
      try {
        const databaseProducts =
          await getProductPrices()

        if (databaseProducts.length === 0) {
          setPricingDatabaseLoaded(true)
          return
        }

        const products: ProductPrice[] =
          databaseProducts.map((product) => ({
            id: `db-${product.id}`,
            databaseId: product.id,
            manufacturer: product.manufacturer,
            supplier: product.supplier,
            name: product.name,
            configuration: product.configuration,
            material: product.material ?? 'Vinyl',
            category:
              product.category.toUpperCase() === 'DOOR'
                ? 'Door'
                : 'Window',
            pricingUnit:
              product.pricingUnit as PricingUnit,
            standardRate: product.standardRate,
            smallOpeningRate:
              product.smallOpeningRate,
            smallOpeningThreshold:
              product.smallOpeningThreshold,
            active: product.active,
          }))

        setPriceBook((current) => ({
          ...current,
          products,
        }))

        setSavedPriceBook((current) => ({
          ...current,
          products,
        }))

        setPricingDatabaseLoaded(true)

      } catch (error) {
        console.error(
          'Unable to load pricing database:',
          error,
        )
      }
    }

    loadProductsFromDatabase()
  }, [])

  useEffect(() => {
    async function loadAdditionalCostsFromDatabase() {
      try {
        const databaseItems =
          await getAdditionalCosts()

        if (databaseItems.length === 0) {
          return
        }

        const additionalCosts: AdditionalCost[] =
          databaseItems.map((item) => ({
            id: `db-additional-${item.id}`,
            databaseId: item.id,
            name: item.name,
            pricingUnit:
              item.pricingUnit as PricingUnit,
            cost: item.cost,
            active: item.active,
          }))

        setPriceBook((current) => ({
          ...current,
          additionalCosts,
        }))

        setSavedPriceBook((current) => ({
          ...current,
          additionalCosts,
        }))
      } catch (error) {
        console.error(
          'Unable to load additional costs:',
          error,
        )
      }
    }

    loadAdditionalCostsFromDatabase()
  }, [])

  useEffect(() => {
    async function loadLaborCostsFromDatabase() {
      try {
        const databaseItems =
          await getLaborCosts()

        if (databaseItems.length === 0) {
          return
        }

        const laborCosts: LaborCost[] =
          databaseItems.map((item) => ({
            id: `db-labor-${item.id}`,
            databaseId: item.id,
            name: item.name,
            pricingUnit:
              item.pricingUnit as PricingUnit,
            cost: item.cost,
            newConstructionCost:
              item.newConstructionCost ?? item.cost,
            commercialCost:
              item.commercialCost ?? item.cost,
            active: item.active,
          }))

        setPriceBook((current) => ({
          ...current,
          laborCosts,
        }))

        setSavedPriceBook((current) => ({
          ...current,
          laborCosts,
        }))
      } catch (error) {
        console.error(
          'Unable to load labor costs:',
          error,
        )
      }
    }

    loadLaborCostsFromDatabase()
  }, [])

  useEffect(() => {
    async function loadBusinessRulesFromDatabase() {
      try {
        const databaseRules =
          await getBusinessRules()

        if (databaseRules.length === 0) {
          return
        }

        const rules = databaseRules[0]

        const businessRules: BusinessRules = {
          databaseId: rules.id,
          defaultMarkup: rules.defaultMarkup,
          newConstructionMarkup:
            rules.newConstructionMarkup ??
            rules.defaultMarkup,
          commercialMarkup:
            rules.commercialMarkup ??
            rules.defaultMarkup,
          minimumGrossMargin:
            rules.minimumGrossMargin,
          minimumProjectProfit:
            rules.minimumProjectProfit,
          maximumSalesDiscount:
            rules.maximumSalesDiscount,
          salesTax: rules.salesTax,
        }

        setPriceBook((current) => ({
          ...current,
          businessRules,
        }))

        setSavedPriceBook((current) => ({
          ...current,
          businessRules,
        }))
      } catch (error) {
        console.error(
          'Unable to load business rules:',
          error,
        )
      }
    }

    loadBusinessRulesFromDatabase()
  }, [])

  useEffect(() => {
    if (!saveMessage) {
      return
    }

    const timeout =
      window.setTimeout(() => {
        setSaveMessage('')
      }, 3000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [saveMessage])

  function updatePriceBookField(
    field:
      | 'manufacturer'
      | 'distributor'
      | 'priceBookName'
      | 'effectiveDate',
    value: string,
  ) {
    setPriceBook((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateProduct(
    id: string,
    changes: Partial<ProductPrice>,
  ) {
    setPriceBook((current) => ({
      ...current,

      products:
        current.products.map(
          (product) =>
            product.id === id
              ? {
                ...product,
                ...changes,
              }
              : product,
        ),
    }))
  }

  function addProduct() {
    setPriceBook((current) => ({
      ...current,

      products: [
        ...current.products,

        {
          id: createId('product'),

          manufacturer:
            manufacturerFilter !== 'All'
              ? manufacturerFilter
              : current.manufacturer,

          supplier:
            supplierFilter !== 'All'
              ? supplierFilter
              : current.distributor,

          name: 'New Product',

          configuration:
            'Standard',

          material: 'Vinyl',

          category: 'Window',

          pricingUnit:
            'Per sq. ft.',

          standardRate: 0,

          smallOpeningRate: 0,

          smallOpeningThreshold: 10,

          active: true,
        },
      ],
    }))
  }

  async function removeProduct(id: string) {
    const confirmed =
      window.confirm(
        'Remove this product price?',
      )

    if (!confirmed) {
      return
    }

    const productToRemove =
      priceBook.products.find(
        (product) => product.id === id,
      )

    if (!productToRemove) {
      return
    }

    try {
      if (productToRemove.databaseId) {
        await deleteProductPrice(
          productToRemove.databaseId,
        )
      }

      setPriceBook((current) => ({
        ...current,
        products:
          current.products.filter(
            (product) =>
              product.id !== id,
          ),
      }))

      setSavedPriceBook((current) => ({
        ...current,
        products:
          current.products.filter(
            (product) =>
              product.id !== id,
          ),
      }))

      setSaveMessage(
        'Product removed successfully.',
      )
    } catch (error) {
      console.error(
        'Unable to remove product:',
        error,
      )

      setSaveMessage(
        'Unable to remove product.',
      )
    }
  }

  function updateAdditionalCost(
    id: string,
    changes: Partial<AdditionalCost>,
  ) {
    setPriceBook((current) => ({
      ...current,

      additionalCosts:
        current.additionalCosts.map(
          (item) =>
            item.id === id
              ? {
                ...item,
                ...changes,
              }
              : item,
        ),
    }))
  }

  function addAdditionalCost() {
    setPriceBook((current) => ({
      ...current,

      additionalCosts: [
        ...current.additionalCosts,

        {
          id: createId('additional'),
          name: 'New Option',
          pricingUnit:
            'Per opening',
          cost: 0,
          active: true,
        },
      ],
    }))
  }

  async function removeAdditionalCost(
    id: string,
  ) {
    const confirmed =
      window.confirm(
        'Remove this option or add-on?',
      )

    if (!confirmed) {
      return
    }

    const itemToRemove =
      priceBook.additionalCosts.find(
        (item) => item.id === id,
      )

    if (!itemToRemove) {
      return
    }

    try {
      if (itemToRemove.databaseId) {
        await deleteAdditionalCost(
          itemToRemove.databaseId,
        )
      }

      setPriceBook((current) => ({
        ...current,
        additionalCosts:
          current.additionalCosts.filter(
            (item) => item.id !== id,
          ),
      }))

      setSavedPriceBook((current) => ({
        ...current,
        additionalCosts:
          current.additionalCosts.filter(
            (item) => item.id !== id,
          ),
      }))

      setSaveMessage(
        'Option or add-on removed successfully.',
      )
    } catch (error) {
      console.error(
        'Unable to remove option or add-on:',
        error,
      )

      setSaveMessage(
        'Unable to remove option or add-on.',
      )
    }
  }

  function updateLaborCost(
    id: string,
    changes: Partial<LaborCost>,
  ) {
    setPriceBook((current) => ({
      ...current,

      laborCosts:
        current.laborCosts.map(
          (item) =>
            item.id === id
              ? {
                ...item,
                ...changes,
              }
              : item,
        ),
    }))
  }

  function addLaborCost() {
    setPriceBook((current) => ({
      ...current,

      laborCosts: [
        ...current.laborCosts,

        {
          id: createId('labor'),
          name: 'New Project Cost',
          pricingUnit: 'Fixed',
          cost: 0,
          newConstructionCost: 0,
          commercialCost: 0,
          active: true,
        },
      ],
    }))
  }

  async function removeLaborCost(
    id: string,
  ) {
    const item =
      priceBook.laborCosts.find(
        (laborCost) =>
          laborCost.id === id,
      )

    if (!item) {
      return
    }

    try {
      if (item.databaseId) {
        await deleteLaborCost(
          item.databaseId,
        )
      }

      setPriceBook((current) => ({
        ...current,
        laborCosts:
          current.laborCosts.filter(
            (laborCost) =>
              laborCost.id !== id,
          ),
      }))

      setSavedPriceBook((current) => ({
        ...current,
        laborCosts:
          current.laborCosts.filter(
            (laborCost) =>
              laborCost.id !== id,
          ),
      }))

      setSaveMessage(
        'Labor cost removed successfully.',
      )
    } catch (error) {
      console.error(
        'Unable to remove labor cost:',
        error,
      )

      setSaveMessage(
        'Unable to remove labor cost.',
      )
    }
  }

  function updateBusinessRule(
    field: keyof BusinessRules,
    value: number,
  ) {
    setPriceBook((current) => ({
      ...current,

      businessRules: {
        ...current.businessRules,
        [field]: value,
      },
    }))
  }


  async function savePricing() {
    if (!pricingDatabaseLoaded) {
      setSaveMessage(
        'Pricing database is still loading. Please wait.',
      )
      return
    }

    try {
      setSaveMessage(
        'Saving pricing database...',
      )

      const savedProducts: ProductPrice[] = []

      for (const product of priceBook.products) {
        const apiProduct = {
          manufacturer: product.manufacturer,
          supplier: product.supplier,
          name: product.name,
          configuration: product.configuration,
          material: product.material ?? 'Vinyl',
          category: product.category,
          pricingUnit: product.pricingUnit,
          standardRate: product.standardRate,
          smallOpeningRate:
            product.smallOpeningRate,
          smallOpeningThreshold:
            product.smallOpeningThreshold,
          active: product.active,
        }

        if (product.databaseId) {
          const saved =
            await updateProductPrice(
              product.databaseId,
              apiProduct,
            )

          savedProducts.push({
            ...product,
            databaseId: saved.id,
            id: `db-${saved.id}`,
          })
        } else {
          const saved =
            await createProductPrice(
              apiProduct,
            )

          savedProducts.push({
            ...product,
            databaseId: saved.id,
            id: `db-${saved.id}`,
          })
        }
      }

      const savedAdditionalCosts: AdditionalCost[] = []

      for (const item of priceBook.additionalCosts) {
        const apiItem = {
          name: item.name,
          pricingUnit: item.pricingUnit,
          cost: item.cost,
          active: item.active,
        }

        if (item.databaseId) {
          const saved =
            await updateAdditionalCostApi(
              item.databaseId,
              apiItem,
            )

          savedAdditionalCosts.push({
            ...item,
            databaseId: saved.id,
            id: `db-additional-${saved.id}`,
          })
        } else {
          const saved =
            await createAdditionalCost(
              apiItem,
            )

          savedAdditionalCosts.push({
            ...item,
            databaseId: saved.id,
            id: `db-additional-${saved.id}`,
          })
        }
      }

      const savedLaborCosts: LaborCost[] = []

      for (const item of priceBook.laborCosts) {
        const apiItem = {
          name: item.name,
          pricingUnit: item.pricingUnit,
          cost: item.cost,
          newConstructionCost:
            item.newConstructionCost,
          commercialCost:
            item.commercialCost,
          active: item.active,
        }

        if (item.databaseId) {
          const saved =
            await updateLaborCostApi(
              item.databaseId,
              apiItem,
            )

          savedLaborCosts.push({
            ...item,
            databaseId: saved.id,
            id: `db-labor-${saved.id}`,
          })
        } else {
          const saved =
            await createLaborCost(
              apiItem,
            )

          savedLaborCosts.push({
            ...item,
            databaseId: saved.id,
            id: `db-labor-${saved.id}`,
          })
        }
      }

      let savedBusinessRules: BusinessRules

      const apiBusinessRules = {
        defaultMarkup:
          priceBook.businessRules.defaultMarkup,
        newConstructionMarkup:
          priceBook.businessRules
            .newConstructionMarkup,
        commercialMarkup:
          priceBook.businessRules
            .commercialMarkup,
        minimumGrossMargin:
          priceBook.businessRules.minimumGrossMargin,
        minimumProjectProfit:
          priceBook.businessRules.minimumProjectProfit,
        maximumSalesDiscount:
          priceBook.businessRules.maximumSalesDiscount,
        salesTax:
          priceBook.businessRules.salesTax,
      }

      if (priceBook.businessRules.databaseId) {
        const saved =
          await updateBusinessRulesApi(
            priceBook.businessRules.databaseId,
            apiBusinessRules,
          )

        savedBusinessRules = {
          ...priceBook.businessRules,
          databaseId: saved.id,
        }
      } else {
        const saved =
          await createBusinessRules(
            apiBusinessRules,
          )

        savedBusinessRules = {
          ...priceBook.businessRules,
          databaseId: saved.id,
        }
      }

      const updatedPriceBook = {
        ...priceBook,
        products: savedProducts,
        additionalCosts: savedAdditionalCosts,
        laborCosts: savedLaborCosts,
        businessRules: savedBusinessRules,
      }
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedPriceBook),
      )

      setPriceBook(updatedPriceBook)
      setSavedPriceBook(updatedPriceBook)

      setSaveMessage(
        'Pricing database saved successfully.',
      )
    } catch (error) {
      console.error(
        'Unable to save pricing database:',
        error,
      )

      setSaveMessage(
        'Unable to save pricing database.',
      )
    }
  }

  function discardChanges() {
    setPriceBook(savedPriceBook)

    setSaveMessage(
      'Unsaved changes discarded.',
    )
  }

  function resetPricing() {
    const confirmed =
      window.confirm(
        'Reset the pricing database to the original Ply Gem / GL values?',
      )

    if (!confirmed) {
      return
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultPriceBook),
    )

    setPriceBook(defaultPriceBook)

    setSavedPriceBook(
      defaultPriceBook,
    )

    setManufacturerFilter('All')
    setSupplierFilter('All')
    setSearch('')

    setSaveMessage(
      'Pricing database reset successfully.',
    )
  }

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#F7F6F2]">
      <section className="border-b border-[#E8E5DE] bg-white">
        <div className="mx-auto max-w-[1600px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#B59A68]">
                Pricing Administration
              </p>

              <h2 className="mt-3 text-3xl font-light tracking-[-0.03em] text-[#2E2E2E] sm:text-4xl">
                Price Database
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#777777] sm:text-base">
                Update supplier costs
                directly from the portal.
                New quotes use the saved
                pricing information
                automatically.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {hasUnsavedChanges && (
                <button
                  type="button"
                  onClick={
                    discardChanges
                  }
                  className="rounded-xl border border-[#DCD8CF] bg-white px-5 py-3 text-sm font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#B59A68]"
                >
                  Discard changes
                </button>
              )}

              <button
                type="button"
                onClick={savePricing}
                disabled={
                  !hasUnsavedChanges ||
                  !pricingDatabaseLoaded
                }
                className="rounded-xl bg-[#222222] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#B59A68] disabled:cursor-not-allowed disabled:bg-[#BDBDBD]"
              >
                Save Pricing
              </button>
            </div>
          </div>

          {saveMessage && (
            <div className="mt-6 rounded-xl border border-[#CFE0CF] bg-[#EFF7EF] px-4 py-3 text-sm font-medium text-[#4F6F4F]">
              {saveMessage}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-7 lg:px-10 lg:py-10">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Manufacturers"
            value={String(
              manufacturers.length,
            )}
            description="Configured manufacturers"
          />

          <SummaryCard
            label="Suppliers"
            value={String(
              suppliers.length,
            )}
            description="Configured suppliers"
          />

          <SummaryCard
            label="Active Products"
            value={String(
              activeProducts,
            )}
            description={`${priceBook.products.length} total price rows`}
          />

          <SummaryCard
            label="Effective Date"
            value={
              priceBook.effectiveDate ||
              'Not set'
            }
            description={
              priceBook.priceBookName
            }
          />
        </section>

        <section className="mt-6 rounded-3xl border border-[#E5E1D9] bg-white p-6 shadow-[0_8px_30px_rgba(34,34,34,0.03)] sm:p-7">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#B59A68]">
              Price database
            </p>

            <h3 className="mt-2 text-2xl font-light text-[#333333]">
              Product Prices
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7A7A7A]">
              Each row represents a
              manufacturer, supplier,
              product and configuration.
              Change the cost here and
              save the database.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr_auto]">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search product, configuration, manufacturer or supplier..."
              className="h-12 rounded-xl border border-[#DDD8CE] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition placeholder:text-[#AAAAAA] focus:border-[#B59A68] focus:bg-white"
            />

            <select
              value={
                manufacturerFilter
              }
              onChange={(event) =>
                setManufacturerFilter(
                  event.target.value,
                )
              }
              className="h-12 rounded-xl border border-[#DDD8CE] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
            >
              <option value="All">
                All manufacturers
              </option>

              {manufacturers.map(
                (manufacturer) => (
                  <option
                    key={manufacturer}
                    value={
                      manufacturer
                    }
                  >
                    {manufacturer}
                  </option>
                ),
              )}
            </select>

            <select
              value={supplierFilter}
              onChange={(event) =>
                setSupplierFilter(
                  event.target.value,
                )
              }
              className="h-12 rounded-xl border border-[#DDD8CE] bg-[#FAF9F6] px-4 text-sm text-[#444444] outline-none transition focus:border-[#B59A68] focus:bg-white"
            >
              <option value="All">
                All suppliers
              </option>

              {suppliers.map(
                (supplier) => (
                  <option
                    key={supplier}
                    value={supplier}
                  >
                    {supplier}
                  </option>
                ),
              )}
            </select>

            <button
              type="button"
              onClick={addProduct}
              className="h-12 rounded-xl bg-[#222222] px-5 text-sm font-medium text-white transition hover:bg-[#B59A68]"
            >
              + Add Product Price
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[1700px]">
              <thead>
                <tr className="border-b border-[#E9E5DD]">
                  <TableHeading>
                    #
                  </TableHeading>

                  <TableHeading>
                    Manufacturer
                  </TableHeading>

                  <TableHeading>
                    Supplier
                  </TableHeading>

                  <TableHeading>
                    Product
                  </TableHeading>

                  <TableHeading>
                    Configuration
                  </TableHeading>

                  <TableHeading>
                    Material
                  </TableHeading>

                  <TableHeading>
                    Category
                  </TableHeading>

                  <TableHeading>
                    Pricing Type
                  </TableHeading>

                  <TableHeading align="right">
                    Cost
                  </TableHeading>

                  <TableHeading align="right">
                    Small Opening
                  </TableHeading>

                  <TableHeading align="right">
                    Under
                  </TableHeading>

                  <TableHeading align="center">
                    Active
                  </TableHeading>

                  <TableHeading align="right">
                    Action
                  </TableHeading>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(
                  (product, index) => (
                    <tr
                      key={product.id}
                      className="border-b border-[#F0EDE7] last:border-b-0"
                    >
                      <TableCell>
                        <span className="text-sm font-medium text-[#888888]">
                          {index + 1}
                        </span>
                      </TableCell>

                      <TableCell>
                        <TableInput
                          value={product.manufacturer}
                          onChange={(value) =>
                            updateProduct(
                              product.id,
                              {
                                manufacturer: value,
                              },
                            )
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <TableInput
                          value={product.supplier}
                          onChange={(value) =>
                            updateProduct(
                              product.id,
                              {
                                supplier: value,
                              },
                            )
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <TableSelect
                          value={product.name}
                          options={
                            product.category === 'Window'
                              ? [...windowProductOptions]
                              : [...doorProductOptions]
                          }
                          onChange={(value) =>
                            updateProduct(
                              product.id,
                              {
                                name: value,
                                configuration:
                                  productConfigurationOptions[
                                  value
                                  ]?.[0] ?? 'Standard',
                              },
                            )
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <TableSelect
                          value={product.configuration}
                          options={[
                            ...(productConfigurationOptions[
                              product.name
                            ] ?? ['Standard']),
                          ]}
                          onChange={(value) =>
                            updateProduct(
                              product.id,
                              {
                                configuration: value,
                              },
                            )
                          }
                        />
                      </TableCell>
                       <TableCell>
                        <TableSelect
                          value={product.material ?? 'Vinyl'}
                          options={[
                            'Vinyl',
                            'Metal',
                          ]}
                          onChange={(value) =>
                            updateProduct(
                              product.id,
                              {
                                material: value,
                              },
                            )
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <TableSelect
                          value={product.category}
                          options={[
                            'Window',
                            'Door',
                          ]}
                          onChange={(value) => {
                            const nextCategory =
                              value as ProductCategory

                            const nextProduct =
                              nextCategory === 'Window'
                                ? windowProductOptions[0]
                                : doorProductOptions[0]

                            updateProduct(
                              product.id,
                              {
                                category: nextCategory,

                                name: nextProduct,

                                configuration:
                                  productConfigurationOptions[
                                  nextProduct
                                  ]?.[0] ?? 'Standard',

                                smallOpeningRate:
                                  nextCategory === 'Door'
                                    ? 0
                                    : product.smallOpeningRate,

                                smallOpeningThreshold:
                                  nextCategory === 'Door'
                                    ? 0
                                    : product.smallOpeningThreshold ||
                                    10,
                              },
                            )
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <TableSelect
                          value={
                            product.pricingUnit
                          }
                          options={
                            pricingUnits
                          }
                          onChange={(
                            value,
                          ) =>
                            updateProduct(
                              product.id,
                              {
                                pricingUnit:
                                  value as PricingUnit,
                              },
                            )
                          }
                        />
                      </TableCell>

                      <TableCell align="right">
                        <CurrencyInput
                          value={
                            product.standardRate
                          }
                          onChange={(
                            value,
                          ) =>
                            updateProduct(
                              product.id,
                              {
                                standardRate:
                                  value,
                              },
                            )
                          }
                        />
                      </TableCell>

                      <TableCell align="right">
                        <CurrencyInput
                          value={
                            product.smallOpeningRate
                          }
                          disabled={
                            product.category ===
                            'Door'
                          }
                          onChange={(
                            value,
                          ) =>
                            updateProduct(
                              product.id,
                              {
                                smallOpeningRate:
                                  value,
                              },
                            )
                          }
                        />
                      </TableCell>

                      <TableCell align="right">
                        <NumberInput
                          value={
                            product.smallOpeningThreshold
                          }
                          suffix="sq.ft."
                          disabled={
                            product.category ===
                            'Door'
                          }
                          onChange={(
                            value,
                          ) =>
                            updateProduct(
                              product.id,
                              {
                                smallOpeningThreshold:
                                  value,
                              },
                            )
                          }
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Toggle
                          checked={
                            product.active
                          }
                          onChange={(
                            checked,
                          ) =>
                            updateProduct(
                              product.id,
                              {
                                active:
                                  checked,
                              },
                            )
                          }
                        />
                      </TableCell>

                      <TableCell align="right">
                        <DeleteButton
                          onClick={() =>
                            removeProduct(
                              product.id,
                            )
                          }
                        />
                      </TableCell>
                    </tr>
                  ),
                )}

                {filteredProducts.length ===
                  0 && (
                    <tr>
                      <td
                        colSpan={12}
                        className="py-12 text-center text-sm text-[#999999]"
                      >
                        No products match
                        the current filters.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </section>

        <EditableSection
          title="Options & Add-ons"
          eyebrow="Additional costs"
          description="Supplier costs for impact glass, tempered glass, grids, colors and other upgrades."
          buttonLabel="Add option"
          onAdd={addAdditionalCost}
        >
          <SimpleCostTable
            items={
              priceBook.additionalCosts
            }
            onUpdate={
              updateAdditionalCost
            }
            onRemove={
              removeAdditionalCost
            }
          />
        </EditableSection>

        <EditableSection
          title="Labor & Project Costs"
          eyebrow="Installation costs"
          description="Installation, materials, permits, engineering and other project expenses."
          buttonLabel="Add project cost"
          onAdd={addLaborCost}
        >
          <LaborCostTable
            items={
              priceBook.laborCosts
            }
            onUpdate={
              updateLaborCost
            }
            onRemove={
              removeLaborCost
            }
          />
        </EditableSection>

        <section className="mt-6 rounded-3xl border border-[#E5E1D9] bg-white p-6 shadow-[0_8px_30px_rgba(34,34,34,0.03)] sm:p-7">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#B59A68]">
              Pricing Rules
            </p>

            <h3 className="mt-2 text-2xl font-light text-[#333333]">
              Business Rules
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7A7A7A]">
              Control markup,
              profitability and maximum
              discounts without changing
              product costs.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-7">
            <RuleField
              label="Default Markup"
              value={
                priceBook
                  .businessRules
                  .defaultMarkup
              }
              suffix="%"
              onChange={(value) =>
                updateBusinessRule(
                  'defaultMarkup',
                  value,
                )
              }
            />

            <RuleField
              label="New Construction Markup"
              value={
                priceBook
                  .businessRules
                  .newConstructionMarkup
              }
              suffix="%"
              onChange={(value) =>
                updateBusinessRule(
                  'newConstructionMarkup',
                  value,
                )
              }
            />

            <RuleField
              label="Commercial Markup"
              value={
                priceBook
                  .businessRules
                  .commercialMarkup
              }
              suffix="%"
              onChange={(value) =>
                updateBusinessRule(
                  'commercialMarkup',
                  value,
                )
              }
            />

            <RuleField
              label="Minimum Gross Margin"
              value={
                priceBook
                  .businessRules
                  .minimumGrossMargin
              }
              suffix="%"
              onChange={(value) =>
                updateBusinessRule(
                  'minimumGrossMargin',
                  value,
                )
              }
            />

            <RuleField
              label="Minimum Project Profit"
              value={
                priceBook
                  .businessRules
                  .minimumProjectProfit
              }
              prefix="$"
              onChange={(value) =>
                updateBusinessRule(
                  'minimumProjectProfit',
                  value,
                )
              }
            />

            <RuleField
              label="Maximum Sales Discount"
              value={
                priceBook
                  .businessRules
                  .maximumSalesDiscount
              }
              suffix="%"
              onChange={(value) =>
                updateBusinessRule(
                  'maximumSalesDiscount',
                  value,
                )
              }
            />

            <RuleField
              label="Sales Tax"
              value={
                priceBook
                  .businessRules
                  .salesTax
              }
              suffix="%"
              onChange={(value) =>
                updateBusinessRule(
                  'salesTax',
                  value,
                )
              }
            />
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[#E5E1D9] bg-white p-6 sm:p-7">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Field
              label="Default Manufacturer"
              value={
                priceBook.manufacturer
              }
              onChange={(value) =>
                updatePriceBookField(
                  'manufacturer',
                  value,
                )
              }
            />

            <Field
              label="Default Supplier"
              value={
                priceBook.distributor
              }
              onChange={(value) =>
                updatePriceBookField(
                  'distributor',
                  value,
                )
              }
            />

            <Field
              label="Database Name"
              value={
                priceBook.priceBookName
              }
              onChange={(value) =>
                updatePriceBookField(
                  'priceBookName',
                  value,
                )
              }
            />

            <Field
              label="Effective Date"
              type="date"
              value={
                priceBook.effectiveDate
              }
              onChange={(value) =>
                updatePriceBookField(
                  'effectiveDate',
                  value,
                )
              }
            />
          </div>
        </section>

        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#E5E1D9] bg-white p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-[#444444]">
              Reset Price Database
            </p>

            <p className="mt-1 text-sm text-[#888888]">
              Restore the original Ply
              Gem / GL pricing structure.
            </p>
          </div>

          <button
            type="button"
            onClick={resetPricing}
            className="rounded-xl border border-[#D8C2C2] px-4 py-2.5 text-sm font-medium text-[#9A5555] transition hover:border-[#9A5555] hover:bg-[#FFF7F7]"
          >
            Reset pricing
          </button>
        </div>
      </div>
    </div>
  )
}

type FieldProps = {
  label: string
  value: string
  type?: 'text' | 'date'
  onChange: (value: string) => void
}

function Field({
  label,
  value,
  type = 'text',
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#888888]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-xl border border-[#DDD8CE] bg-white px-4 py-3 text-sm text-[#333333] outline-none transition focus:border-[#B59A68] focus:ring-2 focus:ring-[#B59A68]/10"
      />
    </label>
  )
}

type SummaryCardProps = {
  label: string
  value: string
  description: string
}

function SummaryCard({
  label,
  value,
  description,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-[#E5E1D9] bg-white p-5 shadow-[0_8px_30px_rgba(34,34,34,0.03)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#999999]">
        {label}
      </p>

      <p className="mt-4 truncate text-2xl font-light text-[#333333]">
        {value}
      </p>

      <p className="mt-2 text-sm text-[#8A8A8A]">
        {description}
      </p>
    </div>
  )
}

type EditableSectionProps = {
  title: string
  eyebrow: string
  description: string
  buttonLabel: string
  onAdd: () => void
  children: React.ReactNode
}

function EditableSection({
  title,
  eyebrow,
  description,
  buttonLabel,
  onAdd,
  children,
}: EditableSectionProps) {
  return (
    <section className="mt-6 rounded-3xl border border-[#E5E1D9] bg-white p-6 shadow-[0_8px_30px_rgba(34,34,34,0.03)] sm:p-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#B59A68]">
            {eyebrow}
          </p>

          <h3 className="mt-2 text-2xl font-light text-[#333333]">
            {title}
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7A7A7A]">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 rounded-xl border border-[#DCD8CF] bg-white px-4 py-2.5 text-sm font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#B59A68]"
        >
          + {buttonLabel}
        </button>
      </div>

      <div className="mt-6">
        {children}
      </div>
    </section>
  )
}

type TableHeadingProps = {
  children: React.ReactNode
  align?:
  | 'left'
  | 'center'
  | 'right'
}

function TableHeading({
  children,
  align = 'left',
}: TableHeadingProps) {
  return (
    <th
      className={`
        px-3 py-3 text-[10px]
        font-medium uppercase
        tracking-[0.14em]
        text-[#999999]
        ${align === 'center'
          ? 'text-center'
          : align === 'right'
            ? 'text-right'
            : 'text-left'
        }
      `}
    >
      {children}
    </th>
  )
}

type TableCellProps = {
  children: React.ReactNode
  align?:
  | 'left'
  | 'center'
  | 'right'
}

function TableCell({
  children,
  align = 'left',
}: TableCellProps) {
  return (
    <td
      className={`
        px-3 py-3 align-middle
        ${align === 'center'
          ? 'text-center'
          : align === 'right'
            ? 'text-right'
            : 'text-left'
        }
      `}
    >
      {children}
    </td>
  )
}

type TableInputProps = {
  value: string
  onChange: (value: string) => void
}

function TableInput({
  value,
  onChange,
}: TableInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="w-full min-w-[150px] rounded-lg border border-[#E1DDD5] bg-white px-3 py-2.5 text-sm text-[#444444] outline-none transition focus:border-[#B59A68]"
    />
  )
}

type TableSelectProps = {
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}

function TableSelect({
  value,
  options,
  onChange,
}: TableSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="w-full min-w-[135px] rounded-lg border border-[#E1DDD5] bg-white px-3 py-2.5 text-sm text-[#444444] outline-none transition focus:border-[#B59A68]"
    >
      {options.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
  )
}

type CurrencyInputProps = {
  value: number
  disabled?: boolean
  onChange: (value: number) => void
}

function CurrencyInput({
  value,
  disabled = false,
  onChange,
}: CurrencyInputProps) {
  return (
    <div
      className={`
        ml-auto flex w-[125px]
        items-center rounded-lg
        border border-[#E1DDD5]
        bg-white
        ${disabled
          ? 'opacity-40'
          : ''
        }
      `}
    >
      <span className="pl-3 text-sm text-[#999999]">
        $
      </span>

      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            parseNumber(
              event.target.value,
            ),
          )
        }
        className="w-full rounded-lg bg-transparent px-2 py-2.5 text-right text-sm text-[#444444] outline-none disabled:cursor-not-allowed"
      />
    </div>
  )
}

type NumberInputProps = {
  value: number
  suffix?: string
  disabled?: boolean
  onChange: (value: number) => void
}

function NumberInput({
  value,
  suffix,
  disabled = false,
  onChange,
}: NumberInputProps) {
  return (
    <div
      className={`
        ml-auto flex w-[140px]
        items-center rounded-lg
        border border-[#E1DDD5]
        bg-white
        ${disabled
          ? 'opacity-40'
          : ''
        }
      `}
    >
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            parseNumber(
              event.target.value,
            ),
          )
        }
        className="min-w-0 flex-1 rounded-lg bg-transparent px-3 py-2.5 text-right text-sm text-[#444444] outline-none disabled:cursor-not-allowed"
      />

      {suffix && (
        <span className="pr-3 text-[10px] text-[#999999]">
          {suffix}
        </span>
      )}
    </div>
  )
}

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
}

function Toggle({
  checked,
  onChange,
}: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      aria-pressed={checked}
      className={`
        relative inline-flex
        h-7 w-12 rounded-full
        transition
        ${checked
          ? 'bg-[#222222]'
          : 'bg-[#D7D4CE]'
        }
      `}
    >
      <span
        className={`
          absolute top-1 h-5 w-5
          rounded-full bg-white
          shadow transition
          ${checked
            ? 'left-6'
            : 'left-1'
          }
        `}
      />
    </button>
  )
}

type DeleteButtonProps = {
  onClick: () => void
}

function DeleteButton({
  onClick,
}: DeleteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-xs font-medium text-[#A66666] transition hover:bg-[#FFF2F2] hover:text-[#884444]"
    >
      Remove
    </button>
  )
}

type CostItem = {
  id: string
  name: string
  pricingUnit: PricingUnit
  cost: number
  active: boolean
}

type SimpleCostTableProps<
  T extends CostItem,
> = {
  items: T[]
  onUpdate: (
    id: string,
    changes: Partial<T>,
  ) => void
  onRemove: (id: string) => void
}

function SimpleCostTable<
  T extends CostItem,
>({
  items,
  onUpdate,
  onRemove,
}: SimpleCostTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px]">
        <thead>
          <tr className="border-b border-[#E9E5DD]">
            <TableHeading>
              Item
            </TableHeading>

            <TableHeading>
              Calculation
            </TableHeading>

            <TableHeading align="right">
              Cost
            </TableHeading>

            <TableHeading align="center">
              Active
            </TableHeading>

            <TableHeading align="right">
              Action
            </TableHeading>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[#F0EDE7] last:border-b-0"
            >
              <TableCell>
                <TableInput
                  value={item.name}
                  onChange={(value) =>
                    onUpdate(
                      item.id,
                      {
                        name: value,
                      } as Partial<T>,
                    )
                  }
                />
              </TableCell>

              <TableCell>
                <TableSelect
                  value={
                    item.pricingUnit
                  }
                  options={
                    pricingUnits
                  }
                  onChange={(value) =>
                    onUpdate(
                      item.id,
                      {
                        pricingUnit:
                          value as PricingUnit,
                      } as Partial<T>,
                    )
                  }
                />
              </TableCell>

              <TableCell align="right">
                <CurrencyInput
                  value={item.cost}
                  onChange={(value) =>
                    onUpdate(
                      item.id,
                      {
                        cost: value,
                      } as Partial<T>,
                    )
                  }
                />
              </TableCell>

              <TableCell align="center">
                <Toggle
                  checked={item.active}
                  onChange={(checked) =>
                    onUpdate(
                      item.id,
                      {
                        active:
                          checked,
                      } as Partial<T>,
                    )
                  }
                />
              </TableCell>

              <TableCell align="right">
                <DeleteButton
                  onClick={() =>
                    onRemove(item.id)
                  }
                />
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


type LaborCostTableProps = {
  items: LaborCost[]
  onUpdate: (
    id: string,
    changes: Partial<LaborCost>,
  ) => void
  onRemove: (id: string) => void
}

function LaborCostTable({
  items,
  onUpdate,
  onRemove,
}: LaborCostTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px]">
        <thead>
          <tr className="border-b border-[#E9E5DD]">
            <TableHeading>
              Item
            </TableHeading>

            <TableHeading>
              Calculation
            </TableHeading>

            <TableHeading align="right">
              Replacement
            </TableHeading>

            <TableHeading align="right">
              New Construction
            </TableHeading>

            <TableHeading align="right">
              Commercial
            </TableHeading>

            <TableHeading align="center">
              Active
            </TableHeading>

            <TableHeading align="right">
              Action
            </TableHeading>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[#F0EDE7] last:border-b-0"
            >
              <TableCell>
                <TableInput
                  value={item.name}
                  onChange={(value) =>
                    onUpdate(
                      item.id,
                      {
                        name: value,
                      },
                    )
                  }
                />
              </TableCell>

              <TableCell>
                <TableSelect
                  value={item.pricingUnit}
                  options={pricingUnits}
                  onChange={(value) =>
                    onUpdate(
                      item.id,
                      {
                        pricingUnit:
                          value as PricingUnit,
                      },
                    )
                  }
                />
              </TableCell>

              <TableCell align="right">
                <CurrencyInput
                  value={item.cost}
                  onChange={(value) =>
                    onUpdate(
                      item.id,
                      {
                        cost: value,
                      },
                    )
                  }
                />
              </TableCell>

              <TableCell align="right">
                <CurrencyInput
                  value={
                    item.newConstructionCost
                  }
                  onChange={(value) =>
                    onUpdate(
                      item.id,
                      {
                        newConstructionCost:
                          value,
                      },
                    )
                  }
                />
              </TableCell>

              <TableCell align="right">
                <CurrencyInput
                  value={
                    item.commercialCost
                  }
                  onChange={(value) =>
                    onUpdate(
                      item.id,
                      {
                        commercialCost:
                          value,
                      },
                    )
                  }
                />
              </TableCell>

              <TableCell align="center">
                <Toggle
                  checked={item.active}
                  onChange={(checked) =>
                    onUpdate(
                      item.id,
                      {
                        active: checked,
                      },
                    )
                  }
                />
              </TableCell>

              <TableCell align="right">
                <DeleteButton
                  onClick={() =>
                    onRemove(item.id)
                  }
                />
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type RuleFieldProps = {
  label: string
  value: number
  prefix?: string
  suffix?: string
  onChange: (value: number) => void
}

function RuleField({
  label,
  value,
  prefix,
  suffix,
  onChange,
}: RuleFieldProps) {
  return (
    <label className="block">
      <span className="block min-h-[32px] text-[11px] font-medium uppercase leading-4 tracking-[0.14em] text-[#888888]">
        {label}
      </span>

      <div className="mt-2 flex items-center rounded-xl border border-[#DDD8CE] bg-white">
        {prefix && (
          <span className="pl-4 text-sm text-[#999999]">
            {prefix}
          </span>
        )}

        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) =>
            onChange(
              parseNumber(
                event.target.value,
              ),
            )
          }
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-[#333333] outline-none"
        />

        {suffix && (
          <span className="pr-4 text-sm text-[#999999]">
            {suffix}
          </span>
        )}
      </div>

      {label ===
        'Default Markup' && (
          <p className="mt-2 text-xs text-[#999999]">
            {formatCurrency(100)} cost
            becomes{' '}
            {formatCurrency(
              100 *
              (1 + value / 100),
            )}
          </p>
        )}
    </label>
  )
}

