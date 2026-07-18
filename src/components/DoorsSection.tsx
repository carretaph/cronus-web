import doorHero from '../assets/door-hero.png'

function DoorsSection() {
  return (
    <section id="doors" className="bg-[#F8F8F8] px-8 py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-24 lg:grid-cols-2">
        {/* Left image */}
        <div className="overflow-hidden rounded-[28px]">
          <img
            src={doorHero}
            alt="White vinyl sliding patio door"
            className="h-[700px] w-full object-cover"
          />
        </div>

        {/* Right content */}
        <div>
          <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-[#B08D57]">
            Doors
          </p>

          <h2 className="mt-6 text-[48px] font-extralight leading-tight tracking-[-0.03em] text-[#777777]">
            Designed to Welcome.
            <br />
            Built to Protect.
          </h2>

          <p className="mt-8 max-w-xl text-[19px] font-light leading-9 text-[#9A9A9A]">
            Beautiful doors transform the entrance of a home while providing
            security, energy efficiency and lasting performance. Every
            installation is completed with the same premium service that defines
            Cronus.
          </p>

          <div className="mt-12 space-y-5">
            {[
              'Entry Doors',
              'Sliding Patio Doors',
              'French Doors',
              'Impact Resistant Options',
            ].map((item) => (
              <div key={item} className="flex items-center gap-4">
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
              duration-300
              hover:bg-[#686868]
            "
          >
            Explore Doors
          </a>
        </div>
      </div>
    </section>
  )
}

export default DoorsSection