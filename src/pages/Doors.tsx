import { Link } from 'react-router-dom'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

import entryDoorImage from '../assets/doors/fed.png'
import frenchDoorImage from '../assets/doors/french-door.png'
import sliderDoorImage from '../assets/doors/slider-door.png'
import impactSliderImage from '../assets/doors/slider-door-impact.png'

const benefits = [
  {
    title: 'Energy Efficiency',
    text: 'Insulated frames, high-performance glass and professional installation help reduce heat transfer and improve indoor comfort.',
  },
  {
    title: 'Storm Protection',
    text: 'Impact-rated options help protect your home from windborne debris, severe weather and Florida hurricane conditions.',
  },
  {
    title: 'Enhanced Security',
    text: 'Durable construction, reinforced frames and advanced locking systems provide greater peace of mind.',
  },
  {
    title: 'Professional Installation',
    text: 'Every opening is carefully measured, prepared and installed for dependable performance and a refined finish.',
  },
]

const entryDoorOptions = [
  'Contemporary and traditional designs',
  'Fiberglass and steel door systems',
  'Decorative and privacy glass',
  'Single and double-door configurations',
  'Custom colors and finishes',
  'Impact and non-impact options',
]

const frenchDoorOptions = [
  'White vinyl construction',
  'Single or double operating panels',
  'Clear and decorative glass options',
  'Interior and exterior configurations',
  'Energy-efficient glass packages',
  'Impact-rated options available',
]

const sliderDoorOptions = [
  'White vinyl frames',
  'Two, three and four-panel systems',
  'Smooth and quiet operation',
  'Large glass areas and expansive views',
  'Energy-efficient glass options',
  'Impact and non-impact configurations',
]

export default function Doors() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        {/* HERO */}

        <section className="px-6 pb-24 pt-44 sm:px-8 lg:px-12 lg:pt-52">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-5xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B08A47]">
                Premium Door Solutions
              </p>

              <h1 className="mt-6 text-[48px] font-extralight leading-[0.96] tracking-[-0.05em] text-[#777777] sm:text-[64px] lg:text-[82px]">
                Doors That Welcome,
                <span className="block">Protect and Inspire</span>
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-lg font-light leading-8 text-[#929292] sm:text-xl">
                Beautiful entry, French and sliding doors selected for your
                home’s architecture, performance needs and Florida lifestyle.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/contact"
                  className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#777777] px-8 py-4 text-sm font-medium !text-white transition duration-300 hover:bg-[#626262]"
                >
                  Request a Free Estimate
                </Link>

                <a
                  href="#door-collections"
                  className="inline-flex min-w-[200px] items-center justify-center rounded-full border border-[#D7D7D7] px-8 py-4 text-sm font-medium !text-[#777777] transition duration-300 hover:border-[#B08A47] hover:!text-[#B08A47]"
                >
                  Explore Our Doors
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ENTRY DOORS */}

        <section
          id="door-collections"
          className="border-t border-[#EEEEEE] px-6 py-28 sm:px-8 lg:px-12"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div className="overflow-hidden rounded-[30px]">
                <img
                  src={entryDoorImage}
                  alt="Modern premium front entry door"
                  className="h-[520px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[650px]"
                />
              </div>

              <div className="lg:pl-8">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B08A47]">
                  Front Entry Systems
                </p>

                <h2 className="mt-6 text-[42px] font-extralight leading-[1.02] tracking-[-0.045em] text-[#777777] sm:text-[56px]">
                  Premium
                  <span className="block">Entry Doors</span>
                </h2>

                <p className="mt-7 text-lg font-light leading-8 text-[#919191]">
                  Your front door is one of the most important architectural
                  features of your home. It creates the first impression,
                  contributes to security and helps define your home’s
                  personality.
                </p>

                <p className="mt-5 text-lg font-light leading-8 text-[#919191]">
                  Cronus offers elegant entry systems designed to combine
                  exceptional curb appeal, durability, energy efficiency and
                  dependable performance.
                </p>

                <div className="mt-9 grid gap-0">
                  {entryDoorOptions.map((option) => (
                    <div
                      key={option}
                      className="flex items-center gap-4 border-b border-[#E1E1E1] py-4 first:border-t"
                    >
                      <span className="text-sm text-[#B08A47]">—</span>
                      <p className="text-base font-light text-[#858585]">
                        {option}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  to="/contact"
                  className="mt-10 inline-flex items-center gap-3 border-b border-[#B08A47] pb-2 text-sm font-medium tracking-wide !text-[#777777] transition duration-300 hover:gap-5 hover:!text-[#B08A47]"
                >
                  Explore Entry Door Options
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FRENCH DOORS */}

        <section className="bg-[#F8F8F7] px-6 py-28 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div className="order-2 lg:order-1 lg:pr-8">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B08A47]">
                  Timeless Patio Design
                </p>

                <h2 className="mt-6 text-[42px] font-extralight leading-[1.02] tracking-[-0.045em] text-[#777777] sm:text-[56px]">
                  White Vinyl
                  <span className="block">French Doors</span>
                </h2>

                <p className="mt-7 text-lg font-light leading-8 text-[#919191]">
                  French doors bring classic architectural character, abundant
                  natural light and an elegant connection between your indoor
                  and outdoor living spaces.
                </p>

                <p className="mt-5 text-lg font-light leading-8 text-[#919191]">
                  Our white vinyl French door systems offer a clean appearance,
                  low maintenance and dependable energy-efficient performance.
                </p>

                <div className="mt-9 grid gap-0">
                  {frenchDoorOptions.map((option) => (
                    <div
                      key={option}
                      className="flex items-center gap-4 border-b border-[#DDDDDD] py-4 first:border-t"
                    >
                      <span className="text-sm text-[#B08A47]">—</span>
                      <p className="text-base font-light text-[#858585]">
                        {option}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  to="/contact"
                  className="mt-10 inline-flex items-center gap-3 border-b border-[#B08A47] pb-2 text-sm font-medium tracking-wide !text-[#777777] transition duration-300 hover:gap-5 hover:!text-[#B08A47]"
                >
                  Discuss French Door Options
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="order-1 overflow-hidden rounded-[30px] lg:order-2">
                <img
                  src={frenchDoorImage}
                  alt="White vinyl French patio doors"
                  className="h-[520px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[650px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SLIDING DOORS */}

        <section className="px-6 py-28 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div className="overflow-hidden rounded-[30px]">
                <img
                  src={sliderDoorImage}
                  alt="White vinyl sliding glass patio door"
                  className="h-[520px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[650px]"
                />
              </div>

              <div className="lg:pl-8">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B08A47]">
                  Indoor-Outdoor Living
                </p>

                <h2 className="mt-6 text-[42px] font-extralight leading-[1.02] tracking-[-0.045em] text-[#777777] sm:text-[56px]">
                  White Vinyl
                  <span className="block">Sliding Glass Doors</span>
                </h2>

                <p className="mt-7 text-lg font-light leading-8 text-[#919191]">
                  Sliding glass doors create expansive views, bring more
                  natural light into your home and provide effortless access to
                  patios, pools and outdoor entertainment areas.
                </p>

                <p className="mt-5 text-lg font-light leading-8 text-[#919191]">
                  Our white vinyl sliding systems are designed for smooth
                  operation, low maintenance and excellent energy efficiency.
                </p>

                <div className="mt-9 grid gap-0">
                  {sliderDoorOptions.map((option) => (
                    <div
                      key={option}
                      className="flex items-center gap-4 border-b border-[#E1E1E1] py-4 first:border-t"
                    >
                      <span className="text-sm text-[#B08A47]">—</span>
                      <p className="text-base font-light text-[#858585]">
                        {option}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  to="/contact"
                  className="mt-10 inline-flex items-center gap-3 border-b border-[#B08A47] pb-2 text-sm font-medium tracking-wide !text-[#777777] transition duration-300 hover:gap-5 hover:!text-[#B08A47]"
                >
                  Explore Sliding Door Options
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* IMPACT SLIDER */}

        <section className="bg-[#6F6F6F] px-6 py-28 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#DCC499]">
                  Built for Florida Weather
                </p>

                <h2 className="mt-6 text-[42px] font-extralight leading-[1.02] tracking-[-0.045em] text-white sm:text-[56px]">
                  Impact Sliding
                  <span className="block">Glass Doors</span>
                </h2>

                <p className="mt-7 text-lg font-light leading-8 text-[#E7E7E7]">
                  Impact-rated sliding doors combine the beauty of expansive
                  glass with protection engineered for severe Florida weather.
                </p>

                <p className="mt-5 text-lg font-light leading-8 text-[#E7E7E7]">
                  Laminated impact glass and reinforced frames help resist
                  windborne debris while improving security, noise reduction
                  and everyday comfort.
                </p>

                <div className="mt-9 grid gap-0">
                  {[
                    'Impact-resistant laminated glass',
                    'Reinforced vinyl frames',
                    'Protection from windborne debris',
                    'No separate storm panels required',
                    'Improved security and noise reduction',
                    'Energy-efficient glass packages',
                  ].map((option) => (
                    <div
                      key={option}
                      className="flex items-center gap-4 border-b border-[#8D8D8D] py-4 first:border-t"
                    >
                      <span className="text-sm text-[#DCC499]">—</span>
                      <p className="text-base font-light text-[#EFEFEF]">
                        {option}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  to="/contact"
                  className="mt-10 inline-flex items-center gap-3 border-b border-[#DCC499] pb-2 text-sm font-medium tracking-wide !text-white transition duration-300 hover:gap-5"
                >
                  Request Impact Door Information
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="overflow-hidden rounded-[30px]">
                <img
                  src={impactSliderImage}
                  alt="Impact-rated sliding glass doors during severe weather"
                  className="h-[520px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[650px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}

        <section className="px-6 py-28 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B08A47]">
                  Designed to Perform
                </p>

                <h2 className="mt-6 max-w-lg text-[42px] font-extralight leading-[1.04] tracking-[-0.045em] text-[#777777] sm:text-[54px]">
                  Beauty, comfort and protection in every opening.
                </h2>

                <p className="mt-7 max-w-lg text-lg font-light leading-8 text-[#969696]">
                  The right door should enhance your home while performing
                  reliably through heat, humidity, rain and hurricane season.
                </p>
              </div>

              <div className="grid gap-9 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <article
                    key={benefit.title}
                    className="border-t border-[#DCDCDC] pt-7"
                  >
                    <h3 className="text-2xl font-light tracking-[-0.02em] text-[#747474]">
                      {benefit.title}
                    </h3>

                    <p className="mt-4 text-base font-light leading-7 text-[#979797]">
                      {benefit.text}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS */}

        <section className="border-t border-[#EEEEEE] bg-[#F8F8F7] px-6 py-28 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B08A47]">
                Our Process
              </p>

              <h2 className="mt-6 text-[42px] font-extralight leading-[1.04] tracking-[-0.045em] text-[#777777] sm:text-[54px]">
                A thoughtful experience from consultation to installation.
              </h2>
            </div>

            <div className="mt-16 grid gap-10 md:grid-cols-3">
              <article className="border-t border-[#D5D5D5] pt-8">
                <span className="text-xs font-medium tracking-[0.22em] text-[#B08A47]">
                  STEP 01
                </span>

                <h3 className="mt-8 text-2xl font-light text-[#747474]">
                  In-Home Consultation
                </h3>

                <p className="mt-5 text-base font-light leading-7 text-[#969696]">
                  We inspect your existing openings and review your style,
                  functionality, security and performance goals.
                </p>
              </article>

              <article className="border-t border-[#D5D5D5] pt-8">
                <span className="text-xs font-medium tracking-[0.22em] text-[#B08A47]">
                  STEP 02
                </span>

                <h3 className="mt-8 text-2xl font-light text-[#747474]">
                  Product Selection
                </h3>

                <p className="mt-5 text-base font-light leading-7 text-[#969696]">
                  Together, we select the door style, frame, glass, finish,
                  hardware and protection level that fit your home.
                </p>
              </article>

              <article className="border-t border-[#D5D5D5] pt-8">
                <span className="text-xs font-medium tracking-[0.22em] text-[#B08A47]">
                  STEP 03
                </span>

                <h3 className="mt-8 text-2xl font-light text-[#747474]">
                  Professional Installation
                </h3>

                <p className="mt-5 text-base font-light leading-7 text-[#969696]">
                  Our team completes the installation with precise workmanship,
                  careful protection and thorough cleanup.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}

        <section className="px-6 py-28 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-[#F3F1ED] px-8 py-20 text-center sm:px-12 lg:py-28">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B08A47]">
              Begin Your Project
            </p>

            <h2 className="mx-auto mt-6 max-w-4xl text-[42px] font-extralight leading-[1.02] tracking-[-0.045em] text-[#777777] sm:text-[58px]">
              Find the right doors for your home.
            </h2>

            <p className="mx-auto mt-7 max-w-2xl text-lg font-light leading-8 text-[#929292]">
              Schedule a complimentary consultation and discover entry, French
              and sliding door options designed around your home.
            </p>

            <Link
              to="/contact"
              className="mt-10 inline-flex min-w-[230px] items-center justify-center rounded-full bg-[#777777] px-8 py-4 text-sm font-medium !text-white transition duration-300 hover:bg-[#626262]"
            >
              Get Your Free Estimate
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}