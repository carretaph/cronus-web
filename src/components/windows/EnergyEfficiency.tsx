type Feature = {
    title: string
    text: string
  }
  
  const efficiencyFeatures: Feature[] = [
    {
      title: 'Low-E Glass',
      text: 'Specialized glass coatings help reflect solar heat while allowing natural light into your home.',
    },
    {
      title: 'Insulated Glass',
      text: 'Multiple panes and insulated spaces help reduce heat transfer and improve interior comfort.',
    },
    {
      title: 'Weather Protection',
      text: 'Precision seals help limit drafts, moisture intrusion and air leakage around the window system.',
    },
  ]
  
  export default function EnergyEfficiency() {
    return (
      <section className="px-6 py-28 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
                Energy Efficiency
              </p>
  
              <h2 className="mt-6 text-[42px] font-extralight leading-[1.05] tracking-[-0.04em] text-[#777777] sm:text-[56px]">
                More comfort. Less heat transfer.
              </h2>
  
              <p className="mt-7 max-w-lg text-lg font-light leading-8 text-[#969696]">
                The right combination of glass, frame construction and
                installation can help create a quieter, more comfortable and more
                efficient home.
              </p>
            </div>
  
            <div className="grid gap-5 sm:grid-cols-3">
              {efficiencyFeatures.map((feature, index) => (
                <article
                  key={feature.title}
                  className="flex min-h-[350px] flex-col rounded-[24px] bg-[#F6F6F4] p-8"
                >
                  <span className="text-xs font-medium tracking-[0.2em] text-[#B59A68]">
                    0{index + 1}
                  </span>
  
                  <div className="mt-auto">
                    <h3 className="text-2xl font-light tracking-[-0.02em] text-[#747474]">
                      {feature.title}
                    </h3>
  
                    <p className="mt-5 text-sm font-light leading-7 text-[#969696]">
                      {feature.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }