import modernHouse from '../../assets/modern-house.png'

export default function BuiltForFlorida() {
  return (
    <section className="px-6 py-28 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
        <div className="overflow-hidden rounded-[28px]">
          <img
            src={modernHouse}
            alt="Modern Florida residence"
            className="h-[520px] w-full object-cover lg:h-[650px]"
          />
        </div>

        <div className="lg:pl-12">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
            Built for Florida
          </p>

          <h2 className="mt-6 text-[42px] font-extralight leading-[1.05] tracking-[-0.04em] text-[#777777] sm:text-[56px]">
            Designed for the way Florida lives.
          </h2>

          <p className="mt-7 text-lg font-light leading-8 text-[#969696]">
            Florida homes face intense sunlight, heat, humidity, wind and
            severe weather. Choosing the right window system can improve
            comfort, protection and long-term performance.
          </p>

          <div className="mt-10 grid gap-7 sm:grid-cols-2">
            <div className="border-t border-[#DDDDDD] pt-6">
              <p className="text-xl font-light text-[#757575]">
                Storm Protection
              </p>

              <p className="mt-3 text-sm font-light leading-6 text-[#999999]">
                Impact-rated configurations are available for added protection
                during severe weather.
              </p>
            </div>

            <div className="border-t border-[#DDDDDD] pt-6">
              <p className="text-xl font-light text-[#757575]">
                Solar Performance
              </p>

              <p className="mt-3 text-sm font-light leading-6 text-[#999999]">
                Glass packages can help reduce unwanted solar heat entering your
                home.
              </p>
            </div>

            <div className="border-t border-[#DDDDDD] pt-6">
              <p className="text-xl font-light text-[#757575]">
                Moisture Resistance
              </p>

              <p className="mt-3 text-sm font-light leading-6 text-[#999999]">
                Durable materials and professional installation help withstand
                Florida humidity.
              </p>
            </div>

            <div className="border-t border-[#DDDDDD] pt-6">
              <p className="text-xl font-light text-[#757575]">
                Everyday Comfort
              </p>

              <p className="mt-3 text-sm font-light leading-6 text-[#999999]">
                Better-performing windows help maintain a more consistent indoor
                environment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}