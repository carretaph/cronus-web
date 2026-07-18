function TestimonialsSection() {
    const testimonials = [
      {
        quote:
          'From the first consultation to the final installation, everything was handled with professionalism and care.',
        name: 'Homeowner',
        location: 'Orlando, Florida',
      },
      {
        quote:
          'The team communicated clearly, respected our home and delivered exactly what they promised.',
        name: 'Homeowner',
        location: 'Charlotte, North Carolina',
      },
      {
        quote:
          'A smooth experience from beginning to end. The quality of service made all the difference.',
        name: 'Homeowner',
        location: 'Charleston, South Carolina',
      },
    ]
  
    return (
      <section className="bg-white px-8 py-36">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-[#B08D57]">
              Client Experience
            </p>
  
            <h2 className="mt-6 text-[46px] font-extralight tracking-[-0.03em] text-[#777777]">
              Service People Remember.
            </h2>
          </div>
  
          <div className="mt-24 grid gap-16 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.location}
                className="border-t border-[#E8E8E8] pt-10"
              >
                <p className="text-[25px] font-extralight leading-[1.6] text-[#777777]">
                  “{testimonial.quote}”
                </p>
  
                <div className="mt-10">
                  <p className="text-[15px] font-medium text-[#888888]">
                    {testimonial.name}
                  </p>
  
                  <p className="mt-2 text-[14px] font-light text-[#A0A0A0]">
                    {testimonial.location}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  }
  
  export default TestimonialsSection