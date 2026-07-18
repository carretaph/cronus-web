function WhyCronus() {
    const features = [
      {
        number: '01',
        title: 'Premium Service',
        description:
          'From your first consultation to the final installation, every detail is handled with care, clarity and precision.',
      },
      {
        number: '02',
        title: 'Expert Installation',
        description:
          'Professional installation focused on quality workmanship, clean execution and dependable results.',
      },
      {
        number: '03',
        title: 'Built to Last',
        description:
          'Quality windows and doors selected and installed to perform beautifully for years to come.',
      },
    ]
  
    return (
      <section className="bg-white px-8 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-[#B08D57]">
              The Cronus Experience
            </p>
  
            <h2 className="mt-6 text-[40px] font-extralight tracking-[-0.03em] text-[#7A7A7A] sm:text-[48px]">
              Service Without Compromise
            </h2>
  
            <p className="mt-6 text-[19px] font-light leading-8 text-[#A0A0A0]">
              A refined process, professional installation and personal attention
              from beginning to end.
            </p>
          </div>
  
          <div className="mt-24 grid gap-16 border-t border-[#ECECEC] pt-16 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.number}>
                <p className="text-[13px] font-medium tracking-[0.2em] text-[#B08D57]">
                  {feature.number}
                </p>
  
                <h3 className="mt-8 text-[25px] font-light text-[#777777]">
                  {feature.title}
                </h3>
  
                <p className="mt-5 max-w-sm text-[16px] font-light leading-7 text-[#9A9A9A]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  }
  
  export default WhyCronus