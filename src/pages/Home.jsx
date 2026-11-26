import Hero from '../components/Hero.jsx'
import { Briefing, Missions, Prizes, Schedule, Venue, Faq, Contact } from '../components/sections/index.js'

export default function Home() {
  return (
    <>
      <Hero />
      <main className="home-sections">
        <Briefing />
        <Missions />
        <Prizes />
        <Schedule />
        <Venue />
        <Faq />
        <Contact />
      </main>
    </>
  )
}
