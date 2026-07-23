import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

import crewImage from '../assets/about/crew.png'
import plantImage from '../assets/about/plant.png'

function About() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-[13.75rem] lg:px-10">
            <p className="text-center text-xs font-medium uppercase tracking-[0.32em] text-slate-500 sm:text-sm">
              About Cronus
            </p>

            <h1 className="mx-auto mt-6 max-w-5xl text-center text-4xl font-medium leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
              Built on Experience.
              <span className="block">Driven by Quality.</span>
            </h1>

            <div className="mt-16 grid gap-8 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                <img
                  src={crewImage}
                  alt="Cronus team standing beside a company service van"
                  className="block aspect-[16/10] h-full w-full object-cover"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                <img
                  src={plantImage}
                  alt="Design office overlooking a window production facility"
                  className="block aspect-[16/10] h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-24 text-center lg:px-10">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
              Experience That Matters
            </p>

            <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-[-0.035em] text-slate-950 sm:text-5xl">
              More than 20 years of combined industry experience.
            </h2>

            <div className="mx-auto mt-7 h-px w-10 bg-slate-900" />

            <p className="mx-auto mt-8 max-w-4xl text-lg leading-9 text-slate-600">
              Our team brings more than two decades of experience in
              residential construction, replacement windows, doors and project
              management. Every project is carefully planned and completed
              with attention to detail.
            </p>

            <p className="mx-auto mt-6 max-w-4xl text-lg leading-9 text-slate-600">
              From the first consultation through the final installation, our
              goal is simple: provide dependable workmanship, clear
              communication and results homeowners can feel confident about.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default About