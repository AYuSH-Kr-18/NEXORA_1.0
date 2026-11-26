import { useState } from 'react'
import { location, venues, events } from '../../data/event.js'
import { HorizonBreak, SectionHead } from './common.jsx'

const blipColor = (id) => {
  const evs = events.filter((e) => e.venue === id)
  if (!evs.length) return 'var(--cream)'
  if (evs.every((e) => e.category === 'gaming')) return 'var(--pink)'
  if (evs.every((e) => e.category === 'tech')) return 'var(--aqua)'
  return 'var(--gold)'
}

function Minimap({ active, setActive }) {
  return (
    <svg className="minimap" viewBox="0 0 100 100" role="img" aria-label="Campus map with event venues">
      <defs>
        <clipPath id="mm-clip"><circle cx="50" cy="50" r="48" /></clipPath>
        <radialGradient id="mm-bg" cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#2a1440" />
          <stop offset="1" stopColor="#120720" />
        </radialGradient>
        <pattern id="mm-grid" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M5 0H0V5" fill="none" stroke="rgba(255,246,236,.06)" strokeWidth=".2" />
        </pattern>
      </defs>
      <g clipPath="url(#mm-clip)">
        <rect width="100" height="100" fill="url(#mm-bg)" />
        <rect width="100" height="100" fill="url(#mm-grid)" />
        {/* water + park */}
        <path d="M70 0 C78 14 92 18 100 16 V0 Z" fill="#0f5560" />
        <path d="M84 0 C88 10 96 12 100 10" fill="none" stroke="#3fe0d0" strokeWidth=".3" opacity=".5" />
        <path d="M6 44 q10 -6 16 2 q4 8 -4 12 q-12 4 -14 -4 z" fill="#1f3b2e" />
        <path d="M80 76 q10 -2 14 6 q0 10 -10 10 q-8 -2 -4 -16z" fill="#1f3b2e" />
        {/* blocks */}
        <g fill="#3a2156" stroke="rgba(255,246,236,.12)" strokeWidth=".3">
          <rect x="20" y="24" width="18" height="16" rx="1.5" />
          <rect x="56" y="16" width="20" height="18" rx="1.5" />
          <rect x="62" y="52" width="18" height="18" rx="1.5" />
          <rect x="40" y="40" width="12" height="10" rx="1.5" />
          <rect x="16" y="64" width="20" height="16" rx="6" fill="#2b2f3a" />
          <rect x="40" y="58" width="12" height="14" rx="1.5" />
          <rect x="84" y="36" width="10" height="12" rx="1.5" />
          <rect x="6" y="14" width="10" height="8" rx="1.5" />
        </g>
        {/* roads */}
        <g fill="none" stroke="#8b7aa0" strokeLinecap="round" strokeLinejoin="round">
          <path d="M48 100 V50 H100" strokeWidth="3.2" />
          <path d="M48 50 V8 M0 50 H48" strokeWidth="2.2" />
          <path d="M48 30 C60 40 54 46 82 46" strokeWidth="1.4" />
          <path d="M10 92 Q20 84 48 84 T90 92" strokeWidth="1.4" />
          <path d="M28 50 V86" strokeWidth="1.4" />
        </g>
        <g fill="none" stroke="#ffc56b" strokeWidth=".35" strokeDasharray="1.4 1.4" opacity=".7">
          <path d="M48 100 V50 H100" />
        </g>
        {/* radar ring */}
        <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,246,236,.1)" strokeWidth=".3" />
        <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(255,246,236,.08)" strokeWidth=".3" />
        {/* blips */}
        {Object.entries(venues).map(([id, v]) => {
          const on = active === id
          return (
            <g key={id} className={`blip ${on ? 'is-on' : ''}`} transform={`translate(${v.x} ${v.y})`} onClick={() => setActive(on ? null : id)} style={{ cursor: 'pointer', color: blipColor(id) }}>
              {on && <circle r="6" fill="none" stroke="currentColor" strokeWidth=".5" className="blip__pulse" />}
              {id === 'help-desk'
                ? <path d="M0 -3.6 L3 3 L0 1.6 L-3 3 Z" fill="currentColor" stroke="#0b0614" strokeWidth=".5" />
                : <circle r={on ? 3 : 2.4} fill="currentColor" stroke="#0b0614" strokeWidth=".6" />}
              {on && <text y="-5.5" textAnchor="middle" className="blip__label">{v.name}</text>}
            </g>
          )
        })}
      </g>
      <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,246,236,.55)" strokeWidth=".6" />
      <circle cx="50" cy="50" r="49.4" fill="none" stroke="rgba(11,6,20,.9)" strokeWidth="1.2" />
      {/* north marker */}
      <g transform="translate(50 3.6)">
        <circle r="3" fill="#0b0614" stroke="rgba(255,246,236,.55)" strokeWidth=".4" />
        <text y="1.3" textAnchor="middle" className="minimap__n">N</text>
      </g>
    </svg>
  )
}

export default function Venue() {
  const [active, setActive] = useState('esports-arena')
  return (
    <section id="venue" className="sec venue">
      <HorizonBreak seed={43} />
      <div className="wrap">
        <SectionHead kicker="Location" title="Set your" script="waypoint" />
        <div className="venue__grid">
          <div className="venue__map frame">
            <Minimap active={active} setActive={setActive} />
            <p className="mono venue__hint">Tap a blip or a place to locate it</p>
          </div>
          <div className="venue__info">
            <div className="venue__card frame">
              <p className="mono venue__k">Venue</p>
              <h3 className="display venue__name">{location.name}</h3>
              <p className="venue__addr">{location.address}</p>
              <a className="btn btn--hot" href={location.mapsUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps <span className="arw" aria-hidden="true">↗</span></a>
            </div>
            <ul className="venue__legend" aria-label="Places on campus">
              {Object.entries(venues).map(([id, v]) => (
                <li key={id}>
                  <button className={`legend ${active === id ? 'is-active' : ''}`} aria-pressed={active === id} onClick={() => setActive(id)}>
                    <span className="legend__dot" style={{ background: blipColor(id) }} aria-hidden="true" />
                    <span className="legend__name">{v.name}</span>
                    <span className="mono legend__where">{v.where}</span>
                  </button>
                </li>
              ))}
            </ul>
            <dl className="venue__reach">
              {location.howToReach.map((r) => (
                <div key={r.by}><dt className="mono">{r.by}</dt><dd>{r.text}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
