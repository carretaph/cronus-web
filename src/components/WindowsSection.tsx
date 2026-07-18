import windowsHero from '../assets/window-hero.png'

function WindowsSection() {
    return (
      <section
        id="windows"
        className="bg-white px-8 py-36"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-24 lg:grid-cols-2">
          {/* Left */}
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-[#B08D57]">
              Windows
            </p>
  
            <h2 className="mt-6 text-[48px] font-extralight leading-tight tracking-[-0.03em] text-[#777777]">
              Beautiful.
              <br />
              Efficient.
              <br />
              Built for Florida.
            </h2>
  
            <p className="mt-8 max-w-xl text-[19px] font-light leading-9 text-[#9A9A9A]">
              Every home deserves windows that combine elegant design,
              energy efficiency and dependable performance.
              We help homeowners choose the right solution for beauty,
              comfort and lasting value.
            </p>
  
            <div className="mt-12 space-y-5">
              {[
                'Vinyl Windows',
                'Impact Windows',
                'Energy Efficient',
                'Custom Sizes',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4"
                >
                  <div className="h-2 w-2 rounded-full bg-[#B08D57]" />
  
                  <span className="text-[18px] font-light text-[#8F8F8F]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
  
            <a
              href="#contact"
              className="
                mt-14
                inline-flex
                rounded-full
                bg-[#7A7A7A]
                px-9
                py-4
                text-[15px]
                font-medium
                text-white
                transition
                hover:bg-[#686868]
              "
            >
              Explore Windows
            </a>
          </div>
  
          {/* Right */}
          <div className="overflow-hidden rounded-[28px]">
  <img
    src={windowsHero}
    alt="White double hung vinyl windows"
    className="h-[700px] w-full object-cover"
  />
</div>
        </div>
      </section>
    )
  }
  
  export default WindowsSection