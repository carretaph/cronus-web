import logo from '../assets/story-windows-doors-logo.png'

function Footer() {
  return (
    <footer className="bg-white px-8 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 border-b border-[#E8E8E8] pb-16 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src={logo}
              alt="Story Windows & Doors"
              className="h-20 w-auto object-contain"
            />

            <p className="mt-7 max-w-xs text-[15px] font-light leading-7 text-[#999999]">
              Premium windows and doors with exceptional service from
              consultation through installation.
            </p>
          </div>

          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-[#B08D57]">
              Explore
            </p>

            <nav className="mt-7 flex flex-col gap-4">
              <a
                href="#home"
                className="text-[15px] font-light text-[#888888] transition hover:text-[#555555]"
              >
                Home
              </a>

              <a
                href="#windows"
                className="text-[15px] font-light text-[#888888] transition hover:text-[#555555]"
              >
                Windows
              </a>

              <a
                href="#doors"
                className="text-[15px] font-light text-[#888888] transition hover:text-[#555555]"
              >
                Doors
              </a>

              <a
                href="#projects"
                className="text-[15px] font-light text-[#888888] transition hover:text-[#555555]"
              >
                Projects
              </a>
            </nav>
          </div>

          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-[#B08D57]">
              Service Areas
            </p>

            <div className="mt-7 flex flex-col gap-4 text-[15px] font-light text-[#888888]">
              <p>Florida</p>
              <p>North Carolina</p>
              <p>South Carolina</p>
            </div>
          </div>

          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-[#B08D57]">
              Contact
            </p>

            <div className="mt-7 flex flex-col gap-4 text-[15px] font-light text-[#888888]">
              <a
                href="mailto:info@cronuswindows.com"
                className="transition hover:text-[#555555]"
              >
                info@cronuswindows.com
              </a>

              <a
                href="tel:+14075551234"
                className="transition hover:text-[#555555]"
              >
                (407) 555-1234
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-8 text-[13px] font-light text-[#A0A0A0] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Story Windows & Doors. All rights reserved.</p>

          <p>Luxury service. Lasting quality.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer