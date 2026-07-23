import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

import WindowsHero from '../components/windows/WindowsHero'
import WhyWindows from '../components/windows/WhyWindows'
import WindowCollections from '../components/windows/WindowCollections'
import BuiltForFlorida from '../components/windows/BuiltForFlorida'
import ImpactComparison from '../components/windows/ImpactComparison'
import EnergyEfficiency from '../components/windows/EnergyEfficiency'
import WindowsCTA from '../components/windows/WindowsCTA'

export default function Windows() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <WindowsHero />
        <WhyWindows />
        <WindowCollections />
        <BuiltForFlorida />
        <ImpactComparison />
        <EnergyEfficiency />
        <WindowsCTA />
      </main>

      <Footer />
    </div>
  )
}