import windowHero from '../../assets/window-hero.png'

export default function WindowsHero() {
  return (
    <section className="px-6 pb-24 pt-54 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
            Premium Window Solutions
          </p>

          <h1 className="mt-6 text-[48px] font-extralight leading-[0.95] tracking-[-0.05em] text-[#777777] sm:text-[64px] lg:text-[82px]">
            Windows That
            <span className="block">Transform Your Home</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg font-light leading-8 text-[#929292] sm:text-xl">
            Beautiful, energy-efficient windows designed for Florida living and
            installed with exceptional attention to detail.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/contact"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#777777] px-8 py-4 text-sm font-medium !text-white transition hover:bg-[#626262]"
            >
              Request a Free Consultation
            </a>

            <a
              href="#collections"
              className="inline-flex min-w-[190px] items-center justify-center rounded-full border border-[#D7D7D7] px-8 py-4 text-sm font-medium text-[#777777] transition hover:border-[#B59A68] hover:text-[#B59A68]"
            >
              Explore Collections
            </a>
          </div>
        </div>

        <div className="mt-16 overflow-hidden rounded-[28px]">
          <img
            src={windowHero}
            alt="Modern Florida home with premium windows"
            className="h-[520px] w-full object-cover sm:h-[650px] lg:h-[760px]"
          />
        </div>
      </div>
    </section>
  )
}