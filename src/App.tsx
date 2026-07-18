import Navbar from './components/Navbar'
import WhyCronus from './components/WhyCronus'
import houseImage from './assets/modern-house.png'
import WindowsSection from './components/WindowsSection'
import DoorsSection from './components/DoorsSection'
import ProjectsSection from './components/ProjectsSection'
import StatsSection from './components/StatsSection'
import TestimonialsSection from './components/Testimonials'
import CTASection from './components/CTASection'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main id="home" className="min-h-screen px-8 pt-32">
        <section className="mx-auto flex max-w-7xl flex-col items-center pt-24 text-center lg:pt-28">
          <h1
            className="
              text-[48px]
              font-extralight
              leading-none
              tracking-[-0.04em]
              text-[#8A8A8A]
              sm:text-[56px]
              lg:text-[64px]
            "
          >
            Windows & Doors
          </h1>

          <p className="mt-7 text-[22px] font-light tracking-wide text-[#A0A0A0]">
            Premium Service. Exceptional Results.
          </p>

          <a
            href="#contact"
            className="
              mt-9
              inline-flex
              items-center
              justify-center
              rounded-full
              bg-[#7A7A7A]
              px-10
              py-4
              text-[16px]
              font-medium
              !text-white
              transition-colors
              duration-300
              hover:bg-[#686868]
            "
          >
            Request a Consultation
          </a>

          <div className="mt-10 w-full overflow-hidden rounded-[24px]">
            <img
              src={houseImage}
              alt="Luxury modern home featuring expansive windows and doors"
              className="h-[720px] w-full object-cover"
            />
          </div>
        </section>
      </main>

      <WhyCronus />
      <WindowsSection />
      <DoorsSection />
      <ProjectsSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  )
}

export default App