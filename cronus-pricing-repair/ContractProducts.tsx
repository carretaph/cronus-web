import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateCoreProductPrice } from '../../services/pricingService'

const contractHandoffStorageKey =
  'cronus_contract_handoff_v1'

const contractDraftStorageKey =
  'cronus_contract_draft_v1'

type Product = {
  id: string
  label?: string
  productCategory?: string
  width?: string
  height?: string
  color?: string
  exteriorColor?: string
  interiorColor?: string
  glass?: string
  glassPackage?: string
  grid?: string
  grids?: string
  screen?: string
  screens?: string
  notes?: string
}

type Opening = {
  id?: string
  openingNumber: string
  location?: string
  impact?: boolean
  mullionCharge?: number
  notes?: string
  products: Product[]
}

type ContractHandoff = {
  estimateNumber?: string
  contractNumber?: string
  openings?: Opening[]
  retailPrice?: number
  discountTotal?: number
  projectTotal?: number
}

type ProductRow = {
  rowId: string
  openingNumber: string
  location: string
  product: Product
  impact: boolean
  mullionCharge: number
  openingNotes: string
  price: number
}

const doorCategories = new Set([
  'Sliding Door',
  'French Door',
  'Entry Door',
])

function parseMeasurement(value?: string) {
  if (!value) {
    return 0
  }

  const parsed = Number.parseFloat(
    value.replace(/[^0-9.]/g, ''),
  )

  return Number.isFinite(parsed) ? parsed : 0
}

ffunction calculateProductPrice(
  opening: Opening,
  product: Product,
) {
  const category = product.productCategory ?? ''
  const isDoor = doorCategories.has(category)

  return calculateCoreProductPrice({
    width: product.width,
    height: product.height,
    isDoor,
    impact: opening.impact,
  }).total
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function displayValue(
  ...values: Array<string | undefined>
) {
  return (
    values.find((value) => value?.trim()) ??
    'Not specified'
  )
}

export default function ContractProducts() {
  const navigate = useNavigate()

  const [handoff, setHandoff] =
    useState<ContractHandoff | null>(null)

  const [selectedRowId, setSelectedRowId] =
    useState<string>('')

  useEffect(() => {
    const storedHandoff = localStorage.getItem(
      contractHandoffStorageKey,
    )

    const storedDraft = localStorage.getItem(
      contractDraftStorageKey,
    )

    let parsedHandoff: ContractHandoff = {}

    if (storedHandoff) {
      try {
        parsedHandoff = JSON.parse(
          storedHandoff,
        ) as ContractHandoff
      } catch {
        localStorage.removeItem(
          contractHandoffStorageKey,
        )
      }
    }

    if (storedDraft) {
      try {
        const parsedDraft = JSON.parse(storedDraft)

        parsedHandoff = {
          ...parsedHandoff,
          contractNumber:
            parsedDraft.contractNumber ??
            parsedHandoff.contractNumber,
          estimateNumber:
            parsedDraft.estimateNumber ??
            parsedHandoff.estimateNumber,
          openings:
            parsedDraft.products?.openings ??
            parsedHandoff.openings,
          retailPrice:
            parsedDraft.products?.retailPrice ??
            parsedHandoff.retailPrice,
          discountTotal:
            parsedDraft.products?.discountTotal ??
            parsedHandoff.discountTotal,
          projectTotal:
            parsedDraft.products?.projectTotal ??
            parsedHandoff.projectTotal,
        }
      } catch {
        localStorage.removeItem(
          contractDraftStorageKey,
        )
      }
    }

    setHandoff(parsedHandoff)
  }, [])

  const productRows = useMemo<ProductRow[]>(() => {
    const openings = Array.isArray(handoff?.openings)
      ? handoff.openings
      : []

    return openings.flatMap((opening, openingIndex) => {
      const products = Array.isArray(opening.products)
        ? opening.products
        : []

      return products.map((product, productIndex) => ({
        rowId:
          product.id ||
          `${opening.openingNumber}-${openingIndex}-${productIndex}`,
        openingNumber:
          opening.openingNumber ||
          String(openingIndex + 1),
        location:
          opening.location?.trim() || 'Not specified',
        product,
        impact: Boolean(opening.impact),
        mullionCharge: opening.mullionCharge ?? 0,
        openingNotes: opening.notes ?? '',
        price: calculateProductPrice(opening, product),
      }))
    })
  }, [handoff])

  useEffect(() => {
    if (
      productRows.length > 0 &&
      !productRows.some(
        (row) => row.rowId === selectedRowId,
      )
    ) {
      setSelectedRowId(productRows[0].rowId)
    }
  }, [productRows, selectedRowId])

  const selectedRow =
    productRows.find(
      (row) => row.rowId === selectedRowId,
    ) ?? null

  const calculatedRetailPrice = useMemo(
    () =>
      productRows.reduce(
        (total, row) => total + row.price,
        0,
      ),
    [productRows],
  )

  const retailPrice =
    handoff?.retailPrice ?? calculatedRetailPrice

  const discountTotal = handoff?.discountTotal ?? 0

  const projectTotal =
    handoff?.projectTotal ??
    Math.max(0, retailPrice - discountTotal)

  const windowCount = productRows.filter(
    (row) =>
      !doorCategories.has(
        row.product.productCategory ?? '',
      ),
  ).length

  const doorCount = productRows.filter((row) =>
    doorCategories.has(
      row.product.productCategory ?? '',
    ),
  ).length

  function saveProductsDraft() {
    const existingDraft = localStorage.getItem(
      contractDraftStorageKey,
    )

    let parsedDraft = {}

    if (existingDraft) {
      try {
        parsedDraft = JSON.parse(existingDraft)
      } catch {
        parsedDraft = {}
      }
    }

    const updatedDraft = {
      ...parsedDraft,
      contractNumber: handoff?.contractNumber ?? '',
      estimateNumber: handoff?.estimateNumber ?? '',
      products: {
        openings: handoff?.openings ?? [],
        retailPrice,
        discountTotal,
        projectTotal,
        windowCount,
        doorCount,
        totalProducts: productRows.length,
      },
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(
      contractDraftStorageKey,
      JSON.stringify(updatedDraft),
    )
  }

  function handleBack() {
    saveProductsDraft()
    navigate('/portal/contracts/project')
  }

  function handleNext() {
    saveProductsDraft()
    navigate('/portal/contracts/payment')
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Contract Wizard
            </p>

            <h1 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              Products
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#777777]">
              Review the windows and doors transferred
              from the customer estimate.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E4DD] bg-white px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#999999]">
              Step 3 of 8
            </p>

            <p className="mt-1 text-sm font-medium text-[#555555]">
              Products
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Contract"
            value={
              handoff?.contractNumber ||
              'Not assigned'
            }
          />

          <SummaryCard
            label="Estimate"
            value={
              handoff?.estimateNumber ||
              'Not assigned'
            }
          />

          <SummaryCard
            label="Windows"
            value={String(windowCount)}
          />

          <SummaryCard
            label="Doors"
            value={String(doorCount)}
          />
        </div>

        <section className="overflow-hidden rounded-[28px] border border-[#E8E4DD] bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-[#EEEAE4] px-6 py-6 sm:px-8 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl font-medium text-[#555555]">
                Opening Schedule
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#888888]">
                Select a row to review the complete
                product details.
              </p>
            </div>

            <div className="rounded-xl bg-[#F7F3EB] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#9A8258]">
                {productRows.length}{' '}
                {productRows.length === 1
                  ? 'Product'
                  : 'Products'}
              </p>
            </div>
          </div>

          {productRows.length === 0 ? (
            <div className="px-6 py-20 text-center sm:px-8">
              <p className="text-lg font-medium text-[#555555]">
                No products were found
              </p>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#888888]">
                Return to the estimate, add the windows
                or doors, and use Order Now again.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F6] text-left">
                    <TableHeader>Opening</TableHeader>
                    <TableHeader>Location</TableHeader>
                    <TableHeader>Product</TableHeader>
                    <TableHeader>Size</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader align="right">
                      Price
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {productRows.map((row) => {
                    const isSelected =
                      row.rowId === selectedRowId

                    return (
                      <tr
                        key={row.rowId}
                        onClick={() =>
                          setSelectedRowId(row.rowId)
                        }
                        className={`cursor-pointer border-t border-[#EEEAE4] transition ${
                          isSelected
                            ? 'bg-[#F8F3E9]'
                            : 'bg-white hover:bg-[#FCFBF9]'
                        }`}
                      >
                        <TableCell>
                          <span className="font-medium text-[#555555]">
                            {row.openingNumber}
                          </span>
                        </TableCell>

                        <TableCell>
                          {row.location}
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium text-[#555555]">
                              {displayValue(
                                row.product.label,
                                row.product.productCategory,
                              )}
                            </p>

                            <p className="mt-1 text-xs text-[#999999]">
                              {row.product.productCategory ||
                                'Product'}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          {displayValue(
                            row.product.width,
                          )}{' '}
                          ×{' '}
                          {displayValue(
                            row.product.height,
                          )}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              row.impact
                                ? 'bg-[#EAF3EE] text-[#4D755E]'
                                : 'bg-[#F1F1EF] text-[#777777]'
                            }`}
                          >
                            {row.impact
                              ? 'Impact'
                              : 'Non-Impact'}
                          </span>
                        </TableCell>

                        <TableCell align="right">
                          <span className="font-medium text-[#444444]">
                            {formatCurrency(row.price)}
                          </span>
                        </TableCell>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="mt-7 grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] border border-[#E8E4DD] bg-white p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
                Selected Opening
              </p>

              <h2 className="mt-3 text-2xl font-light text-[#555555]">
                {selectedRow
                  ? `Opening ${selectedRow.openingNumber}`
                  : 'No opening selected'}
              </h2>
            </div>

            {selectedRow ? (
              <div className="mt-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem
                    label="Location"
                    value={selectedRow.location}
                  />

                  <DetailItem
                    label="Product"
                    value={displayValue(
                      selectedRow.product.label,
                      selectedRow.product
                        .productCategory,
                    )}
                  />

                  <DetailItem
                    label="Category"
                    value={displayValue(
                      selectedRow.product
                        .productCategory,
                    )}
                  />

                  <DetailItem
                    label="Dimensions"
                    value={`${displayValue(
                      selectedRow.product.width,
                    )} × ${displayValue(
                      selectedRow.product.height,
                    )}`}
                  />

                  <DetailItem
                    label="Glass Type"
                    value={
                      selectedRow.impact
                        ? 'Impact'
                        : 'Non-Impact'
                    }
                  />

                  <DetailItem
                    label="Interior Color"
                    value={displayValue(
                      selectedRow.product
                        .interiorColor,
                      selectedRow.product.color,
                    )}
                  />

                  <DetailItem
                    label="Exterior Color"
                    value={displayValue(
                      selectedRow.product
                        .exteriorColor,
                      selectedRow.product.color,
                    )}
                  />

                  <DetailItem
                    label="Glass Package"
                    value={displayValue(
                      selectedRow.product
                        .glassPackage,
                      selectedRow.product.glass,
                    )}
                  />

                  <DetailItem
                    label="Grids"
                    value={displayValue(
                      selectedRow.product.grids,
                      selectedRow.product.grid,
                    )}
                  />

                  <DetailItem
                    label="Screens"
                    value={displayValue(
                      selectedRow.product.screens,
                      selectedRow.product.screen,
                    )}
                  />

                  <DetailItem
                    label="Product Price"
                    value={formatCurrency(
                      selectedRow.price,
                    )}
                  />

                  <DetailItem
                    label="Mullion Charge"
                    value={formatCurrency(
                      selectedRow.mullionCharge,
                    )}
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-[#E8E4DD] bg-[#FCFBF9] p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#999999]">
                    Notes
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#666666]">
                    {displayValue(
                      selectedRow.product.notes,
                      selectedRow.openingNotes,
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-dashed border-[#D8D4CB] bg-[#FAF9F6] px-5 py-12 text-center">
                <p className="text-sm text-[#888888]">
                  Select a product from the opening
                  schedule.
                </p>
              </div>
            )}
          </section>

          <aside className="rounded-[28px] border border-[#E8E4DD] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B59A68]">
              Contract Summary
            </p>

            <h2 className="mt-3 text-2xl font-light text-[#555555]">
              Project Pricing
            </h2>

            <div className="mt-8 space-y-5">
              <PriceLine
                label="Retail Price"
                value={formatCurrency(retailPrice)}
              />

              <PriceLine
                label="Discounts"
                value={`-${formatCurrency(
                  discountTotal,
                )}`}
                muted
              />

              <div className="border-t border-[#DDD8CF] pt-5">
                <PriceLine
                  label="Contract Total"
                  value={formatCurrency(projectTotal)}
                  emphasized
                />
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-[#1C2D36] p-6 text-white">
              <p className="text-xs uppercase tracking-[0.16em] text-white/60">
                Total Products
              </p>

              <p className="mt-3 text-4xl font-light">
                {productRows.length}
              </p>

              <p className="mt-3 text-sm leading-6 text-white/65">
                {windowCount} windows and {doorCount}{' '}
                doors included in this contract.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-8 flex flex-col-reverse justify-between gap-4 sm:flex-row">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-xl border border-[#D9D4CB] bg-white px-7 py-3.5 text-sm font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#8C754A]"
          >
            Back
          </button>

          <button
            type="button"
            disabled={productRows.length === 0}
            onClick={handleNext}
            className="rounded-xl bg-[#222222] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#3A3A3A] disabled:cursor-not-allowed disabled:bg-[#D8D5CE] disabled:text-[#A8A39A]"
          >
            Save and Continue
          </button>
        </div>
      </div>
    </section>
  )
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[#E8E4DD] bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#999999]">
        {label}
      </p>

      <p className="mt-2 truncate text-lg font-medium text-[#555555]">
        {value}
      </p>
    </div>
  )
}

function TableHeader({
  children,
  align = 'left',
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
}) {
  return (
    <th
      className={`px-6 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[#888888] ${
        align === 'right'
          ? 'text-right'
          : 'text-left'
      }`}
    >
      {children}
    </th>
  )
}

function TableCell({
  children,
  align = 'left',
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
}) {
  return (
    <td
      className={`px-6 py-5 text-sm text-[#666666] ${
        align === 'right'
          ? 'text-right'
          : 'text-left'
      }`}
    >
      {children}
    </td>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[#E8E4DD] bg-[#FCFBF9] p-5">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#999999]">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium leading-6 text-[#555555]">
        {value}
      </p>
    </div>
  )
}

function PriceLine({
  label,
  value,
  muted = false,
  emphasized = false,
}: {
  label: string
  value: string
  muted?: boolean
  emphasized?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <p
        className={
          emphasized
            ? 'text-base font-medium text-[#444444]'
            : 'text-sm text-[#777777]'
        }
      >
        {label}
      </p>

      <p
        className={
          emphasized
            ? 'text-2xl font-medium text-[#333333]'
            : muted
              ? 'text-sm font-medium text-[#9A8258]'
              : 'text-sm font-medium text-[#555555]'
        }
      >
        {value}
      </p>
    </div>
  )
}