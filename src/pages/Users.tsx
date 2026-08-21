import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  type ApiUser,
  type UserPayload,
  type UserRole,
} from '../services/usersApi'

import {
  getAuthenticatedUser,
} from '../auth/auth'

const DEFAULT_TEMP_PASSWORD =
  'Cronus123@'

type UserFormState = {
  id: string | null
  name: string
  email: string
  password: string
  role: UserRole
  active: boolean
  managerId: string

  canViewCustomers: boolean
  canManageCustomers: boolean

  canViewQuotes: boolean
  canManageQuotes: boolean

  canViewContracts: boolean
  canManageContracts: boolean

  canViewPricing: boolean
  canManagePricing: boolean

  canManageUsers: boolean
}

const salesPermissions = {
  canViewCustomers: true,
  canManageCustomers: true,
  canViewQuotes: true,
  canManageQuotes: true,
  canViewContracts: true,
  canManageContracts: true,
  canViewPricing: false,
  canManagePricing: false,
  canManageUsers: false,
}

const managerPermissions = {
  canViewCustomers: true,
  canManageCustomers: true,
  canViewQuotes: true,
  canManageQuotes: true,
  canViewContracts: true,
  canManageContracts: true,
  canViewPricing: false,
  canManagePricing: false,
  canManageUsers: true,
}

const adminPermissions = {
  canViewCustomers: true,
  canManageCustomers: true,
  canViewQuotes: true,
  canManageQuotes: true,
  canViewContracts: true,
  canManageContracts: true,
  canViewPricing: true,
  canManagePricing: true,
  canManageUsers: true,
}

const emptyForm: UserFormState = {
  id: null,
  name: '',
  email: '',
  password: DEFAULT_TEMP_PASSWORD,
  role: 'SALES',
  active: true,
  managerId: '',
  ...salesPermissions,
}

function permissionsForRole(
  role: UserRole,
) {
  if (role === 'ADMIN') {
    return adminPermissions
  }

  if (role === 'MANAGER') {
    return managerPermissions
  }

  return salesPermissions
}

function roleLabel(
  role: UserRole,
) {
  if (role === 'ADMIN') {
    return 'Admin'
  }

  if (role === 'MANAGER') {
    return 'Manager'
  }

  return 'Sales'
}

function formatDateTime(
  value?: string | null,
) {
  if (!value) {
    return 'Never'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(date)
}

export default function Users() {
  const authenticatedUser =
    getAuthenticatedUser()

  const [users, setUsers] =
    useState<ApiUser[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [searchTerm, setSearchTerm] =
    useState('')

  const [
    showUserForm,
    setShowUserForm,
  ] = useState(false)

  const [form, setForm] =
    useState<UserFormState>(
      emptyForm,
    )

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  useEffect(() => {
    async function loadUsers() {
      try {
        const records =
          await getUsers()

        setUsers(records)
      } catch (error) {
        console.error(
          'Unable to load users:',
          error,
        )

        setErrorMessage(
          'Unable to load users.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadUsers()
  }, [])

  const filteredUsers =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase()

      if (!search) {
        return users
      }

      return users.filter(
        (user) =>
          [
            user.name,
            user.email,
            roleLabel(user.role),
          ]
            .join(' ')
            .toLowerCase()
            .includes(search),
      )
    }, [searchTerm, users])

  const managers =
    useMemo(
      () =>
        users.filter(
          (user) =>
            user.active &&
            (
              user.role === 'ADMIN' ||
              user.role === 'MANAGER'
            ),
        ),
      [users],
    )

  if (
    !authenticatedUser ||
    !authenticatedUser.canManageUsers
  ) {
    return (
      <section className="px-5 py-9 sm:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="rounded-[24px] border border-[#E8E5DE] bg-white p-10">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#B59A68]">
              Administration
            </p>

            <h1 className="mt-4 text-4xl font-extralight text-[#555555]">
              Access restricted
            </h1>

            <p className="mt-4 text-[#777777]">
              Your account does not have
              permission to manage users.
            </p>
          </div>
        </div>
      </section>
    )
  }

  function updateForm<
    Field extends keyof UserFormState,
  >(
    field: Field,
    value: UserFormState[Field],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function openNewUser() {
    setErrorMessage('')
    setSuccessMessage('')

    setForm({
      ...emptyForm,
    })

    setShowUserForm(true)
  }

  function openEditUser(
    user: ApiUser,
  ) {
    setErrorMessage('')
    setSuccessMessage('')

    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      active: user.active,
      managerId:
        user.managerId ?? '',

      canViewCustomers:
        user.canViewCustomers,

      canManageCustomers:
        user.canManageCustomers,

      canViewQuotes:
        user.canViewQuotes,

      canManageQuotes:
        user.canManageQuotes,

      canViewContracts:
        user.canViewContracts,

      canManageContracts:
        user.canManageContracts,

      canViewPricing:
        user.canViewPricing,

      canManagePricing:
        user.canManagePricing,

      canManageUsers:
        user.canManageUsers,
    })

    setShowUserForm(true)
  }

  function handleRoleChange(
    role: UserRole,
  ) {
    setForm((current) => ({
      ...current,
      role,
      ...permissionsForRole(role),
      managerId:
        role === 'ADMIN'
          ? ''
          : current.managerId,
    }))
  }

  function closeForm() {
    setErrorMessage('')
    setShowUserForm(false)
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')

    if (
      !form.name.trim() ||
      !form.email.trim()
    ) {
      setErrorMessage(
        'Name and email are required.',
      )
      return
    }

    if (
      !form.id &&
      form.password.length < 8
    ) {
      setErrorMessage(
        'Temporary password must contain at least 8 characters.',
      )
      return
    }

    if (
      form.password &&
      form.password.length < 8
    ) {
      setErrorMessage(
        'Password must contain at least 8 characters.',
      )
      return
    }

    const payload: UserPayload = {
      name: form.name.trim(),

      email:
        form.email
          .trim()
          .toLowerCase(),

      role: form.role,
      active: form.active,

      managerId:
        form.managerId || null,

      canViewCustomers:
        form.canViewCustomers,

      canManageCustomers:
        form.canManageCustomers,

      canViewQuotes:
        form.canViewQuotes,

      canManageQuotes:
        form.canManageQuotes,

      canViewContracts:
        form.canViewContracts,

      canManageContracts:
        form.canManageContracts,

      canViewPricing:
        form.canViewPricing,

      canManagePricing:
        form.canManagePricing,

      canManageUsers:
        form.canManageUsers,
    }

    if (form.password.trim()) {
      payload.password =
        form.password
    }

    try {
      if (form.id) {
        const saved =
          await updateUser(
            form.id,
            payload,
          )

        setUsers((current) =>
          current.map((user) =>
            user.id === saved.id
              ? saved
              : user,
          ),
        )

        setSuccessMessage(
          form.password
            ? 'User updated and temporary password reset.'
            : 'User updated successfully.',
        )
      } else {
        const saved =
          await createUser(payload)

        setUsers((current) => [
          saved,
          ...current,
        ])

        setSuccessMessage(
          'User created successfully with a temporary password.',
        )
      }

      setShowUserForm(false)
    } catch (error) {
      console.error(
        'Unable to save user:',
        error,
      )

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save user.',
      )
    }
  }

  async function handleDelete(
    user: ApiUser,
  ) {
    if (
      user.id ===
      authenticatedUser?.id
    ) {
      window.alert(
        'You cannot delete your own account.',
      )
      return
    }

    const confirmed =
      window.confirm(
        `Delete ${user.name}?`,
      )

    if (!confirmed) {
      return
    }

    try {
      await deleteUser(user.id)

      setUsers((current) =>
        current.filter(
          (item) =>
            item.id !== user.id,
        ),
      )
    } catch (error) {
      console.error(
        'Unable to delete user:',
        error,
      )

      window.alert(
        'Unable to delete user.',
      )
    }
  }

  function managerName(
    managerId: string | null,
  ) {
    if (!managerId) {
      return '—'
    }

    return (
      users.find(
        (user) =>
          user.id === managerId,
      )?.name ?? 'Unknown'
    )
  }

  return (
    <section className="px-5 py-9 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Administration
            </p>

            <h1 className="mt-4 text-4xl font-extralight tracking-[-0.04em] text-[#555555] sm:text-5xl">
              Users
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#777777]">
              Manage portal access,
              roles, managers and
              individual permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewUser}
            className="inline-flex h-14 items-center justify-center rounded-xl bg-[#222222] px-7 text-sm font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#B59A68]"
          >
            + New user
          </button>
        </div>

        {successMessage && (
          <div className="mt-6 rounded-xl border border-[#CFE0CF] bg-[#EFF7EF] px-4 py-3 text-sm font-medium text-[#4F6F4F]">
            {successMessage}
          </div>
        )}

        {!showUserForm &&
          errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

        <div className="mt-9 rounded-[22px] border border-[#E8E5DE] bg-white p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search by name, email or role"
              className="w-full rounded-xl border border-[#DDD9D0] bg-[#FAF9F6] px-4 py-3.5 text-sm text-[#333333] outline-none transition focus:border-[#B59A68] focus:ring-2 focus:ring-[#B59A68]/15 md:max-w-2xl"
            />

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#F3EFE6] px-3 py-1.5 text-xs font-medium text-[#8D7651]">
                {filteredUsers.length}
              </span>

              <span className="text-sm text-[#888888]">
                {filteredUsers.length === 1
                  ? 'user'
                  : 'users'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-[#E8E5DE] bg-white">
          {isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <p className="text-sm text-[#888888]">
                Loading users...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-[#FAF9F6]">
                  <tr className="border-b border-[#E9E5DD]">
                    <TableHeading>
                      User
                    </TableHeading>

                    <TableHeading>
                      Role
                    </TableHeading>

                    <TableHeading>
                      Manager
                    </TableHeading>

                    <TableHeading>
                      Status
                    </TableHeading>

                    <TableHeading>
                      Password
                    </TableHeading>

                    <TableHeading>
                      Last login
                    </TableHeading>

                    <TableHeading align="right">
                      Actions
                    </TableHeading>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map(
                    (user) => (
                      <tr
                        key={user.id}
                        className="border-b border-[#F0EDE7] last:border-b-0"
                      >
                        <td className="px-6 py-5">
                          <p className="font-medium text-[#444444]">
                            {user.name}
                          </p>

                          <p className="mt-1 text-sm text-[#999999]">
                            {user.email}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full bg-[#F3EFE6] px-3 py-1 text-xs font-medium text-[#8D7651]">
                            {roleLabel(
                              user.role,
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-[#777777]">
                          {managerName(
                            user.managerId,
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              user.active
                                ? 'bg-[#EDF6ED] text-[#4F744F]'
                                : 'bg-[#F5EEEE] text-[#966666]'
                            }`}
                          >
                            {user.active
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          {user.mustChangePassword ? (
                            <span className="text-xs font-medium text-[#A87B45]">
                              Change required
                            </span>
                          ) : (
                            <span className="text-xs text-[#888888]">
                              Set
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5 text-sm text-[#777777]">
                          {formatDateTime(
                            user.lastLoginAt,
                          )}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              openEditUser(
                                user,
                              )
                            }
                            className="rounded-lg px-3 py-2 text-sm font-medium text-[#8D7651] transition hover:bg-[#F7F3EB]"
                          >
                            Edit
                          </button>

                          {user.id !==
                            authenticatedUser.id && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  user,
                                )
                              }
                              className="ml-2 rounded-lg px-3 py-2 text-sm font-medium text-[#A66666] transition hover:bg-[#FFF2F2]"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showUserForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-4xl rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#B59A68]">
                    User administration
                  </p>

                  <h2 className="mt-3 text-3xl font-light text-[#444444]">
                    {form.id
                      ? 'Edit user'
                      : 'New user'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  className="text-2xl text-[#999999]"
                >
                  ×
                </button>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={(value) =>
                    updateForm(
                      'name',
                      value,
                    )
                  }
                />

                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(value) =>
                    updateForm(
                      'email',
                      value,
                    )
                  }
                />

                <TextField
                  label={
                    form.id
                      ? 'Reset Password'
                      : 'Temporary Password'
                  }
                  type="password"
                  value={form.password}
                  placeholder={
                    form.id
                      ? 'Leave blank to keep current password'
                      : DEFAULT_TEMP_PASSWORD
                  }
                  onChange={(value) =>
                    updateForm(
                      'password',
                      value,
                    )
                  }
                />

                <label>
                  <span className="mb-2 block text-sm font-medium text-[#555555]">
                    Role
                  </span>

                  <select
                    value={form.role}
                    onChange={(event) =>
                      handleRoleChange(
                        event.target
                          .value as UserRole,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-[#DDD9D0] bg-white px-4 text-sm text-[#444444] outline-none focus:border-[#B59A68]"
                  >
                    <option value="ADMIN">
                      Admin
                    </option>

                    <option value="MANAGER">
                      Manager
                    </option>

                    <option value="SALES">
                      Sales
                    </option>
                  </select>
                </label>

                {form.role !== 'ADMIN' && (
                  <label>
                    <span className="mb-2 block text-sm font-medium text-[#555555]">
                      Assigned Manager
                    </span>

                    <select
                      value={
                        form.managerId
                      }
                      onChange={(event) =>
                        updateForm(
                          'managerId',
                          event.target.value,
                        )
                      }
                      className="h-12 w-full rounded-xl border border-[#DDD9D0] bg-white px-4 text-sm text-[#444444] outline-none focus:border-[#B59A68]"
                    >
                      <option value="">
                        No manager assigned
                      </option>

                      {managers.map(
                        (manager) => (
                          <option
                            key={
                              manager.id
                            }
                            value={
                              manager.id
                            }
                          >
                            {manager.name} —{' '}
                            {roleLabel(
                              manager.role,
                            )}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                )}
              </div>

              {!form.id && (
                <div className="mt-5 rounded-xl border border-[#E5DFD2] bg-[#FAF7F0] px-4 py-3 text-sm text-[#7A6A4E]">
                  Standard temporary password:{' '}
                  <strong>
                    {DEFAULT_TEMP_PASSWORD}
                  </strong>
                  . The account will be
                  marked for a password
                  change.
                </div>
              )}

              <div className="mt-7 rounded-2xl border border-[#E8E5DE] bg-[#FAF9F6] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#444444]">
                      Account active
                    </p>

                    <p className="mt-1 text-sm text-[#888888]">
                      Inactive users
                      cannot sign in.
                    </p>
                  </div>

                  <Toggle
                    checked={
                      form.active
                    }
                    onChange={(value) =>
                      updateForm(
                        'active',
                        value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="mt-7">
                <h3 className="text-lg font-medium text-[#444444]">
                  Permissions
                </h3>

                <p className="mt-1 text-sm text-[#888888]">
                  Role defaults can be
                  customized for each user.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <PermissionCard
                    label="Customers"
                    view={
                      form.canViewCustomers
                    }
                    manage={
                      form.canManageCustomers
                    }
                    onView={(value) =>
                      updateForm(
                        'canViewCustomers',
                        value,
                      )
                    }
                    onManage={(value) =>
                      updateForm(
                        'canManageCustomers',
                        value,
                      )
                    }
                  />

                  <PermissionCard
                    label="Quotes"
                    view={
                      form.canViewQuotes
                    }
                    manage={
                      form.canManageQuotes
                    }
                    onView={(value) =>
                      updateForm(
                        'canViewQuotes',
                        value,
                      )
                    }
                    onManage={(value) =>
                      updateForm(
                        'canManageQuotes',
                        value,
                      )
                    }
                  />

                  <PermissionCard
                    label="Contracts"
                    view={
                      form.canViewContracts
                    }
                    manage={
                      form.canManageContracts
                    }
                    onView={(value) =>
                      updateForm(
                        'canViewContracts',
                        value,
                      )
                    }
                    onManage={(value) =>
                      updateForm(
                        'canManageContracts',
                        value,
                      )
                    }
                  />

                  <PermissionCard
                    label="Pricing Engine"
                    view={
                      form.canViewPricing
                    }
                    manage={
                      form.canManagePricing
                    }
                    onView={(value) =>
                      updateForm(
                        'canViewPricing',
                        value,
                      )
                    }
                    onManage={(value) =>
                      updateForm(
                        'canManagePricing',
                        value,
                      )
                    }
                  />

                  <div className="rounded-xl border border-[#E5E1D9] bg-white p-4">
                    <p className="text-sm font-medium text-[#555555]">
                      Users
                    </p>

                    <label className="mt-4 flex items-center justify-between gap-4 text-sm text-[#777777]">
                      Manage users

                      <Toggle
                        checked={
                          form.canManageUsers
                        }
                        onChange={(value) =>
                          updateForm(
                            'canManageUsers',
                            value,
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-[#D8D4CB] px-5 py-3 text-sm font-medium text-[#666666]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#222222] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#B59A68]"
                >
                  {form.id
                    ? 'Save changes'
                    : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  )
}

function TableHeading({
  children,
  align = 'left',
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
}) {
  return (
    <th
      className={`px-6 py-4 text-xs font-medium uppercase tracking-[0.16em] text-[#999999] ${
        align === 'right'
          ? 'text-right'
          : 'text-left'
      }`}
    >
      {children}
    </th>
  )
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-[#555555]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-12 w-full rounded-xl border border-[#DDD9D0] bg-white px-4 text-sm text-[#444444] outline-none focus:border-[#B59A68]"
      />
    </label>
  )
}

function PermissionCard({
  label,
  view,
  manage,
  onView,
  onManage,
}: {
  label: string
  view: boolean
  manage: boolean
  onView: (value: boolean) => void
  onManage: (value: boolean) => void
}) {
  return (
    <div className="rounded-xl border border-[#E5E1D9] bg-white p-4">
      <p className="text-sm font-medium text-[#555555]">
        {label}
      </p>

      <label className="mt-4 flex items-center justify-between gap-4 text-sm text-[#777777]">
        View

        <Toggle
          checked={view}
          onChange={onView}
        />
      </label>

      <label className="mt-3 flex items-center justify-between gap-4 text-sm text-[#777777]">
        Manage

        <Toggle
          checked={manage}
          onChange={(value) => {
            onManage(value)

            if (value && !view) {
              onView(true)
            }
          }}
        />
      </label>
    </div>
  )
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`relative h-6 w-11 rounded-full transition ${
        checked
          ? 'bg-[#B59A68]'
          : 'bg-[#D9D5CD]'
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          checked
            ? 'left-6'
            : 'left-1'
        }`}
      />
    </button>
  )
}
