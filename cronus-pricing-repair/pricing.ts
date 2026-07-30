export const pricingConfig = {
  windowUnder10SquareFeet: 135,
  window10SquareFeetOrMore: 106,
  doorPerSquareFoot: 51,

  impactWindowMultiplier: 2,
  impactDoor: 0,
  tempered: 0,
  tinted: 0,
  privacyGlass: 0,
  grids: 0,
  nonStandardColor: 0,
  screenRemovalCredit: 0,
  installation: 0,
} as const

export type PricingConfig = typeof pricingConfig
