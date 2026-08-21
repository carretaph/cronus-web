import {
  useState,
  type FormEvent,
} from 'react'

import {
  Navigate,
  useNavigate,
} from 'react-router-dom'

import {
  getAuthenticatedUser,
  logoutUser,
} from '../auth/auth'

const API_BASE_URL =
  import.meta.env.VITE_CRONUS_API_URL ??
  'https://cronus-backend.onrender.com'

export default function ChangePassword() {
  const navigate = useNavigate()
  const user = getAuthenticatedUser()

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState('')

  const [
    newPassword,
    setNewPassword,
  ] = useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setErrorMessage('')

    if (newPassword.length < 8) {
      setErrorMessage(
        'New password must contain at least 8 characters.',
      )
      return
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setErrorMessage(
        'New passwords do not match.',
      )
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            email: user?.email ?? '',
            currentPassword,
            newPassword,
          }),
        },
      )

      if (!response.ok) {
        const message =
          await response.text()

        setErrorMessage(
          message ||
            'Unable to change password.',
        )

        setIsSubmitting(false)
        return
      }

      const updatedUser =
        await response.json()

      localStorage.setItem(
        'cronus_portal_user',
        JSON.stringify(
          updatedUser,
        ),
      )

      navigate('/portal', {
        replace: true,
      })
    } catch (error) {
      console.error(
        'Unable to change password:',
        error,
      )

      setErrorMessage(
        'Unable to connect to the Cronus server.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleLogout() {
    logoutUser()

    navigate('/login', {
      replace: true,
    })
  }

  return (
    <main className="min-h-screen bg-[#F7F6F2] px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-2xl items-center">
        <div className="w-full rounded-[30px] border border-[#E8E5DE] bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)] sm:p-12">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
            Account security
          </p>

          <h1 className="mt-5 text-4xl font-light tracking-[-0.04em] text-[#444444]">
            Change your password
          </h1>

          <p className="mt-4 text-base leading-7 text-[#777777]">
            Your account is using a
            temporary password. Create
            your personal password before
            entering the Cronus portal.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-9 space-y-5"
          >
            <PasswordField
              label="Current password"
              value={currentPassword}
              onChange={
                setCurrentPassword
              }
            />

            <PasswordField
              label="New password"
              value={newPassword}
              onChange={
                setNewPassword
              }
            />

            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={
                setConfirmPassword
              }
            />

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-14 w-full items-center justify-center rounded-xl bg-[#222222] text-sm font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#B59A68] disabled:opacity-60"
            >
              {isSubmitting
                ? 'Updating...'
                : 'Change password'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 text-sm text-[#888888] transition hover:text-[#B59A68]"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  )
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-[#555555]">
        {label}
      </span>

      <input
        type="password"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        required
        className="h-14 w-full rounded-xl border border-[#DDD9D0] bg-white px-4 text-[#333333] outline-none transition focus:border-[#B59A68] focus:ring-2 focus:ring-[#B59A68]/15"
      />
    </label>
  )
}
