import type { ReactNode } from 'react'

import {
  Navigate,
  useLocation,
} from 'react-router-dom'

import {
  getAuthenticatedUser,
  isAuthenticated,
  type CronusUser,
} from '../auth/auth'

type PermissionKey =
  | 'canViewCustomers'
  | 'canViewQuotes'
  | 'canViewContracts'
  | 'canViewPricing'
  | 'canManageUsers'

type ProtectedRouteProps = {
  children: ReactNode
  requiredPermission?: PermissionKey
}

export default function ProtectedRoute({
  children,
  requiredPermission,
}: ProtectedRouteProps) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    )
  }

  const user =
    getAuthenticatedUser()

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (user.mustChangePassword) {
    return (
      <Navigate
        to="/change-password"
        replace
      />
    )
  }

  if (
    requiredPermission &&
    !user[
      requiredPermission as keyof CronusUser
    ]
  ) {
    return (
      <Navigate
        to="/portal"
        replace
      />
    )
  }

  return <>{children}</>
}
