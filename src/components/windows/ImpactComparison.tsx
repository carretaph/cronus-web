export default function ImpactComparison() {
    return (
      <section className="bg-[#737373] px-6 py-28 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#D9C59E]">
              Protection Options
            </p>
  
            <h2 className="mt-6 text-[42px] font-extralight leading-[1.05] tracking-[-0.04em] text-white sm:text-[56px]">
              Impact vs. Standard Windows
            </h2>
  
            <p className="mt-7 text-lg font-light leading-8 text-white/70">
              We help homeowners understand their options and select the right
              level of performance for their property, budget and priorities.
            </p>
          </div>
  
          <div className="mt-16 grid overflow-hidden rounded-[28px] bg-white/10 lg:grid-cols-2">
            <div className="border-b border-white/15 p-9 sm:p-14 lg:border-b-0 lg:border-r">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/60">
                Standard Window
              </p>
  
              <h3 className="mt-5 text-4xl font-extralight">
                Everyday Performance
              </h3>
  
              <div className="mt-10 space-y-6">
                {[
                  'Designed for standard residential applications',
                  'Multiple glass and efficiency options',
                  'Available in a variety of styles',
                  'Professional installation',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex gap-4 border-t border-white/15 pt-5 text-white/75"
                  >
                    <span className="text-[#D9C59E]">—</span>
                    <span className="font-light">{item}</span>
                  </div>
                ))}
              </div>
            </div>
  
            <div className="p-9 sm:p-14">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#D9C59E]">
                Impact Window
              </p>
  
              <h3 className="mt-5 text-4xl font-extralight">
                Enhanced Protection
              </h3>
  
              <div className="mt-10 space-y-6">
                {[
                  'Laminated impact-resistant glass',
                  'Designed for severe weather conditions',
                  'Enhanced security and protection',
                  'No traditional storm shutters required',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex gap-4 border-t border-white/15 pt-5 text-white/75"
                  >
                    <span className="text-[#D9C59E]">—</span>
                    <span className="font-light">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }