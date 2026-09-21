import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import contactImage from '../assets/contact/contact.png'

export default function Contact() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    interested: '',
    frameMaterial: '',
    glassType: '',
    windowCount: '',
    construction: '',
    yearBuilt: '',
    propertyType: '',
    buyingStage: '',
    preferredContact: '',
    bestTime: '',
    projectDetails: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-36">

        {/* HERO */}

        <section className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">

          <div>

            <p className="uppercase tracking-[0.35em] text-[#B08A47] text-sm font-semibold">
              CONTACT US
            </p>

            <h1 className="mt-5 text-5xl md:text-6xl font-extralight tracking-[-0.04em] text-[#1A1A1A]">
              Request Your
              <br />
              Free Estimate
            </h1>

            <p className="mt-8 text-lg leading-8 text-gray-600 max-w-xl">
              Whether you're replacing a single window or planning a complete
              home renovation, we're here to help. The more information you
              provide, the better prepared our specialists will be before your
              appointment.
            </p>

          </div>

          <div>
            <img
              src={contactImage}
              alt="Story Windows & Doors Customer Service"
              className="rounded-3xl shadow-2xl"
            />
          </div>

        </section>

        {/* FORM */}

        <section className="max-w-6xl mx-auto mt-24 px-6 lg:px-10">

          <div className="bg-[#FAFAFA] rounded-3xl shadow-xl p-10 md:p-14">

            <form className="space-y-12">

              {/* CONTACT */}

              <div>

                <h2 className="text-3xl font-light mb-8">
                  Contact Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">

                  <input
                    name="firstName"
                    placeholder="First Name *"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  />

                  <input
                    name="lastName"
                    placeholder="Last Name *"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  />

                  <input
                    name="email"
                    placeholder="Email *"
                    type="email"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  />

                  <input
                    name="phone"
                    placeholder="Phone Number *"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  />

                  <input
                    name="address"
                    placeholder="Property Address"
                    onChange={handleChange}
                    className="border rounded-xl p-4 md:col-span-2"
                  />

                  <input
                    name="city"
                    placeholder="City"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  />

                  <input
                    name="state"
                    placeholder="State"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  />

                  <input
                    name="zip"
                    placeholder="ZIP Code"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  />

                </div>

              </div>

              {/* PROJECT */}

              <div>

                <h2 className="text-3xl font-light mb-8">
                  Project Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">

                  <select
                    name="interested"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  >
                    <option value="">Interested In</option>
                    <option>Windows</option>
                    <option>Doors</option>
                    <option>Windows & Doors</option>
                  </select>

                  <select
                    name="buyingStage"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  >
                    <option value="">Buying Stage</option>
                    <option>Just Researching</option>
                    <option>Comparing Companies</option>
                    <option>Ready for a Quote</option>
                    <option>Ready to Buy</option>
                  </select>

                  <select
                    name="frameMaterial"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  >
                    <option value="">Current Window Material</option>
                    <option>Vinyl</option>
                    <option>Aluminum</option>
                    <option>Wood</option>
                    <option>Fiberglass</option>
                    <option>Not Sure</option>
                  </select>

                  <select
                    name="glassType"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  >
                    <option value="">Glass Type</option>
                    <option>Single Pane</option>
                    <option>Double Pane</option>
                    <option>Impact</option>
                    <option>Not Sure</option>
                  </select>

                  <select
                    name="construction"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  >
                    <option value="">Home Construction</option>
                    <option>Concrete Block</option>
                    <option>Wood Frame</option>
                    <option>Brick</option>
                    <option>Stucco</option>
                    <option>Siding</option>
                    <option>Not Sure</option>
                  </select>

                  <input
                    name="yearBuilt"
                    placeholder="Year Built"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  />

                  <input
                    name="windowCount"
                    placeholder="Approximate Number of Windows"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  />

                  <select
                    name="propertyType"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  >
                    <option value="">Property Type</option>
                    <option>Single Family</option>
                    <option>Townhome</option>
                    <option>Condo</option>
                    <option>Other</option>
                  </select>

                  <select
                    name="preferredContact"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  >
                    <option value="">Preferred Contact</option>
                    <option>Phone Call</option>
                    <option>Text Message</option>
                    <option>Email</option>
                  </select>

                  <select
                    name="bestTime"
                    onChange={handleChange}
                    className="border rounded-xl p-4"
                  >
                    <option value="">Best Time</option>
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                    <option>Anytime</option>
                  </select>

                </div>

              </div>

              {/* NEEDS */}

              <div>

                <h2 className="text-3xl font-light mb-8">
                  What Are You Looking For?
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">

                  {[
                    'Energy Efficiency',
                    'Impact Protection',
                    'Broken Glass',
                    'Water Leaks',
                    'Air Drafts',
                    'Reduce Noise',
                    'Better Appearance',
                    'Easier Operation',
                    'Better Security',
                    'Insurance Requirements',
                    'Preparing to Sell',
                    'Other',
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-3">
                      <input type="checkbox" />
                      {item}
                    </label>
                  ))}

                </div>

              </div>

              {/* MESSAGE */}

              <div>

                <h2 className="text-3xl font-light mb-8">
                  Tell Us About Your Project
                </h2>

                <textarea
                  name="projectDetails"
                  rows={7}
                  onChange={handleChange}
                  placeholder="Describe your project..."
                  className="w-full border rounded-xl p-5"
                />

              </div>

              {/* BUTTON */}

              <div className="text-center">

                <button
                  type="submit"
                  className="bg-[#B08A47] hover:bg-[#9B783D] transition text-white px-12 py-5 rounded-full text-lg font-medium shadow-lg"
                >
                  Request My Free Estimate
                </button>

              </div>

            </form>

          </div>

        </section>

      </main>

      <Footer />
    </div>
  )
}