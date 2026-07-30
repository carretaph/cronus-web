import { pricingConfig } from '../data/pricing'

export type MeasurementValue =
  | string
  | number
  | null
  | undefined

export type CoreProductPriceInput = {
  width: MeasurementValue
  height: MeasurementValue
  isDoor: boolean
  impact: boolean
}

export type CoreProductPriceBreakdown = {
  width: number
  height: number
  squareFeet: number
  ratePerSquareFoot: number
  basePrice: number
  impactPrice: number
  total: number
}

export function parsePricingMeasurement(
  value: MeasurementValue,
): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
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
  const width = parsePricingMeasurement(widthValue)
  const height = parsePricingMeasurement(heightValue)

  if (width <= 0 || height <= 0) {
    return 0
  }

  return (width * height) / 144
}

export function calculateCoreProductPrice({
  width: widthValue,
  height: heightValue,
  isDoor,
  impact,
}: CoreProductPriceInput): CoreProductPriceBreakdown {
  const width = parsePricingMeasurement(widthValue)
  const height = parsePricingMeasurement(heightValue)

  const squareFeet =
    width > 0 && height > 0
      ? (width * height) / 144
      : 0

  const ratePerSquareFoot = isDoor
    ? pricingConfig.doorPerSquareFoot
    : squareFeet >= 10
      ? pricingConfig.window10SquareFeetOrMore
      : pricingConfig.windowUnder10SquareFeet

  const basePrice = squareFeet * ratePerSquareFoot

  const impactPrice = impact
    ? isDoor
      ? pricingConfig.impactDoor
      : basePrice *
        (pricingConfig.impactWindowMultiplier - 1)
    : 0

  return {
    width,
    height,
    squareFeet,
    ratePerSquareFoot,
    basePrice,
    impactPrice,
    total: basePrice + impactPrice,
  }
}
