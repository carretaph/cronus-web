export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'SALES'

export type ApiUser = {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  managerId: string | null
  mustChangePassword: boolean | null
  lastLoginAt: string | null

  canViewCustomers: boolean
  canManageCustomers: boolean

  canViewQuotes: boolean
  canManageQuotes: boolean

  canViewContracts: boolean
  canManageContracts: boolean

  canViewPricing: boolean
  canManagePricing: boolean

  canManageUsers: boolean

  createdAt?: string
  updatedAt?: string
}

export type UserPayload = {
  name: string
  email: string
  password?: string
  role: UserRole
  active: boolean
  managerId?: string | null

  canViewCustomers?: boolean
  canManageCustomers?: boolean

  canViewQuotes?: boolean
  canManageQuotes?: boolean

  canViewContracts?: boolean
  canManageContracts?: boolean

  canViewPricing?: boolean
  canManagePricing?: boolean

  canManageUsers?: boolean
}

const API_BASE_URL =
  import.meta.env.VITE_CRONUS_API_URL ??
  'https://cronus-backend.onrender.com'

const USERS_URL =
  `${API_BASE_URL}/api/users`

async function readError(
  response: Response,
) {
  try {
    const text = await response.text()

    return (
      text.trim() ||
      `Request failed: ${response.status}`
    )
  } catch {
    return `Request failed: ${response.status}`
  }
}

export async function getUsers():
  Promise<ApiUser[]> {
  const response = await fetch(USERS_URL)

  if (!response.ok) {
    throw new Error(
      await readError(response),
    )
  }

  return response.json()
}

export async function createUser(
  payload: UserPayload,
): Promise<ApiUser> {
  const response = await fetch(
    USERS_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    throw new Error(
      await readError(response),
    )
  }

  return response.json()
}

export async function updateUser(
  id: string,
  payload: UserPayload,
): Promise<ApiUser> {
  const response = await fetch(
    `${USERS_URL}/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    throw new Error(
      await readError(response),
    )
  }

  return response.json()
}

export async function deleteUser(
  id: string,
): Promise<void> {
  const response = await fetch(
    `${USERS_URL}/${id}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error(
      await readError(response),
    )
  }
}
