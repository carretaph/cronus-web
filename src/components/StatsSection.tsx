function StatsSection() {
    const stats = [
      {
        value: '25+',
        label: 'Years of Experience',
      },
      {
        value: '5,000+',
        label: 'Projects Completed',
      },
      {
        value: '3',
        label: 'States Served',
      },
      {
        value: '100%',
        label: 'Commitment to Service',
      },
    ]
  
    return (
      <section className="bg-[#F8F8F8] px-8 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-[#B08D57]">
              Experience You Can Trust
            </p>
  
            <h2 className="mt-6 text-[46px] font-extralight tracking-[-0.03em] text-[#777777]">
              Built on Service. Proven by Results.
            </h2>
          </div>
  
          <div className="mt-24 grid gap-14 border-t border-[#E5E5E5] pt-16 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-[58px] font-extralight tracking-[-0.04em] text-[#777777]">
                  {stat.value}
                </p>
  
                <p className="mt-4 text-[16px] font-light text-[#9A9A9A]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  
  export default StatsSection