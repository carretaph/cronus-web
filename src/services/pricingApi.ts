export type ApiProductPrice = {
  id?: number
  manufacturer: string
  supplier: string
  name: string
  configuration: string
  material: string
  category: string
  pricingUnit: string
  standardRate: number
  smallOpeningRate: number
  smallOpeningThreshold: number
  active: boolean
}

const API_BASE_URL =
  import.meta.env.VITE_CRONUS_API_URL ??
  'https://cronus-backend.onrender.com'

const PRODUCTS_URL =
  `${API_BASE_URL}/api/pricing/products`

export async function getProductPrices(): Promise<
  ApiProductPrice[]
> {
  const response = await fetch(PRODUCTS_URL)

  if (!response.ok) {
    throw new Error(
      `Failed to load product prices: ${response.status}`,
    )
  }

  return response.json()
}

export async function createProductPrice(
  product: ApiProductPrice,
): Promise<ApiProductPrice> {
  const response = await fetch(PRODUCTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  })

  if (!response.ok) {
    throw new Error(
      `Failed to create product price: ${response.status}`,
    )
  }

  return response.json()
}

export async function updateProductPrice(
  id: number,
  product: ApiProductPrice,
): Promise<ApiProductPrice> {
  const response = await fetch(
    `${PRODUCTS_URL}/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to update product price: ${response.status}`,
    )
  }

  return response.json()
}

export async function deleteProductPrice(
  id: number,
): Promise<void> {
  const response = await fetch(
    `${PRODUCTS_URL}/${id}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to delete product price: ${response.status}`,
    )
  }
}

export type ApiAdditionalCost = {
  id?: number
  name: string
  pricingUnit: string
  cost: number
  active: boolean
}

const ADDITIONAL_COSTS_URL =
  `${API_BASE_URL}/api/pricing/additional-costs`

export async function getAdditionalCosts(): Promise<
  ApiAdditionalCost[]
> {
  const response = await fetch(
    ADDITIONAL_COSTS_URL,
  )

  if (!response.ok) {
    throw new Error(
      `Failed to load additional costs: ${response.status}`,
    )
  }

  return response.json()
}

export async function createAdditionalCost(
  item: ApiAdditionalCost,
): Promise<ApiAdditionalCost> {
  const response = await fetch(
    ADDITIONAL_COSTS_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to create additional cost: ${response.status}`,
    )
  }

  return response.json()
}

export async function updateAdditionalCostApi(
  id: number,
  item: ApiAdditionalCost,
): Promise<ApiAdditionalCost> {
  const response = await fetch(
    `${ADDITIONAL_COSTS_URL}/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to update additional cost: ${response.status}`,
    )
  }

  return response.json()
}

export async function deleteAdditionalCost(
  id: number,
): Promise<void> {
  const response = await fetch(
    `${ADDITIONAL_COSTS_URL}/${id}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to delete additional cost: ${response.status}`,
    )
  }
}

export type ApiLaborCost = {
  id?: number
  name: string
  pricingUnit: string
  cost: number
  active: boolean
}

const LABOR_COSTS_URL =
  `${API_BASE_URL}/api/pricing/labor-costs`

export async function getLaborCosts(): Promise<
  ApiLaborCost[]
> {
  const response = await fetch(
    LABOR_COSTS_URL,
  )

  if (!response.ok) {
    throw new Error(
      `Failed to load labor costs: ${response.status}`,
    )
  }

  return response.json()
}

export async function createLaborCost(
  item: ApiLaborCost,
): Promise<ApiLaborCost> {
  const response = await fetch(
    LABOR_COSTS_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to create labor cost: ${response.status}`,
    )
  }

  return response.json()
}

export async function updateLaborCostApi(
  id: number,
  item: ApiLaborCost,
): Promise<ApiLaborCost> {
  const response = await fetch(
    `${LABOR_COSTS_URL}/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to update labor cost: ${response.status}`,
    )
  }

  return response.json()
}

export async function deleteLaborCost(
  id: number,
): Promise<void> {
  const response = await fetch(
    `${LABOR_COSTS_URL}/${id}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to delete labor cost: ${response.status}`,
    )
  }
}

export type ApiBusinessRules = {
  id?: number
  defaultMarkup: number
  minimumGrossMargin: number
  minimumProjectProfit: number
  maximumSalesDiscount: number
  salesTax: number
}

const BUSINESS_RULES_URL =
  `${API_BASE_URL}/api/pricing/business-rules`

export async function getBusinessRules(): Promise<
  ApiBusinessRules[]
> {
  const response = await fetch(
    BUSINESS_RULES_URL,
  )

  if (!response.ok) {
    throw new Error(
      `Failed to load business rules: ${response.status}`,
    )
  }

  return response.json()
}

export async function createBusinessRules(
  rules: ApiBusinessRules,
): Promise<ApiBusinessRules> {
  const response = await fetch(
    BUSINESS_RULES_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rules),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to create business rules: ${response.status}`,
    )
  }

  return response.json()
}

export async function updateBusinessRulesApi(
  id: number,
  rules: ApiBusinessRules,
): Promise<ApiBusinessRules> {
  const response = await fetch(
    `${BUSINESS_RULES_URL}/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rules),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to update business rules: ${response.status}`,
    )
  }

  return response.json()
}