const AUTH_STORAGE_KEY = 'cronus_portal_authenticated'
const USER_STORAGE_KEY = 'cronus_portal_user'

export type CronusUser = {
  name: string
  email: string
  role: 'admin' | 'sales'
}

type LoginResult = {
  success: boolean
  message?: string
  user?: CronusUser
}

const authorizedUsers = [
  {
    email: 'admin@cronuswindows.com',
    password: 'Cronus2026!',
    name: 'Cronus Administrator',
    role: 'admin' as const,
  },
]

export function loginUser(email: string, password: string): LoginResult {
  const normalizedEmail = email.trim().toLowerCase()

  const matchingUser = authorizedUsers.find(
    (user) =>
      user.email.toLowerCase() === normalizedEmail &&
      user.password === password,
  )

  if (!matchingUser) {
    return {
      success: false,
      message: 'Incorrect email or password.',
    }
  }

  const authenticatedUser: CronusUser = {
    name: matchingUser.name,
    email: matchingUser.email,
    role: matchingUser.role,
  }

  localStorage.setItem(AUTH_STORAGE_KEY, 'true')
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authenticatedUser))

  return {
    success: true,
    user: authenticatedUser,
  }
}

export function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

export function isAuthenticated() {
  return localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
}

export function getAuthenticatedUser(): CronusUser | null {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as CronusUser
  } catch {
    logoutUser()
    return null
  }
}