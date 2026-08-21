import {
  getAuthorizationHeaders,
} from '../auth/auth'

const API_BASE_URL =
  import.meta.env.VITE_CRONUS_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'https://cronus-backend.onrender.com'

export type ApiContract = {
  id: string
  contractNumber: string
  estimateNumber: string
  customerName: string
  customerEmail: string
  projectTotal: number
  status: string
  workflowStatus: string
  contractJson: string
  createdAt: string
  updatedAt: string
  completedAt: string
  executedAt: string
  source: string
  version: number

  ownerUserId?: string | null
  ownerName?: string | null
  ownerManagerId?: string | null
  ownerManagerName?: string | null
}

export async function getContracts():
  Promise<ApiContract[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/contracts`,
    {
      headers: {
        ...getAuthorizationHeaders(),
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      `Unable to load contracts: ${response.status}`,
    )
  }

  return response.json()
}

export async function createContract(
  contract: ApiContract,
): Promise<ApiContract> {
  const response = await fetch(
    `${API_BASE_URL}/api/contracts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthorizationHeaders(),
      },
      body: JSON.stringify(contract),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Unable to create contract: ${response.status}`,
    )
  }

  return response.json()
}

export async function updateContract(
  id: string,
  contract: ApiContract,
): Promise<ApiContract> {
  const response = await fetch(
    `${API_BASE_URL}/api/contracts/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthorizationHeaders(),
      },
      body: JSON.stringify(contract),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Unable to update contract: ${response.status}`,
    )
  }

  return response.json()
}

export async function deleteContract(
  id: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/contracts/${id}`,
    {
      method: 'DELETE',
      headers: {
        ...getAuthorizationHeaders(),
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      `Unable to delete contract: ${response.status}`,
    )
  }
}

export async function getContractByNumber(
  contractNumber: string,
): Promise<ApiContract | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/contracts/number/${encodeURIComponent(
      contractNumber,
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
      `Unable to load contract: ${response.status}`,
    )
  }

  return response.json()
}
