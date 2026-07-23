import { NavLink } from 'react-router-dom'
import cronusLogo from '../assets/cronus-logo.png'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Windows', to: '/windows' },
  { label: 'Doors', to: '/doors' },
  { label: 'Projects', to: '/projects' },
  { label: 'Financing', to: '/financing' },
  { label: 'Service Areas', to: '/service-areas' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#F2F2F2] bg-white">
      <div className="mx-auto flex h-50 max-w-[1550px] items-center justify-between px-10 lg:px-16">
        <NavLink to="/" aria-label="Cronus Home" className="shrink-0">
          <img
            src={cronusLogo}
            alt="Cronus Windows and Doors"
            className="h-45 w-auto object-contain"
          />
        </NavLink>

        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `text-[15px] font-light tracking-wide transition-colors duration-300 ${
                  isActive
                    ? '!text-[#666666]'
                    : '!text-[#9A9A9A] hover:!text-[#666666]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/contact"
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
        </NavLink>
      </div>
    </header>
  )
}

export default Navbar