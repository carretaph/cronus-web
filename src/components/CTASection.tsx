import houseImage from '../assets/modern-house.png'

function CTASection() {
  return (
    <section
      id="contact"
      className="relative min-h-[760px] overflow-hidden px-8 py-32"
    >
      <img
        src={houseImage}
        alt="Luxury Florida home"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 mx-auto flex min-h-[500px] max-w-5xl flex-col items-center justify-center text-center">
        <p className="text-[13px] font-medium uppercase tracking-[0.3em] text-[#D6B77A]">
          Begin Your Project
        </p>

        <h2 className="mt-7 max-w-4xl text-[48px] font-extralight leading-[1.08] tracking-[-0.04em] text-white sm:text-[58px] lg:text-[72px]">
          Ready to Transform Your Home?
        </h2>

        <p className="mt-8 max-w-2xl text-[19px] font-light leading-8 text-white/80">
          Premium windows and doors designed for beauty, comfort and lasting
          performance.
        </p>

        <a
          href="mailto:info@cronuswindows.com"
          className="
            mt-10
            inline-flex
            items-center
            justify-center
            rounded-full
            bg-white
            px-10
            py-4
            text-[16px]
            font-medium
            text-[#6F6F6F]
            transition
            duration-300
            hover:scale-[1.03]
            hover:bg-[#F3F3F3]
          "
        >
          Request a Consultation
        </a>
      </div>
    </section>
  )
}

export default CTASection