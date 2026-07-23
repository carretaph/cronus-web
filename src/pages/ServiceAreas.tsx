import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

import centralFloridaMap from '../assets/serviceareas/central-fl-map.png'
import carolinasMap from '../assets/serviceareas/carolinas-map.png'

function ServiceAreas() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navbar />

      <main>
        {/* PAGE TITLE */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 pb-14 pt-[13.75rem] text-center lg:px-10 lg:pb-16">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-slate-500 sm:text-sm">
              Service Areas
            </p>

            <h1 className="mx-auto mt-6 max-w-5xl text-4xl font-medium leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
              Serving Central Florida from coast to coast and the Carolinas.
            </h1>
          </div>
        </section>

        {/* CENTRAL FLORIDA */}
        <section className="bg-white">
          <div className="mx-auto max-w-[1480px] px-4 pb-8 sm:px-6 lg:px-8">
            <div className="grid items-stretch gap-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
              <div className="flex flex-col justify-center py-4 lg:py-12">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-900">
                  Central Florida
                </p>

                <div className="mt-5 h-px w-8 bg-slate-900" />

                <p className="mt-7 max-w-xs text-sm leading-7 text-slate-600">
                  Proudly serving homeowners from Tampa to Melbourne, and from
                  Cocoa Beach to Vero Beach.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                <img
                  src={centralFloridaMap}
                  alt="Cronus Windows and Doors Central Florida service area map"
                  className="block h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* DIVIDER */}
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
          <div className="h-px bg-slate-200" />
        </div>

        {/* THE CAROLINAS */}
        <section className="bg-white">
          <div className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid items-stretch gap-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
              <div className="flex flex-col justify-center py-4 lg:py-12">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-900">
                  The Carolinas
                </p>

                <div className="mt-5 h-px w-8 bg-slate-900" />

                <p className="mt-7 max-w-xs text-sm leading-7 text-slate-600">
                  Proudly serving homeowners across North Carolina and South
                  Carolina.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                <img
                  src={carolinasMap}
                  alt="Cronus Windows and Doors North Carolina and South Carolina service area map"
                  className="block h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className="bg-white">
          <div className="mx-auto max-w-[1480px] px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-24">
            <div className="flex flex-col justify-between gap-8 rounded-2xl border border-slate-200 bg-slate-50 px-7 py-10 sm:px-10 lg:flex-row lg:items-center lg:px-14 lg:py-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Let&apos;s Talk
                </p>

                <h2 className="mt-4 text-3xl font-medium leading-tight tracking-[-0.035em] text-slate-950 sm:text-4xl">
                  Let&apos;s talk about your project.
                </h2>

                <div className="mt-5 h-px w-8 bg-slate-900" />

                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                  Tell us where your home is located and we&apos;ll confirm
                  service availability for your area.
                </p>
              </div>

              <Link
                to="/contact"
                className="inline-flex min-h-14 flex-none items-center justify-center rounded-full bg-[#0b1f3a] px-9 text-sm font-semibold uppercase tracking-[0.14em] !text-white transition duration-300 hover:bg-[#16345d] hover:!text-white"
              >
                <span className="text-white">Contact Us</span>

                <span
                  className="ml-5 text-lg text-white"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ServiceAreas