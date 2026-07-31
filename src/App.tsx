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
import OpeningManager from './pages/OpeningManager'
import Contracts from './pages/Contracts'
import PricingEngine from './pages/PricingEngine'

import ContractCustomer from './pages/contracts/ContractCustomer'
import ContractProject from './pages/contracts/ContractProject'
import ContractProducts from './pages/contracts/ContractProducts'
import ContractPayment from './pages/contracts/ContractPayment'
import ContractSchedule from './pages/contracts/ContractSchedule'
import ContractTerms from './pages/contracts/ContractTerms'
import ContractSignatures from './pages/contracts/ContractSignatures'
import ContractComplete from './pages/contracts/ContractComplete'
import ContractDocument from './pages/contracts/ContractDocument'

import ProtectedRoute from './components/ProtectedRoute'
import PortalLayout from './components/PortalLayout'

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/windows"
        element={<Windows />}
      />

      <Route
        path="/doors"
        element={<Doors />}
      />

      <Route
        path="/projects"
        element={<Projects />}
      />

      <Route
        path="/financing"
        element={<Financing />}
      />

      <Route
        path="/service-areas"
        element={<ServiceAreas />}
      />

      <Route
        path="/about"
        element={<About />}
      />

      <Route
        path="/contact"
        element={<Contact />}
      />

      {/* Login */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Private portal */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        {/* Portal dashboard */}
        <Route
          index
          element={<Portal />}
        />

        {/* Customers */}
        <Route
          path="customers"
          element={<Customers />}
        />

        {/* Quotes */}
        <Route
          path="quotes"
          element={<Quotes />}
        />

        <Route
          path="quotes/new"
          element={<NewQuote />}
        />

        <Route
          path="quotes/new/openings"
          element={<OpeningManager />}
        />

        {/* Contracts */}
        <Route
          path="contracts"
          element={<Contracts />}
        />

        {/* Pricing Engine */}
        <Route
          path="pricing"
          element={<PricingEngine />}
        />

        {/* Contract wizard - Step 1 */}
        <Route
          path="contracts/new"
          element={<ContractCustomer />}
        />

        {/* Contract wizard - Step 2 */}
        <Route
          path="contracts/project"
          element={<ContractProject />}
        />

        {/* Contract wizard - Step 3 */}
        <Route
          path="contracts/products"
          element={<ContractProducts />}
        />

        {/* Contract wizard - Step 4 */}
        <Route
          path="contracts/payment"
          element={<ContractPayment />}
        />

        {/* Contract wizard - Step 5 */}
        <Route
          path="contracts/schedule"
          element={<ContractSchedule />}
        />

        {/* Contract wizard - Step 6 */}
        <Route
          path="contracts/terms"
          element={<ContractTerms />}
        />

        {/* Contract wizard - Step 7 */}
        <Route
          path="contracts/signatures"
          element={<ContractSignatures />}
        />

        {/* Contract wizard - Step 8 */}
        <Route
          path="contracts/complete"
          element={<ContractComplete />}
        />

        <Route
          path="contracts/document"
          element={<ContractDocument />}
        />
      </Route>
    </Routes>
  )
}