import doubleHung from '../../assets/windows/double-hung.png'
import casement from '../../assets/windows/casement.png'
import sliding from '../../assets/windows/sliding.png'
import picture from '../../assets/windows/picture.png'

const windowCollections = [
  {
    title: 'Double Hung',
    description:
      'A timeless design with two operating sashes for flexible ventilation, convenient cleaning and classic architectural appeal.',
    image: doubleHung,
    features: [
      'Two operating sashes',
      'Easy interior cleaning',
      'Flexible ventilation',
    ],
  },
  {
    title: 'Casement',
    description:
      'Clean, contemporary lines combined with expansive glass and excellent ventilation. Casement windows open outward with a smooth crank mechanism.',
    image: casement,
    features: [
      'Expansive glass area',
      'Excellent ventilation',
      'Tight weather seal',
    ],
  },
  {
    title: 'Sliding',
    description:
      'A practical and elegant solution for wide openings. Sliding windows operate horizontally and provide uninterrupted views with simple operation.',
    image: sliding,
    features: [
      'Smooth horizontal operation',
      'Wide viewing area',
      'Low-maintenance design',
    ],
  },
  {
    title: 'Picture Windows',
    description:
      'Designed to frame the outdoors and introduce natural light. Picture windows create dramatic views and a clean architectural statement.',
    image: picture,
    features: [
      'Maximum natural light',
      'Uninterrupted views',
      'Modern architectural style',
    ],
  },
]

export default function WindowCollections() {
  return (
    <>
      <section
        id="collections"
        className="bg-[#F7F7F5] px-6 py-28 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
            Window Collections
          </p>

          <h2 className="mx-auto mt-6 max-w-3xl text-[42px] font-extralight leading-[1.05] tracking-[-0.04em] text-[#7A7A7A] sm:text-[56px]">
            The right window for every room and every view.
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-lg font-light leading-8 text-[#969696]">
            Explore timeless styles, expansive glass and practical designs
            created to elevate the way your home looks and feels.
          </p>
        </div>
      </section>

      <section className="bg-[#F7F7F5] px-6 pb-28 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl space-y-10">
          {windowCollections.map((collection, index) => (
            <article
              key={collection.title}
              className="grid overflow-hidden rounded-[28px] bg-white lg:grid-cols-2"
            >
              <div
                className={`min-h-[430px] overflow-hidden ${
                  index % 2 !== 0 ? 'lg:order-2' : ''
                }`}
              >
                <img
                  src={collection.image}
                  alt={`${collection.title} windows`}
                  className="h-full min-h-[430px] w-full object-cover transition duration-700 hover:scale-[1.02]"
                />
              </div>

              <div
                className={`flex min-h-[430px] flex-col justify-center p-9 sm:p-14 lg:p-16 ${
                  index % 2 !== 0 ? 'lg:order-1' : ''
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#B59A68]">
                  Cronus Window Collection
                </p>

                <h3 className="mt-5 text-[40px] font-extralight tracking-[-0.04em] text-[#747474] sm:text-[48px]">
                  {collection.title}
                </h3>

                <p className="mt-6 max-w-xl text-lg font-light leading-8 text-[#969696]">
                  {collection.description}
                </p>

                <div className="mt-8 space-y-4">
                  {collection.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-4 text-sm font-light text-[#7E7E7E]"
                    >
                      <span className="h-px w-8 bg-[#B59A68]" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="/contact"
                  className="mt-10 inline-flex w-fit items-center gap-3 text-sm font-medium text-[#777777] transition hover:text-[#B59A68]"
                >
                  Request more information
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}