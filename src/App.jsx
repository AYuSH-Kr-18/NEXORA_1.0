import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home.jsx'
import EventDetail from './pages/EventDetail.jsx'
import Register from './pages/Register.jsx'
import Pay from './pages/Pay.jsx'
import Pass from './pages/Pass.jsx'
import NotFound from './pages/NotFound.jsx'
import SiteNav from './components/SiteNav.jsx'
import Footer from './components/Footer.jsx'
import WantedHud from './components/WantedHud.jsx'
import Achievement from './components/Achievement.jsx'

function ScrollTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) { setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50); return }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <>
      <ScrollTop />
      <SiteNav />
      <WantedHud />
      <Achievement />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pay/:id" element={<Pay />} />
        <Route path="/pass" element={<Pass />} />
        <Route path="/pass/:id" element={<Pass />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  )
}
