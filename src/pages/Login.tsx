import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  isAuthenticated,
  loginUser,
} from '../auth/auth'

type LoginLocationState = {
  from?: string
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated()) {
    return <Navigate to="/portal" replace />
  }

  const locationState =
    location.state as LoginLocationState | null

  const destination = locationState?.from || '/portal'

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setErrorMessage('')
    setIsSubmitting(true)

    const result = loginUser(email, password)

    if (!result.success) {
      setErrorMessage(
        result.message || 'Unable to sign in.',
      )
      setIsSubmitting(false)
      return
    }

    navigate(destination, {
      replace: true,
    })
  }

  return (
    <main className="min-h-screen bg-[#F7F6F2] px-6 py-12 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.08)] lg:grid-cols-2">
          <section className="hidden min-h-[680px] bg-[#222222] p-14 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#B59A68]">
                Cronus Windows & Doors
              </p>

              <h1 className="mt-8 max-w-lg text-5xl font-extralight leading-[1.05] tracking-[-0.04em]">
                Professional quoting, wherever your
                customers are.
              </h1>

              <p className="mt-8 max-w-md text-lg font-light leading-8 text-white/65">
                Create accurate window and door
                estimates from the office or directly
                inside the customer&apos;s home.
              </p>
            </div>

            <p className="text-sm text-white/40">
              Authorized personnel only
            </p>
          </section>

          <section className="flex min-h-[680px] items-center px-8 py-14 sm:px-14 lg:px-20">
            <div className="w-full">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
                Private portal
              </p>

              <h2 className="mt-5 text-4xl font-light tracking-[-0.04em] text-[#333333]">
                Sign in
              </h2>

              <p className="mt-4 text-base leading-7 text-[#777777]">
                Enter your authorized Cronus account
                information.
              </p>

              <form
                className="mt-10 space-y-6"
                onSubmit={handleSubmit}
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#444444]"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    autoComplete="email"
                    required
                    placeholder="name@cronuswindows.com"
                    className="h-14 w-full rounded-xl border border-[#DDDDDD] bg-white px-4 text-[#333333] outline-none transition focus:border-[#B59A68] focus:ring-2 focus:ring-[#B59A68]/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-[#444444]"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    className="h-14 w-full rounded-xl border border-[#DDDDDD] bg-white px-4 text-[#333333] outline-none transition focus:border-[#B59A68] focus:ring-2 focus:ring-[#B59A68]/15"
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-14 w-full items-center justify-center rounded-xl bg-[#222222] px-6 text-sm font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#B59A68] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? 'Signing in...'
                    : 'Enter portal'}
                </button>
              </form>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-8 text-sm text-[#777777] transition hover:text-[#B59A68]"
              >
                ← Return to website
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}