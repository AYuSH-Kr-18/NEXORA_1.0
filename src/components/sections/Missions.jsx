import { useEffect } from 'react'
import { raise } from '../../lib/wanted.js'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { events, inr, prizeTotal, teamLabel } from '../../data/event.js'
import { SectionHead, Stars, HorizonBreak, MissionGlyph } from './common.jsx'

const tabs = [
  { id: 'all', label: 'All missions' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'tech', label: 'Tech' },
]

export default function Missions() {
  // first wanted star when the missions board scrolls into view
  useEffect(() => {
    const el = document.getElementById('missions'); if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { raise(1); io.disconnect() } }, { threshold: 0.25 })
    io.observe(el); return () => io.disconnect()
  }, [])
  const [tab, setTab] = useState('all')
  const list = events.filter((e) => tab === 'all' || e.category === tab)
  return (
    <section id="missions" className="sec missions">
      <HorizonBreak seed={19} />
      <div className="wrap">
        <SectionHead kicker={`${events.length} missions available`} title="Pick your" script="mission">
          <div className="tabs" role="tablist" aria-label="Filter missions">
            {tabs.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab mono ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </SectionHead>
        <ul className="missions__grid">
          {list.map((e) => (
            <li key={e.id} className={`mcard mcard--${e.category}`}>
              <div className="mcard__top">
                <span className="mono mcard__cat"><MissionGlyph type={e.category} />{e.category === 'gaming' ? 'Esports' : 'Tech'}</span>
                <Stars n={e.wanted} />
              </div>
              <p className="script mcard__code">{e.codename}</p>
              <h3 className="display mcard__name">{e.name}</h3>
              <p className="mcard__blurb">{e.blurb}</p>
              <dl className="mcard__facts">
                <div><dt className="mono">Gang</dt><dd>{teamLabel(e)}</dd></div>
                <div><dt className="mono">Entry</dt><dd>{inr(e.fee)}</dd></div>
                <div><dt className="mono">Payout</dt><dd className="mcard__cash">{inr(prizeTotal(e))}</dd></div>
                <div><dt className="mono">When</dt><dd>Day {e.day} · {e.time}</dd></div>
              </dl>
              <div className="mcard__cta">
                <Link className="btn btn--sm" to={`/events/${e.id}`}>Details</Link>
                <Link className="btn btn--sm btn--hot" to={`/register?event=${e.id}`}>Accept mission</Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
