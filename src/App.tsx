import { Route, Routes } from 'react-router-dom'

import Home from './pages/Home'
import Windows from './pages/Windows'
import Doors from './pages/Doors'
import Projects from './pages/Projects'
import Financing from './pages/Financing'
import ServiceAreas from './pages/ServiceAreas'
import Contact from './pages/Contact'
import About from './pages/About'

import Login from './pages/Login'
import Portal from './pages/Portal'
import Customers from './pages/Customers'
import Quotes from './pages/Quotes'
import NewQuote from './pages/NewQuote'

import ProtectedRoute from './components/ProtectedRoute'
import PortalLayout from './components/PortalLayout'
import OpeningManager from './pages/OpeningManager'
import NewContract from './pages/NewContract'
import Contracts from './pages/Contracts'
import ContractCustomer from './pages/contracts/ContractCustomer'
import ContractProject from './pages/contracts/ContractProject'
import ContractProducts from './pages/contracts/ContractProducts'
import ContractPayment from './pages/contracts/ContractPayment'
import ContractSchedule from './pages/contracts/ContractSchedule'
import ContractTerms from './pages/contracts/ContractTerms'
import ContractSignatures from './pages/contracts/ContractSignatures'
import ContractComplete from './pages/contracts/ContractComplete'

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route path="/" element={<Home />} />
      <Route path="/windows" element={<Windows />} />
      <Route path="/doors" element={<Doors />} />
      <Route path="/projects" element={<Projects />} />
      <Route
        path="/financing"
        element={<Financing />}
      />
      <Route
        path="/service-areas"
        element={<ServiceAreas />}
      />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Private portal */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Portal />} />

        <Route
          path="customers"
          element={<Customers />}
        />

        <Route
          path="quotes"
          element={<Quotes />}
        />

        <Route
          path="contracts"
          element={<Contracts />}
        />

        <Route
          path="contracts/project"
          element={<ContractProject />}
        />

        <Route
          path="contracts/products"
          element={<ContractProducts />}
        />

        <Route
          path="contracts/payment"
          element={<ContractPayment />}
        />

        <Route
          path="contracts/schedule"
          element={<ContractSchedule />}
        />

        <Route
          path="contracts/terms"
          element={<ContractTerms />}
        />

        <Route
          path="contracts/complete"
          element={<ContractComplete />}
        />

        <Route
          path="contracts/signatures"
          element={<ContractSignatures />}
        />

        <Route
          path="quotes/new"
          element={<NewQuote />}
        />

        <Route
          path="contracts/new"
          element={<ContractCustomer />}
        />

        <Route
          path="quotes/new/openings"
          element={<OpeningManager />}
        />
      </Route>
    </Routes>
  )
}