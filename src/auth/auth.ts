const AUTH_STORAGE_KEY =
  'cronus_portal_authenticated'

const USER_STORAGE_KEY =
  'cronus_portal_user'

const API_BASE_URL =
  import.meta.env.VITE_CRONUS_API_URL ??
  'https://cronus-backend.onrender.com'

export type CronusUserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'SALES'

export type CronusUser = {
  id: string
  name: string
  email: string
  role: CronusUserRole
  active: boolean

  canViewCustomers: boolean
  canManageCustomers: boolean

  canViewQuotes: boolean
  canManageQuotes: boolean

  canViewContracts: boolean
  canManageContracts: boolean

  canViewPricing: boolean
  canManagePricing: boolean

  canManageUsers: boolean

  mustChangePassword?: boolean | null
  lastLoginAt?: string | null
  managerId?: string | null

  createdAt?: string
  updatedAt?: string
}

type LoginResult = {
  success: boolean
  message?: string
  user?: CronusUser
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResult> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/users/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      },
    )

    if (!response.ok) {
      let message =
        'Incorrect email or password.'

      try {
        const responseText =
          await response.text()

        if (responseText.trim()) {
          message = responseText
        }
      } catch {
        // Keep default message
      }

      return {
        success: false,
        message,
      }
    }

    const user =
      (await response.json()) as CronusUser

    if (!user.active) {
      return {
        success: false,
        message:
          'This account is inactive.',
      }
    }

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      'true',
    )

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(user),
    )

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error(
      'Unable to sign in:',
      error,
    )

    return {
      success: false,
      message:
        'Unable to connect to the Cronus server.',
    }
  }
}

export function logoutUser() {
  localStorage.removeItem(
    AUTH_STORAGE_KEY,
  )

  localStorage.removeItem(
    USER_STORAGE_KEY,
  )
}

export function isAuthenticated() {
  return (
    localStorage.getItem(
      AUTH_STORAGE_KEY,
    ) === 'true' &&
    getAuthenticatedUser() !== null
  )
}

export function getAuthenticatedUser():
  CronusUser | null {
  const storedUser =
    localStorage.getItem(
      USER_STORAGE_KEY,
    )

  if (!storedUser) {
    return null
  }

  try {
    const user =
      JSON.parse(
        storedUser,
      ) as CronusUser

    if (!user.active) {
      logoutUser()
      return null
    }

    return user
  } catch {
    logoutUser()
    return null
  }
}
