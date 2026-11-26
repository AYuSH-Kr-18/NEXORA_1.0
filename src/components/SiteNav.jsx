import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fest } from '../data/event.js'
import { useIntro } from '../lib/intro.js'
import './sitenav.css'

const links = [
  { to: '/#missions', label: 'Missions' },
  { to: '/#schedule', label: 'Schedule' },
  { to: '/#venue', label: 'Venue' },
  { to: '/#prizes', label: 'Prizes' },
  { to: '/#faq', label: 'FAQ' },
  { to: '/pass', label: 'My pass' },
]

export default function SiteNav() {
  const { hud } = useIntro()
  const [pct, setPct] = useState(0)
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()
  useEffect(() => setOpen(false), [pathname, hash])
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - innerHeight
      setPct(h > 0 ? Math.round((scrollY / h) * 100) : 0)
    }
    on(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [pathname])

  return (
    <header className={`sitenav ${hud ? 'is-in' : ''} ${open ? 'is-open' : ''}`}>
      <div className="sitenav__left hud-item" style={{ '--d': 0 }}>
        <Link to="/" className="sitenav__brand" aria-label={`${fest.name} home`}>
          <span className="display">{fest.name}</span><span className="script">{fest.year.slice(2)}</span>
        </Link>
        <div className="sitenav__progress" aria-hidden="true">
          <div className="sitenav__bar"><i style={{ width: pct + '%' }} /></div>
          <span className="mono">{pct}%</span>
        </div>
      </div>
      <nav className="sitenav__links hud-item" style={{ '--d': 1 }} aria-label="Main">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className="mono">{l.label} <span className="arw" aria-hidden="true">↗</span></NavLink>
        ))}
      </nav>
      <div className="sitenav__cta hud-item" style={{ '--d': 2 }}>
        <Link to="/register" className="btn btn--sm btn--hot">Register</Link>
        <button className="sitenav__menu btn btn--sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
    </header>
  )
}
