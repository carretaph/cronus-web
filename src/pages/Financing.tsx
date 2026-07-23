import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const ACORN_FINANCE_URL =
  'https://www.acornfinance.com/pre-qualify/?d=RSNIO&utm_medium=web_pre_qual_banner'

const benefits = [
  {
    title: 'Compare Multiple Lenders',
    description:
      'Review financing offers from participating lenders through one convenient process.',
  },
  {
    title: 'Check Your Options',
    description:
      'Explore available offers without an initial impact to your credit score.',
  },
  {
    title: 'Flexible Terms',
    description:
      'Qualified homeowners may receive different payment and term options.',
  },
  {
    title: 'Simple Online Process',
    description:
      'Complete the secure pre-qualification process from your phone or computer.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Enter Your Project Amount',
    description:
      'Use your Cronus estimate or enter the approximate amount you expect to finance.',
  },
  {
    number: '02',
    title: 'Compare Your Offers',
    description:
      'Review available payment options, rates and terms from participating lenders.',
  },
  {
    number: '03',
    title: 'Choose What Works for You',
    description:
      'Select the financing option that best fits your project and monthly budget.',
  },
]

const faqs = [
  {
    question: 'Is Cronus Windows & Doors the lender?',
    answer:
      'No. Cronus Windows & Doors, LLC is not a lender. Financing options are provided by third-party lenders through Acorn Finance.',
  },
  {
    question: 'Will checking my options affect my credit score?',
    answer:
      'Acorn Finance states that checking available offers does not initially affect your credit score. Moving forward with a specific lender may require additional verification or a hard credit inquiry.',
  },
  {
    question: 'Can I finance my complete project?',
    answer:
      'Qualified homeowners may be able to finance all or part of their project. The amount available depends on lender approval and borrower qualifications.',
  },
  {
    question: 'How long does the process take?',
    answer:
      'The initial online process may take only a few minutes. Final approval and funding times vary by lender and may require additional documentation.',
  },
  {
    question: 'Can I pay the loan off early?',
    answer:
      'Some available offers may not include prepayment penalties. Always review the specific lender terms before accepting an offer.',
  },
]

function Financing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#0b192b]">
      <Navbar />

      <main>
        {/* MAIN MESSAGE */}
        <section className="bg-[#071d33] text-white">
          <div className="mx-auto max-w-7xl px-6 pb-20 pt-36 text-center lg:px-10 lg:pb-24 lg:pt-55">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d6a62e]">
              Flexible Financing
            </p>

            <h1 className="mx-auto mt-7 max-w-5xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-8xl">
              Low monthly payments.
              <span className="block text-[#d6a62e]">
                Greater possibilities.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/70">
              Your home improvement project may be more affordable than you
              think. Explore financing options designed to help qualified
              homeowners move forward today.
            </p>
          </div>
        </section>

        {/* IMMEDIATE FINANCING OPTION */}
        <section className="relative bg-[#f5f1e8]">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
            <div className="overflow-hidden bg-white shadow-[0_30px_80px_rgba(7,29,51,0.14)]">
              <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                <div className="p-8 sm:p-12 lg:p-16">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#b17d12]">
                    Financing Through Acorn Finance
                  </p>

                  <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">
                    See what financing options may be available to you.
                  </h2>

                  <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d6978]">
                    Compare personalized offers from multiple lenders through
                    one secure and convenient online process.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {[
                      'Multiple participating lenders',
                      'Secure online application',
                      'Flexible payment options',
                      'Fast pre-qualification process',
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 border-t border-[#0b192b]/10 pt-4"
                      >
                        <span className="text-lg font-bold text-[#d6a62e]">
                          ✓
                        </span>
                        <span className="text-sm font-semibold text-[#263548]">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-center bg-[#0b2742] p-8 text-white sm:p-12 lg:p-14">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d6a62e]">
                    Start Here
                  </p>

                  <h3 className="mt-5 text-3xl font-semibold leading-tight tracking-tight">
                    Check your financing options in minutes.
                  </h3>

                  <p className="mt-5 leading-7 text-white/65">
                    Enter your estimated project amount and review the offers
                    available to you through Acorn Finance.
                  </p>

                  <a
                    href={ACORN_FINANCE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex min-h-16 w-full items-center justify-center bg-[#d6a62e] px-7 text-center text-sm font-bold uppercase tracking-[0.12em] text-[#071d33] transition duration-300 hover:bg-[#e8be51]"
                  >
                    Check My Financing Options
                    <span className="ml-3 text-lg">↗</span>
                  </a>

                  <p className="mt-4 text-center text-xs leading-5 text-white/45">
                    You will be redirected to the secure Acorn Finance website.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECONDARY CTA */}
        <section className="border-y border-[#0b192b]/10 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-7 px-6 py-10 sm:flex-row sm:items-center lg:px-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b17d12]">
                Need a Project Amount?
              </p>

              <p className="mt-2 text-xl font-semibold">
                Start with a free Cronus window and door estimate.
              </p>
            </div>

            <Link
              to="/contact"
              className="inline-flex min-h-13 flex-none items-center justify-center border border-[#071d33] px-7 text-sm font-bold uppercase tracking-[0.1em] transition duration-300 hover:bg-[#071d33] hover:text-white"
            >
              Request a Free Estimate
            </Link>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="bg-[#f5f1e8]">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#b17d12]">
                More Ways to Move Forward
              </p>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                A payment option that fits your plans.
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d6978]">
                Financing can help you complete the project your home needs
                without postponing comfort, protection or curb appeal.
              </p>
            </div>

            <div className="mt-14 grid border-l border-t border-[#0b192b]/10 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <article
                  key={benefit.title}
                  className="border-b border-r border-[#0b192b]/10 bg-white p-8"
                >
                  <div className="h-px w-12 bg-[#d6a62e]" />

                  <h3 className="mt-9 text-xl font-semibold">
                    {benefit.title}
                  </h3>

                  <p className="mt-4 leading-7 text-[#637080]">
                    {benefit.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-[#071d33] text-white">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d6a62e]">
                  Simple Process
                </p>

                <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  Financing in three simple steps.
                </h2>

                <a
                  href={ACORN_FINANCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-9 inline-flex min-h-14 items-center justify-center bg-[#d6a62e] px-8 text-sm font-bold uppercase tracking-[0.1em] text-[#071d33] transition duration-300 hover:bg-white"
                >
                  Get Started
                  <span className="ml-3">↗</span>
                </a>
              </div>

              <div className="border-t border-white/15">
                {steps.map((step) => (
                  <article
                    key={step.number}
                    className="grid gap-5 border-b border-white/15 py-8 sm:grid-cols-[70px_1fr]"
                  >
                    <p className="text-sm font-semibold tracking-[0.2em] text-[#d6a62e]">
                      {step.number}
                    </p>

                    <div>
                      <h3 className="text-2xl font-semibold">{step.title}</h3>

                      <p className="mt-3 max-w-2xl leading-7 text-white/60">
                        {step.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[0.75fr_1.25fr] lg:px-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#b17d12]">
                Frequently Asked Questions
              </p>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Clear answers before you apply.
              </h2>
            </div>

            <div className="border-t border-[#0b192b]/15">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index

                return (
                  <article
                    key={faq.question}
                    className="border-b border-[#0b192b]/15"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-8 py-7 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-xl font-semibold">
                        {faq.question}
                      </span>

                      <span
                        className={`flex h-10 w-10 flex-none items-center justify-center border border-[#0b192b]/20 text-xl transition duration-300 ${
                          isOpen
                            ? 'rotate-45 bg-[#071d33] text-white'
                            : 'bg-transparent'
                        }`}
                      >
                        +
                      </span>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ${
                        isOpen
                          ? 'grid-rows-[1fr] pb-7 opacity-100'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-3xl pr-10 leading-8 text-[#637080]">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-[#d6a62e] text-[#071d33]">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-9 px-6 py-20 lg:flex-row lg:items-center lg:px-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em]">
                Your Home. Your Opportunity.
              </p>

              <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                See what your new windows and doors could look like within your
                budget.
              </h2>
            </div>

            <a
              href={ACORN_FINANCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-16 flex-none items-center justify-center bg-[#071d33] px-9 text-sm font-bold uppercase tracking-[0.1em] text-white transition duration-300 hover:bg-white hover:text-[#071d33]"
            >
              Explore Financing
              <span className="ml-3">↗</span>
            </a>
          </div>
        </section>

        {/* DISCLAIMER */}
        <section className="bg-[#071522] text-white">
          <div className="mx-auto max-w-7xl px-6 py-9 lg:px-10">
            <p className="text-xs leading-6 text-white/45">
              Cronus Windows & Doors, LLC is not a lender and does not make
              credit decisions. Financing options are provided by third-party
              lenders through Acorn Finance. Loan availability, approval,
              interest rates, monthly payments and terms are subject to lender
              requirements and borrower qualifications. Checking available
              offers may not initially affect your credit score; however,
              accepting an offer may require additional verification or a hard
              credit inquiry. Review all lender disclosures and loan terms
              before accepting an offer.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Financing