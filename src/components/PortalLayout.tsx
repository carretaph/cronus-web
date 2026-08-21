import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import {
  getAuthenticatedUser,
  logoutUser,
} from '../auth/auth'

export default function PortalLayout() {
  const navigate = useNavigate()
  const user = getAuthenticatedUser()

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  function handleLogout() {
    logoutUser()

    navigate('/login', {
      replace: true,
    })
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <header className="sticky top-0 z-40 border-b border-[#E8E5DE] bg-white">
        <div className="flex h-[78px] items-center justify-between px-5 sm:px-7 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((current) => !current)
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2DED5] text-[#444444] lg:hidden"
              aria-label="Open portal menu"
            >
              <MenuIcon />
            </button>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#B59A68]">
                Cronus Windows & Doors
              </p>

              <h1 className="mt-1 text-lg font-medium text-[#333333]">
                Management Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-[#333333]">
                {user?.name || 'Authorized user'}
              </p>

              <p className="text-[11px] uppercase tracking-[0.14em] text-[#999999]">
                {user?.role || 'User'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-[#DDDDDD] px-4 py-2.5 text-sm font-medium text-[#555555] transition hover:border-[#B59A68] hover:text-[#B59A68]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`
            fixed bottom-0 left-0 top-[78px] z-30
            w-[300px] border-r border-[#E8E5DE]
            bg-white p-5 transition-transform duration-300
            lg:sticky lg:top-[78px] lg:h-[calc(100vh-78px)]
            lg:shrink-0 lg:translate-x-0
            ${
              mobileMenuOpen
                ? 'translate-x-0'
                : '-translate-x-full'
            }
          `}
        >
          <nav className="space-y-2">
            <PortalNavLink
              to="/portal"
              label="Dashboard"
              icon={<DashboardIcon />}
              onClick={closeMobileMenu}
              end
            />

            {user?.canViewCustomers && (
              <PortalNavLink
                to="/portal/customers"
                label="Customers"
                icon={<CustomersIcon />}
                onClick={closeMobileMenu}
              />
            )}

            {user?.canViewQuotes && (
              <PortalNavLink
                to="/portal/quotes"
                label="Quotes"
                icon={<QuoteIcon />}
                onClick={closeMobileMenu}
              />
            )}

            {user?.canViewContracts && (
              <PortalNavLink
                to="/portal/contracts"
                label="Contracts"
                icon={<ContractIcon />}
                onClick={closeMobileMenu}
              />
            )}

            {user?.canViewPricing && (
              <PortalNavLink
                to="/portal/pricing"
                label="Pricing Engine"
                icon={<DatabaseIcon />}
                onClick={closeMobileMenu}
              />
            )}

            {user?.canManageUsers && (
              <PortalNavLink
                to="/portal/users"
                label="Users"
                icon={<UsersIcon />}
                onClick={closeMobileMenu}
              />
            )}
          </nav>

          <div className="absolute bottom-6 left-5 right-5 rounded-2xl bg-[#222222] p-5 text-white">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#B59A68]">
              Cronus Portal
            </p>

            <p className="mt-3 text-sm leading-6 text-white/60">
              Customers, quotes and project management
              for authorized personnel.
            </p>
          </div>
        </aside>

        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close portal menu"
            onClick={closeMobileMenu}
            className="fixed inset-0 top-[78px] z-20 bg-black/30 lg:hidden"
          />
        )}

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

type PortalNavLinkProps = {
  to: string
  label: string
  icon: ReactNode
  onClick: () => void
  end?: boolean
  disabled?: boolean
}

function PortalNavLink({
  to,
  label,
  icon,
  onClick,
  end = false,
  disabled = false,
}: PortalNavLinkProps) {
  if (disabled) {
    return (
      <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-[#BBBBBB]">
        <span className="flex h-5 w-5 items-center justify-center">
          {icon}
        </span>

        <span>{label}</span>

        <span className="ml-auto text-[9px] uppercase tracking-[0.15em]">
          Soon
        </span>
      </div>
    )
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `
          flex items-center gap-3 rounded-xl px-4 py-3.5
          text-sm font-medium transition
          ${
            isActive
              ? 'bg-[#222222] text-white'
              : 'text-[#666666] hover:bg-[#F5F3EE] hover:text-[#333333]'
          }
        `
      }
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {icon}
      </span>

      <span>{label}</span>
    </NavLink>
  )
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
      />

      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
      />

      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
      />

      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
      />
    </svg>
  )
}

function CustomersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <circle
        cx="9"
        cy="8"
        r="3"
      />

      <path d="M3.5 19c.5-4 2.5-6 5.5-6s5 2 5.5 6" />

      <circle
        cx="17"
        cy="9"
        r="2.4"
      />

      <path d="M15.5 14.2c3.2-.8 5.1.9 5.5 4.3" />
    </svg>
  )
}

function QuoteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M15 3v4h4" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </svg>
  )
}

function ContractIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <path d="M5 3h14v18H5z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h4" />
    </svg>
  )
}

function DatabaseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <ellipse
        cx="12"
        cy="5"
        rx="8"
        ry="3"
      />

      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <circle
        cx="8"
        cy="8"
        r="3"
      />

      <circle
        cx="17"
        cy="9"
        r="2.5"
      />

      <path d="M2.5 19c.5-4 2.5-6 5.5-6s5 2 5.5 6" />
      <path d="M14.5 14.5c3.5-.8 6.2 1 7 4.5" />
    </svg>
  )
}