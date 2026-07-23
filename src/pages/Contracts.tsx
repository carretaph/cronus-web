import { Link } from 'react-router-dom'
import { useMemo } from 'react'

const contractsStorageKey = 'cronus_contracts_v1'

type Contract = {
  contractNumber: string
  estimateNumber: string
  customerName: string
  projectTotal: number
  contractStatus: string
}

export default function Contracts() {
  const contracts = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem(contractsStorageKey) ?? '[]',
      ) as Contract[]
    } catch {
      return []
    }
  }, [])

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1450px]">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Sales
            </p>

            <h1 className="mt-4 text-5xl font-extralight text-[#555555]">
              Contracts
            </h1>

            <p className="mt-4 text-[#888888]">
              Signed customer agreements.
            </p>
          </div>

          <Link
            to="/portal/contracts/new"
            className="rounded-xl bg-[#222222] px-6 py-3 text-sm font-medium text-white"
          >
            New Contract
          </Link>
        </div>

        {contracts.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-[#E8E5DE] bg-white p-20 text-center">
            <h2 className="text-2xl font-light text-[#555555]">
              No contracts yet
            </h2>

            <p className="mt-4 text-[#999999]">
              Press <strong>Order Now!</strong> from Pricing to create your
              first contract.
            </p>
          </div>
        ) : (
          <div className="mt-10 overflow-hidden rounded-3xl border border-[#E8E5DE] bg-white">
            <table className="w-full">
              <thead className="bg-[#F8F8F8]">
                <tr>
                  <th className="px-6 py-4 text-left">Contract</th>
                  <th className="px-6 py-4 text-left">Estimate</th>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {contracts.map((contract) => (
                  <tr
                    key={contract.contractNumber}
                    className="border-t border-[#ECECEC]"
                  >
                    <td className="px-6 py-5">
                      {contract.contractNumber}
                    </td>

                    <td className="px-6 py-5">
                      {contract.estimateNumber}
                    </td>

                    <td className="px-6 py-5">
                      {contract.customerName}
                    </td>

                    <td className="px-6 py-5 text-right">
                      $
                      {contract.projectTotal.toLocaleString()}
                    </td>

                    <td className="px-6 py-5 text-center">
                      {contract.contractStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}