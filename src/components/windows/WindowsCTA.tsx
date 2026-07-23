import projectOne from '../../assets/project-01.png'

export default function WindowsCTA() {
  return (
    <section className="px-6 pb-28 sm:px-8 lg:px-12">
      <div className="relative mx-auto min-h-[620px] max-w-7xl overflow-hidden rounded-[30px]">
        <img
          src={projectOne}
          alt="Home featuring premium replacement windows"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/45" />

        <div className="relative flex min-h-[620px] items-center justify-center px-6 py-20 text-center">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#E2CFA8]">
              Start Your Project
            </p>

            <h2 className="mt-6 text-[44px] font-extralight leading-[1.05] tracking-[-0.04em] text-white sm:text-[60px]">
              Discover what new windows can do for your home.
            </h2>

            <p className="mx-auto mt-7 max-w-xl text-lg font-light leading-8 text-white/75">
              Schedule a consultation and let our team help you explore the
              right style, performance and protection options.
            </p>

            <a
              href="/contact"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-sm font-medium !text-[#747474] transition hover:bg-[#F0F0F0]"
            >
              Request a Free Consultation
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}