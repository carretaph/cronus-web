export type Customer = {
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
  
  const CUSTOMERS_STORAGE_KEY = 'cronus_customers'
  
  export function getCustomers(): Customer[] {
    const storedCustomers = localStorage.getItem(
      CUSTOMERS_STORAGE_KEY,
    )
  
    if (!storedCustomers) {
      return []
    }
  
    try {
      const parsedCustomers = JSON.parse(
        storedCustomers,
      ) as Customer[]
  
      if (!Array.isArray(parsedCustomers)) {
        return []
      }
  
      return parsedCustomers
    } catch {
      return []
    }
  }
  
  export function saveCustomers(customers: Customer[]) {
    localStorage.setItem(
      CUSTOMERS_STORAGE_KEY,
      JSON.stringify(customers),
    )
  }
  
  export function createCustomer(
    customerData: Omit<Customer, 'id' | 'createdAt'>,
  ): Customer {
    const customers = getCustomers()
  
    const newCustomer: Customer = {
      ...customerData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
  
    saveCustomers([newCustomer, ...customers])
  
    return newCustomer
  }
  
  export function deleteCustomer(customerId: string) {
    const customers = getCustomers()
  
    const updatedCustomers = customers.filter(
      (customer) => customer.id !== customerId,
    )
  
    saveCustomers(updatedCustomers)
  }