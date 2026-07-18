import cronusLogo from '../assets/cronus-logo.png'

const navItems = [
  'Home',
  'Windows',
  'Doors',
  'Projects',
  'Financing',
  'Service Areas',
  'About',
  'Contact',
]

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#F2F2F2] bg-white">
      <div className="mx-auto flex h-50 max-w-[1550px] items-center justify-between px-10 lg:px-16">
        <a href="#home" aria-label="Cronus home" className="shrink-0">
          <img
            src={cronusLogo}
            alt="Cronus Windows and Doors"
            className="h-45 w-auto object-contain"
          />
        </a>

        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="
                text-[15px]
                font-light
                tracking-wide
                !text-[#9A9A9A]
                transition-colors
                duration-300
                hover:!text-[#666666]
              "
            >
              {item}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="
            hidden
            items-center
            justify-center
            rounded-full
            bg-[#7A7A7A]
            px-8
            py-4
            text-[15px]
            font-medium
            !text-white
            transition-colors
            duration-300
            hover:bg-[#686868]
            md:inline-flex
          "
        >
          Get an Estimate
        </a>
      </div>
    </header>
  )
}

export default Navbar