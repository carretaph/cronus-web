import { useState } from 'react'
import { Link } from 'react-router-dom'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

type ProjectCategory = 'All' | 'Windows' | 'Doors'

type Project = {
  id: number
  title: string
  location: string
  category: Exclude<ProjectCategory, 'All'>
  description: string
  image: string
  featured?: boolean
}

const projects: Project[] = [
  {
    id: 1,
    title: 'Modern Impact Window Transformation',
    location: 'Winter Park, Florida',
    category: 'Windows',
    description:
      'A complete replacement project combining clean architectural lines, impact protection and improved energy efficiency.',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85',
    featured: true,
  },
  {
    id: 2,
    title: 'Contemporary Entry Door',
    location: 'Lake Nona, Florida',
    category: 'Doors',
    description:
      'A bold entry-door upgrade designed to improve curb appeal, security and the overall character of the home.',
    image:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 3,
    title: 'Whole-Home Window Replacement',
    location: 'Windermere, Florida',
    category: 'Windows',
    description:
      'High-performance windows selected to increase natural light while helping the home remain comfortable throughout the year.',
    image:
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 4,
    title: 'Indoor–Outdoor Living Upgrade',
    location: 'Dr. Phillips, Florida',
    category: 'Doors',
    description:
      'A large sliding-door system that creates a seamless connection between the interior living area and the pool deck.',
    image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 5,
    title: 'Elegant Black-Framed Windows',
    location: 'Maitland, Florida',
    category: 'Windows',
    description:
      'Dark exterior frames provide modern contrast while maintaining a bright and refined interior appearance.',
    image:
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 6,
    title: 'French Door Installation',
    location: 'Celebration, Florida',
    category: 'Doors',
    description:
      'Traditional French doors paired with expansive glass to bring more light and timeless style into the home.',
    image:
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1400&q=85',
  },
]

const projectStats = [
  {
    value: 'Premium',
    label: 'Materials and finishes',
  },
  {
    value: 'Florida',
    label: 'Focused performance',
  },
  {
    value: 'Detailed',
    label: 'Professional installation',
  },
  {
    value: 'Personal',
    label: 'Project guidance',
  },
]

export default function Projects() {
  const [activeCategory, setActiveCategory] =
    useState<ProjectCategory>('All')

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter((project) => project.category === activeCategory)

  const featuredProject = projects.find((project) => project.featured)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="px-6 pb-24 pt-52 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
                  Selected Projects
                </p>

                <h1 className="mt-6 max-w-4xl text-[50px] font-extralight leading-[0.96] tracking-[-0.05em] text-[#777777] sm:text-[68px] lg:text-[84px]">
                  Beautiful upgrades,
                  <span className="block">thoughtfully completed.</span>
                </h1>
              </div>

              <div className="lg:pb-3">
                <p className="max-w-xl text-lg font-light leading-8 text-[#929292] sm:text-xl">
                  Explore window and door transformations designed to improve
                  comfort, protection, efficiency and curb appeal across
                  Central Florida.
                </p>

                <Link
                  to="/contact"
                  className="mt-9 inline-flex items-center gap-3 border-b border-[#B59A68] pb-2 text-sm font-medium tracking-wide !text-[#777777] transition duration-300 hover:gap-5 hover:!text-[#B59A68]"
                >
                  Start Your Project
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PROJECT */}
        {featuredProject && (
          <section className="px-6 pb-28 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-[#F6F5F2]">
              <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
                <div className="min-h-[460px] overflow-hidden sm:min-h-[600px] lg:min-h-[720px]">
                  <img
                    src={featuredProject.image}
                    alt={featuredProject.title}
                    className="h-full w-full object-cover transition duration-700 hover:scale-[1.02]"
                  />
                </div>

                <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-14">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#B59A68]">
                      Featured Project
                    </p>

                    <h2 className="mt-8 text-[38px] font-extralight leading-[1.04] tracking-[-0.04em] text-[#777777] sm:text-[48px]">
                      {featuredProject.title}
                    </h2>

                    <p className="mt-5 text-sm font-medium uppercase tracking-[0.17em] text-[#A0A0A0]">
                      {featuredProject.location}
                    </p>

                    <p className="mt-8 text-lg font-light leading-8 text-[#929292]">
                      {featuredProject.description}
                    </p>
                  </div>

                  <div className="mt-14 border-t border-[#DDDAD3] pt-8">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-[#8E8E8E]">
                        Project Type
                      </span>
                      <span className="text-sm font-medium text-[#777777]">
                        {featuredProject.category}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm font-light text-[#8E8E8E]">
                        Focus
                      </span>
                      <span className="text-sm font-medium text-[#777777]">
                        Design + Performance
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* INTRODUCTION */}
        <section className="border-y border-[#EEEEEE] px-6 py-24 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
                Our Work
              </p>

              <h2 className="mt-6 max-w-xl text-[40px] font-extralight leading-[1.05] tracking-[-0.04em] text-[#777777] sm:text-[52px]">
                Every project begins with the home.
              </h2>
            </div>

            <div className="lg:pt-10">
              <p className="max-w-2xl text-lg font-light leading-8 text-[#929292]">
                No two homes are identical. We evaluate the architecture,
                openings, performance requirements and homeowner priorities
                before recommending a solution.
              </p>

              <p className="mt-6 max-w-2xl text-lg font-light leading-8 text-[#929292]">
                The result is a window or door project that feels intentional,
                complements the property and performs reliably in Florida
                conditions.
              </p>
            </div>
          </div>
        </section>

        {/* FILTERABLE PROJECT GALLERY */}
        <section className="px-6 py-28 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-9 border-b border-[#E5E5E5] pb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
                  Project Gallery
                </p>

                <h2 className="mt-5 text-[40px] font-extralight tracking-[-0.04em] text-[#777777] sm:text-[52px]">
                  Explore our installations.
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                {(['All', 'Windows', 'Doors'] as ProjectCategory[]).map(
                  (category) => {
                    const isActive = activeCategory === category

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`rounded-full border px-6 py-3 text-sm font-medium transition duration-300 ${
                          isActive
                            ? 'border-[#777777] bg-[#777777] text-white'
                            : 'border-[#D9D9D9] bg-white text-[#858585] hover:border-[#B59A68] hover:text-[#B59A68]'
                        }`}
                      >
                        {category}
                      </button>
                    )
                  },
                )}
              </div>
            </div>

            <div className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-2">
              {filteredProjects.map((project, index) => (
                <article
                  key={project.id}
                  className={
                    index % 3 === 0
                      ? 'group md:col-span-2'
                      : 'group md:col-span-1'
                  }
                >
                  <div
                    className={`overflow-hidden rounded-[24px] bg-[#F1F1F1] ${
                      index % 3 === 0
                        ? 'h-[420px] sm:h-[570px] lg:h-[680px]'
                        : 'h-[420px] sm:h-[520px]'
                    }`}
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                    />
                  </div>

                  <div className="mt-7 flex gap-6">
                    <div className="pt-1">
                      <span className="text-xs font-medium tracking-[0.2em] text-[#B59A68]">
                        {String(project.id).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <h3 className="max-w-xl text-2xl font-light tracking-[-0.025em] text-[#747474] sm:text-3xl">
                          {project.title}
                        </h3>

                        <span className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.18em] text-[#A0A0A0]">
                          {project.category}
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-medium uppercase tracking-[0.15em] text-[#AAAAAA]">
                        {project.location}
                      </p>

                      <p className="mt-5 max-w-2xl text-base font-light leading-7 text-[#969696]">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECT APPROACH */}
        <section className="bg-[#767676] px-6 py-28 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#D7C398]">
                  Our Approach
                </p>

                <h2 className="mt-6 max-w-xl text-[40px] font-extralight leading-[1.05] tracking-[-0.04em] text-white sm:text-[52px]">
                  Detail matters at every stage.
                </h2>

                <p className="mt-7 max-w-lg text-lg font-light leading-8 text-[#E2E2E2]">
                  A successful installation depends on much more than selecting
                  a beautiful product. Accurate measurements, proper
                  preparation and careful finishing are essential.
                </p>
              </div>

              <div className="grid gap-px overflow-hidden rounded-[24px] bg-[#8E8E8E] sm:grid-cols-2">
                {[
                  {
                    number: '01',
                    title: 'Consultation',
                    text: 'We review your home, objectives and available product options.',
                  },
                  {
                    number: '02',
                    title: 'Design',
                    text: 'We select configurations, finishes, glass and hardware.',
                  },
                  {
                    number: '03',
                    title: 'Preparation',
                    text: 'Measurements and project details are carefully confirmed.',
                  },
                  {
                    number: '04',
                    title: 'Installation',
                    text: 'The project is completed with precision, protection and cleanup.',
                  },
                ].map((step) => (
                  <article
                    key={step.number}
                    className="min-h-[260px] bg-[#767676] p-8 sm:p-10"
                  >
                    <span className="text-xs font-medium tracking-[0.2em] text-[#D7C398]">
                      {step.number}
                    </span>

                    <h3 className="mt-14 text-2xl font-light text-white">
                      {step.title}
                    </h3>

                    <p className="mt-4 text-base font-light leading-7 text-[#DDDDDD]">
                      {step.text}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="px-6 py-24 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-px overflow-hidden rounded-[24px] bg-[#E4E4E2] sm:grid-cols-2 lg:grid-cols-4">
            {projectStats.map((stat) => (
              <article
                key={stat.label}
                className="min-h-[210px] bg-[#F8F8F7] p-8 sm:p-10"
              >
                <p className="text-2xl font-light tracking-[-0.03em] text-[#777777]">
                  {stat.value}
                </p>

                <p className="mt-12 max-w-[180px] text-sm font-light leading-6 text-[#999999]">
                  {stat.label}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* PHOTO DISCLAIMER */}
        <section className="px-6 pb-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl border-t border-[#E7E7E7] pt-6">
            <p className="text-xs font-light leading-5 text-[#AAAAAA]">
              Project photography currently shown is representative. Original
              Cronus Windows &amp; Doors installation photography can be added
              as completed projects become available.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-28 pt-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-[#F3F1ED] px-8 py-20 text-center sm:px-12 lg:py-28">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#B59A68]">
              Your Home Could Be Next
            </p>

            <h2 className="mx-auto mt-6 max-w-4xl text-[42px] font-extralight leading-[1.02] tracking-[-0.045em] text-[#777777] sm:text-[58px]">
              Let’s plan a transformation designed for your home.
            </h2>

            <p className="mx-auto mt-7 max-w-2xl text-lg font-light leading-8 text-[#929292]">
              Schedule a complimentary consultation to discuss your windows,
              doors, design preferences and project goals.
            </p>

            <Link
              to="/contact"
              className="mt-10 inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#777777] px-8 py-4 text-sm font-medium !text-white transition duration-300 hover:bg-[#626262]"
            >
              Request a Free Consultation
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}