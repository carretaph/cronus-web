import {
  useEffect,
  useMemo,
  useState,
} from 'react'

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
  name: string
  category: ProductCategory
  pricingUnit: PricingUnit
  standardRate: number
  smallOpeningRate: number
  smallOpeningThreshold: number
  active: boolean
}

type AdditionalCost = {
  id: string
  name: string
  pricingUnit: PricingUnit
  cost: number
  active: boolean
}

type LaborCost = {
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

const STORAGE_KEY = 'cronus_pricing_engine_v1'

const defaultPriceBook: PriceBook = {
  manufacturer: 'Ply Gem',
  distributor: 'GL',
  priceBookName: 'GL Current Price Book',
  effectiveDate: new Date().toISOString().slice(0, 10),
  products: [
    {
      id: 'single-hung',
      name: 'Single Hung',
      category: 'Window',
      pricingUnit: 'Per sq. ft.',
      standardRate: 106,
      smallOpeningRate: 135,
      smallOpeningThreshold: 10,
      active: true,
    },
    {
      id: 'sliding window',
      name: 'Sliding Window',
      category: 'Window',
      pricingUnit: 'Per sq. ft.',
      standardRate: 106,
      smallOpeningRate: 135,
      smallOpeningThreshold: 10,
      active: true,
    },
    {
      id: 'picture-window',
      name: 'Picture Window',
      category: 'Window',
      pricingUnit: 'Per sq. ft.',
      standardRate: 106,
      smallOpeningRate: 135,
      smallOpeningThreshold: 10,
      active: true,
    },
    {
      id: 'casement',
      name: 'Casement',
      category: 'Window',
      pricingUnit: 'Per sq. ft.',
      standardRate: 106,
      smallOpeningRate: 135,
      smallOpeningThreshold: 10,
      active: true,
    },
    {
      id: 'sliding-glass-door',
      name: 'Sliding Glass Door',
      category: 'Door',
      pricingUnit: 'Per sq. ft.',
      standardRate: 51,
      smallOpeningRate: 0,
      smallOpeningThreshold: 0,
      active: true,
    },
    {
      id: 'entry-door',
      name: 'Entry Door',
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
      pricingUnit: 'Per sq. ft.',
      cost: 0,
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
      id: 'screens',
      name: 'Screens',
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
      active: true,
    },
    {
      id: 'door-installation',
      name: 'Door Installation',
      pricingUnit: 'Per opening',
      cost: 0,
      active: true,
    },
    {
      id: 'installation-materials',
      name: 'Installation Materials',
      pricingUnit: 'Per opening',
      cost: 0,
      active: true,
    },
    {
      id: 'permit',
      name: 'Permit',
      pricingUnit: 'Fixed',
      cost: 0,
      active: true,
    },
    {
      id: 'engineering',
      name: 'Engineering',
      pricingUnit: 'Fixed',
      cost: 0,
      active: true,
    },
    {
      id: 'dumpster',
      name: 'Dumpster',
      pricingUnit: 'Fixed',
      cost: 0,
      active: true,
    },
    {
      id: 'travel',
      name: 'Travel',
      pricingUnit: 'Fixed',
      cost: 0,
      active: true,
    },
  ],
  businessRules: {
    defaultMarkup: 100,
    minimumGrossMargin: 35,
    minimumProjectProfit: 3000,
    maximumSalesDiscount: 10,
    salesTax: 0,
  },
}

const pricingUnits: PricingUnit[] = [
  'Per sq. ft.',
  'Per opening',
  'Fixed',
  'Percentage',
  'Per linear ft.',
  'Per mile',
]

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

function loadStoredPriceBook(): PriceBook {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY)

    if (!storedValue) {
      return defaultPriceBook
    }

    const parsedValue = JSON.parse(
      storedValue,
    ) as Partial<PriceBook>

    return {
      ...defaultPriceBook,
      ...parsedValue,
      products:
        parsedValue.products ??
        defaultPriceBook.products,
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
    useState<PriceBook>(loadStoredPriceBook)

  const [savedPriceBook, setSavedPriceBook] =
    useState<PriceBook>(loadStoredPriceBook)

  const [saveMessage, setSaveMessage] =
    useState('')

  const hasUnsavedChanges = useMemo(
    () =>
      JSON.stringify(priceBook) !==
      JSON.stringify(savedPriceBook),
    [priceBook, savedPriceBook],
  )

  const activeProducts = priceBook.products.filter(
    (product) => product.active,
  ).length

  const configuredAdditionalCosts =
    priceBook.additionalCosts.filter(
      (item) => item.active && item.cost > 0,
    ).length

  const configuredLaborCosts =
    priceBook.laborCosts.filter(
      (item) => item.active && item.cost > 0,
    ).length

  useEffect(() => {
    if (!saveMessage) {
      return
    }

    const timeout = window.setTimeout(() => {
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
      products: current.products.map(
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
          name: 'New Product',
          category: 'Window',
          pricingUnit: 'Per sq. ft.',
          standardRate: 0,
          smallOpeningRate: 0,
          smallOpeningThreshold: 10,
          active: true,
        },
      ],
    }))
  }

  function removeProduct(id: string) {
    setPriceBook((current) => ({
      ...current,
      products: current.products.filter(
        (product) => product.id !== id,
      ),
    }))
  }

  function updateAdditionalCost(
    id: string,
    changes: Partial<AdditionalCost>,
  ) {
    setPriceBook((current) => ({
      ...current,
      additionalCosts:
        current.additionalCosts.map((item) =>
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
          pricingUnit: 'Per opening',
          cost: 0,
          active: true,
        },
      ],
    }))
  }

  function removeAdditionalCost(id: string) {
    setPriceBook((current) => ({
      ...current,
      additionalCosts:
        current.additionalCosts.filter(
          (item) => item.id !== id,
        ),
    }))
  }

  function updateLaborCost(
    id: string,
    changes: Partial<LaborCost>,
  ) {
    setPriceBook((current) => ({
      ...current,
      laborCosts: current.laborCosts.map(
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
          active: true,
        },
      ],
    }))
  }

  function removeLaborCost(id: string) {
    setPriceBook((current) => ({
      ...current,
      laborCosts:
        current.laborCosts.filter(
          (item) => item.id !== id,
        ),
    }))
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

  function savePricing() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(priceBook),
    )

    setSavedPriceBook(priceBook)
    setSaveMessage(
      'Pricing information saved successfully.',
    )
  }

  function discardChanges() {
    setPriceBook(savedPriceBook)
    setSaveMessage('Unsaved changes discarded.')
  }

  function resetPricing() {
    const confirmed = window.confirm(
      'Reset all pricing information to the original Ply Gem / GL values?',
    )

    if (!confirmed) {
      return
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultPriceBook),
    )

    setPriceBook(defaultPriceBook)
    setSavedPriceBook(defaultPriceBook)
    setSaveMessage(
      'Pricing information reset successfully.',
    )
  }

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#F7F6F2]">
      <section className="border-b border-[#E8E5DE] bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#B59A68]">
                Pricing Administration
              </p>

              <h2 className="mt-3 text-3xl font-light tracking-[-0.03em] text-[#2E2E2E] sm:text-4xl">
                Pricing Engine
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#777777] sm:text-base">
                Enter the supplier costs used by Cronus
                to calculate quotes from product dimensions,
                selected options, labor and pricing rules.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {hasUnsavedChanges && (
                <button
                  type="button"
                  onClick={discardChanges}
                  className="rounded-xl border border-[#DCD8CF] bg-white px-5 py-3 text-sm font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#B59A68]"
                >
                  Discard changes
                </button>
              )}

              <button
                type="button"
                onClick={savePricing}
                disabled={!hasUnsavedChanges}
                className="rounded-xl bg-[#222222] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#B59A68] disabled:cursor-not-allowed disabled:bg-[#BDBDBD]"
              >
                Save pricing
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

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-7 lg:px-10 lg:py-10">
        <section className="rounded-3xl border border-[#E5E1D9] bg-white p-6 shadow-[0_8px_30px_rgba(34,34,34,0.03)] sm:p-7">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#B59A68]">
              Active price book
            </p>

            <h3 className="mt-2 text-2xl font-light text-[#333333]">
              Supplier information
            </h3>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Field
              label="Manufacturer"
              value={priceBook.manufacturer}
              onChange={(value) =>
                updatePriceBookField(
                  'manufacturer',
                  value,
                )
              }
            />

            <Field
              label="Distributor"
              value={priceBook.distributor}
              onChange={(value) =>
                updatePriceBookField(
                  'distributor',
                  value,
                )
              }
            />

            <Field
              label="Price Book Name"
              value={priceBook.priceBookName}
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
              value={priceBook.effectiveDate}
              onChange={(value) =>
                updatePriceBookField(
                  'effectiveDate',
                  value,
                )
              }
            />
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Manufacturer"
            value={priceBook.manufacturer || 'Not set'}
            description={`Distributor: ${
              priceBook.distributor || 'Not set'
            }`}
          />

          <SummaryCard
            label="Active Products"
            value={String(activeProducts)}
            description={`${priceBook.products.length} total products`}
          />

          <SummaryCard
            label="Configured Options"
            value={String(
              configuredAdditionalCosts,
            )}
            description="Options with a cost"
          />

          <SummaryCard
            label="Configured Labor"
            value={String(configuredLaborCosts)}
            description="Labor items with a cost"
          />
        </section>

        <EditableSection
          title="Products"
          eyebrow="Product costs"
          description="Enter the purchase cost charged by GL for each Ply Gem product."
          buttonLabel="Add product"
          onAdd={addProduct}
        >
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full">
              <thead>
                <tr className="border-b border-[#E9E5DD] text-left">
                  <TableHeading>
                    Product
                  </TableHeading>

                  <TableHeading>
                    Category
                  </TableHeading>

                  <TableHeading>
                    Pricing Type
                  </TableHeading>

                  <TableHeading align="right">
                    Standard Rate
                  </TableHeading>

                  <TableHeading align="right">
                    Small Opening Rate
                  </TableHeading>

                  <TableHeading align="right">
                    Small Under
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
                {priceBook.products.map(
                  (product) => (
                    <tr
                      key={product.id}
                      className="border-b border-[#F0EDE7] last:border-b-0"
                    >
                      <TableCell>
                        <TableInput
                          value={product.name}
                          onChange={(value) =>
                            updateProduct(
                              product.id,
                              {
                                name: value,
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
                          onChange={(value) =>
                            updateProduct(
                              product.id,
                              {
                                category:
                                  value as ProductCategory,
                                smallOpeningRate:
                                  value === 'Door'
                                    ? 0
                                    : product.smallOpeningRate,
                                smallOpeningThreshold:
                                  value === 'Door'
                                    ? 0
                                    : product.smallOpeningThreshold ||
                                      10,
                              },
                            )
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <TableSelect
                          value={
                            product.pricingUnit
                          }
                          options={pricingUnits}
                          onChange={(value) =>
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

                      <TableCell>
                        <CurrencyInput
                          value={
                            product.standardRate
                          }
                          onChange={(value) =>
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

                      <TableCell>
                        <CurrencyInput
                          value={
                            product.smallOpeningRate
                          }
                          disabled={
                            product.category ===
                            'Door'
                          }
                          onChange={(value) =>
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

                      <TableCell>
                        <NumberInput
                          value={
                            product.smallOpeningThreshold
                          }
                          suffix="sq. ft."
                          disabled={
                            product.category ===
                            'Door'
                          }
                          onChange={(value) =>
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
                          checked={product.active}
                          onChange={(checked) =>
                            updateProduct(
                              product.id,
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
                            removeProduct(
                              product.id,
                            )
                          }
                        />
                      </TableCell>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </EditableSection>

        <EditableSection
          title="Options & Add-ons"
          eyebrow="Additional costs"
          description="Enter costs for glass upgrades, grids, screens, colors and other product options."
          buttonLabel="Add option"
          onAdd={addAdditionalCost}
        >
          <SimpleCostTable
            items={priceBook.additionalCosts}
            onUpdate={updateAdditionalCost}
            onRemove={removeAdditionalCost}
          />
        </EditableSection>

        <EditableSection
          title="Labor & Project Costs"
          eyebrow="Installation costs"
          description="Enter installation, materials, permits, engineering and other project expenses."
          buttonLabel="Add project cost"
          onAdd={addLaborCost}
        >
          <SimpleCostTable
            items={priceBook.laborCosts}
            onUpdate={updateLaborCost}
            onRemove={removeLaborCost}
          />
        </EditableSection>

        <section className="mt-6 rounded-3xl border border-[#E5E1D9] bg-white p-6 shadow-[0_8px_30px_rgba(34,34,34,0.03)] sm:p-7">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#B59A68]">
              Pricing rules
            </p>

            <h3 className="mt-2 text-2xl font-light text-[#333333]">
              Business Rules
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7A7A7A]">
              These values will control the suggested
              selling price, margin requirements and
              discount limits.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            <RuleField
              label="Default Markup"
              value={
                priceBook.businessRules
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
              label="Minimum Gross Margin"
              value={
                priceBook.businessRules
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
                priceBook.businessRules
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
                priceBook.businessRules
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
                priceBook.businessRules
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

        <section className="mt-6 rounded-3xl bg-[#222222] p-6 text-white sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#B59A68]">
                Quote calculation
              </p>

              <h3 className="mt-4 text-2xl font-light tracking-[-0.02em] sm:text-3xl">
                Cronus will use these values for
                every new quote.
              </h3>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
                Product dimensions determine the square
                footage. Cronus will select the applicable
                Ply Gem product rate from GL, add options,
                labor and project costs, and then apply
                the configured pricing rules.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <CalculationLine
                number="01"
                label="Width × height ÷ 144"
              />

              <CalculationLine
                number="02"
                label="Select standard or small-opening rate"
              />

              <CalculationLine
                number="03"
                label="Add options, labor and project costs"
              />

              <CalculationLine
                number="04"
                label="Apply markup, margin and discount rules"
                last
              />
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#E5E1D9] bg-white p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-[#444444]">
              Reset Pricing Engine
            </p>

            <p className="mt-1 text-sm text-[#888888]">
              Restore the original Ply Gem pricing
              provided by GL.
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
  align?: 'left' | 'center' | 'right'
}

function TableHeading({
  children,
  align = 'left',
}: TableHeadingProps) {
  return (
    <th
      className={`
        px-3 py-3 text-[10px] font-medium uppercase
        tracking-[0.14em] text-[#999999]
        ${
          align === 'center'
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
  align?: 'left' | 'center' | 'right'
}

function TableCell({
  children,
  align = 'left',
}: TableCellProps) {
  return (
    <td
      className={`
        px-3 py-3 align-middle
        ${
          align === 'center'
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
      className="w-full min-w-[180px] rounded-lg border border-[#E1DDD5] bg-white px-3 py-2.5 text-sm text-[#444444] outline-none transition focus:border-[#B59A68]"
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
      className="w-full min-w-[140px] rounded-lg border border-[#E1DDD5] bg-white px-3 py-2.5 text-sm text-[#444444] outline-none transition focus:border-[#B59A68]"
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
        ml-auto flex w-[130px] items-center rounded-lg
        border border-[#E1DDD5] bg-white
        ${disabled ? 'opacity-40' : ''}
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
            parseNumber(event.target.value),
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
        ml-auto flex w-[145px] items-center rounded-lg
        border border-[#E1DDD5] bg-white
        ${disabled ? 'opacity-40' : ''}
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
            parseNumber(event.target.value),
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
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`
        relative inline-flex h-7 w-12 rounded-full
        transition
        ${
          checked
            ? 'bg-[#222222]'
            : 'bg-[#D7D4CE]'
        }
      `}
    >
      <span
        className={`
          absolute top-1 h-5 w-5 rounded-full
          bg-white shadow transition
          ${
            checked
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

type SimpleCostTableProps<T extends CostItem> = {
  items: T[]
  onUpdate: (
    id: string,
    changes: Partial<T>,
  ) => void
  onRemove: (id: string) => void
}

function SimpleCostTable<T extends CostItem>({
  items,
  onUpdate,
  onRemove,
}: SimpleCostTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[760px] w-full">
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
                    onUpdate(item.id, {
                      name: value,
                    } as Partial<T>)
                  }
                />
              </TableCell>

              <TableCell>
                <TableSelect
                  value={item.pricingUnit}
                  options={pricingUnits}
                  onChange={(value) =>
                    onUpdate(item.id, {
                      pricingUnit:
                        value as PricingUnit,
                    } as Partial<T>)
                  }
                />
              </TableCell>

              <TableCell align="right">
                <CurrencyInput
                  value={item.cost}
                  onChange={(value) =>
                    onUpdate(item.id, {
                      cost: value,
                    } as Partial<T>)
                  }
                />
              </TableCell>

              <TableCell align="center">
                <Toggle
                  checked={item.active}
                  onChange={(checked) =>
                    onUpdate(item.id, {
                      active: checked,
                    } as Partial<T>)
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
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#888888]">
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
              parseNumber(event.target.value),
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

      {label === 'Default Markup' && (
        <p className="mt-2 text-xs text-[#999999]">
          Example: {formatCurrency(100)} cost
          becomes{' '}
          {formatCurrency(
            100 * (1 + value / 100),
          )}
        </p>
      )}
    </label>
  )
}

type CalculationLineProps = {
  number: string
  label: string
  last?: boolean
}

function CalculationLine({
  number,
  label,
  last = false,
}: CalculationLineProps) {
  return (
    <div
      className={`
        flex items-center gap-4 py-3
        ${
          last
            ? ''
            : 'border-b border-white/10'
        }
      `}
    >
      <span className="text-xs font-medium text-[#B59A68]">
        {number}
      </span>

      <span className="text-sm text-white/75">
        {label}
      </span>
    </div>
  )
}