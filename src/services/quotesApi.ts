import {
  getAuthorizationHeaders,
} from '../auth/auth'

const API_BASE_URL =
  import.meta.env.VITE_CRONUS_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'https://cronus-backend.onrender.com'

export type ApiQuote = {
  id?: number
  estimateNumber: string
  customerId: string | null
  customerName: string
  customerEmail: string
  customerPhone: string
  projectFormJson: string
  openingsJson: string
  discountsJson: string
  selectedFinancingId: string
  downPayment: number
  retailPrice: number
  discountTotal: number
  projectTotal: number
  status: string
  appointmentDisposition: string | null
  createdAt: string
  updatedAt: string

  ownerUserId?: string | null
  ownerName?: string | null
  ownerManagerId?: string | null
  ownerManagerName?: string | null
}

export async function getQuotes():
  Promise<ApiQuote[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/quotes`,
    {
      headers: {
        ...getAuthorizationHeaders(),
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      `Unable to load quotes: ${response.status}`,
    )
  }

  return response.json()
}

export async function createQuote(
  quote: ApiQuote,
): Promise<ApiQuote> {
  const response = await fetch(
    `${API_BASE_URL}/api/quotes`,
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json',
        ...getAuthorizationHeaders(),
      },
      body: JSON.stringify(quote),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Unable to create quote: ${response.status}`,
    )
  }

  return response.json()
}

export async function updateQuote(
  id: number,
  quote: ApiQuote,
): Promise<ApiQuote> {
  const response = await fetch(
    `${API_BASE_URL}/api/quotes/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type':
          'application/json',
        ...getAuthorizationHeaders(),
      },
      body: JSON.stringify(quote),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Unable to update quote: ${response.status}`,
    )
  }

  return response.json()
}

export async function getQuoteByEstimateNumber(
  estimateNumber: string,
): Promise<ApiQuote | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/quotes/estimate/${encodeURIComponent(
      estimateNumber,
    )}`,
    {
      headers: {
        ...getAuthorizationHeaders(),
      },
    },
  )

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(
      `Unable to load quote: ${response.status}`,
    )
  }

  return response.json()
}
