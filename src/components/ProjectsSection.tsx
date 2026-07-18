import project1 from '../assets/project-01.png'
import project2 from '../assets/project-02.png'
import project3 from '../assets/project-03.png'

function ProjectsSection() {
  return (
    <section id="projects" className="bg-white px-8 py-36">
      <div className="mx-auto max-w-7xl">

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] font-medium uppercase tracking-[0.28em] text-[#B08D57]">
            Featured Projects
          </p>

          <h2 className="mt-6 text-[48px] font-extralight tracking-[-0.03em] text-[#777777]">
            Work Designed to Transform.
          </h2>

          <p className="mt-7 text-[19px] font-light leading-9 text-[#9A9A9A]">
            Every project reflects our commitment to premium service,
            craftsmanship and lasting quality.
          </p>
        </div>

        {/* Featured Project */}

        <div className="mt-20 overflow-hidden rounded-[30px]">

          <img
            src={project1}
            alt="Featured Project"
            className="h-[720px] w-full object-cover transition duration-500 hover:scale-[1.02]"
          />

        </div>

        <div className="mt-8 flex items-center justify-between">

          <div>

            <h3 className="text-[34px] font-light text-[#777777]">
              Modern Window Transformation
            </h3>

            <p className="mt-2 text-[17px] text-[#A0A0A0]">
              Orlando, Florida
            </p>

          </div>

          <a
            href="#contact"
            className="
              rounded-full
              bg-[#7A7A7A]
              px-8
              py-4
              text-white
              transition
              hover:bg-[#686868]
            "
          >
            View Project
          </a>

        </div>

        {/* Bottom Grid */}

        <div className="mt-20 grid gap-10 lg:grid-cols-2">

          <div>

            <img
              src={project2}
              alt="Project 2"
              className="h-[420px] w-full rounded-[26px] object-cover transition duration-500 hover:scale-[1.02]"
            />

            <h3 className="mt-8 text-[28px] font-light text-[#777777]">
              Vinyl Window Upgrade
            </h3>

            <p className="mt-2 text-[#A0A0A0]">
              Jacksonville, Florida
            </p>

          </div>

          <div>

            <img
              src={project3}
              alt="Project 3"
              className="h-[420px] w-full rounded-[26px] object-cover transition duration-500 hover:scale-[1.02]"
            />

            <h3 className="mt-8 text-[28px] font-light text-[#777777]">
              Patio Door Renovation
            </h3>

            <p className="mt-2 text-[#A0A0A0]">
              Tampa, Florida
            </p>

          </div>

        </div>

      </div>
    </section>
  )
}

export default ProjectsSection