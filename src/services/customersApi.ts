const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://cronus-backend.onrender.com'

export type ApiCustomer = {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  notes: string
  createdAt: string
}

export async function getCustomers(): Promise<ApiCustomer[]> {
  const response = await fetch(`${API_BASE_URL}/api/customers`)

  if (!response.ok) {
    throw new Error(
      `Unable to load customers: ${response.status}`,
    )
  }

  return response.json()
}

export async function createCustomer(
  customer: ApiCustomer,
): Promise<ApiCustomer> {
  const response = await fetch(`${API_BASE_URL}/api/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customer),
  })

  if (!response.ok) {
    throw new Error(
      `Unable to create customer: ${response.status}`,
    )
  }

  return response.json()
}

export async function deleteCustomer(
  customerId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/customers/${customerId}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error(
      `Unable to delete customer: ${response.status}`,
    )
  }
}
