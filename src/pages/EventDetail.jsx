import { useEffect } from 'react'
import { raise } from '../lib/wanted.js'
import { Link, useParams } from 'react-router-dom'
import { getEvent, inr, prizeTotal, teamLabel, venues } from '../data/event.js'
import { Stars, Skyline, MissionGlyph } from '../components/sections/common.jsx'
import './eventdetail.css'

export default function EventDetail() {
  useEffect(() => raise(2), [])
  const { id } = useParams()
  const e = getEvent(id)
  if (!e) {
    return (
      <main className="ed ed--missing">
        <div className="wrap">
          <p className="mono ed__k">Mission not found</p>
          <h1 className="display ed__name">No such <span className="sunset-text">mission</span></h1>
          <p className="ed__blurb">This event does not exist or was renamed.</p>
          <Link className="btn" to="/#missions">See all missions</Link>
        </div>
      </main>
    )
  }
  const v = venues[e.venue]
  const place = ['1st', '2nd', '3rd']
  return (
    <main className={`ed ed--${e.category}`}>
      <div className="wrap">
        <Link className="mono ed__back" to="/#missions">← All missions</Link>
        <div className="ed__top">
        <header className="ed__head">
          <div className="ed__tags">
            <span className="mono ed__cat">{e.category === 'gaming' ? 'Esports' : 'Tech'} mission</span>
            <Stars n={e.wanted} />
          </div>
          <p className="script ed__code">{e.codename}</p>
          <h1 className="display ed__name">{e.name}</h1>
          <p className="ed__blurb">{e.blurb}</p>
          <div className="ed__cta">
            <Link className="btn btn--hot" to={`/register?event=${e.id}`}>Accept mission · {inr(e.fee)}</Link>
            <a className="btn" href="#rules">Read the rules</a>
          </div>
        </header>
        <figure className="ed__poster" aria-hidden="true">
          <div className="ed__poster-sky" />
          <div className="ed__poster-sun" />
          <Skyline seed={e.id.length * 13 + e.day} className="ed__poster-city" />
          <div className="ed__poster-hud">
            <span className="mono">Mission</span>
            <Stars n={e.wanted} />
          </div>
          <div className="ed__poster-glyph"><MissionGlyph type={e.category} /></div>
          <figcaption className="ed__poster-cap">
            <span className="script">{e.codename}</span>
            <span className="mono">Day {e.day} · {v?.name}</span>
          </figcaption>
        </figure>
        </div>

        <dl className="ed__facts">
          <div className="frame"><dt className="mono">Gang size</dt><dd>{teamLabel(e)}</dd></div>
          <div className="frame"><dt className="mono">Entry fee</dt><dd>{inr(e.fee)}<small>{e.teamMax === 1 ? ' per player' : ' per team'}</small></dd></div>
          <div className="frame"><dt className="mono">When</dt><dd>Day {e.day}<small> · {e.time}</small></dd></div>
          <div className="frame"><dt className="mono">Where</dt><dd>{v?.name}<small> · {v?.where}</small></dd></div>
        </dl>

        <div className="ed__grid">
          <section className="ed__panel" id="rules" aria-labelledby="rules-h">
            <h2 className="display ed__h" id="rules-h">Rules of <span className="script">engagement</span></h2>
            <ul className="ed__rules">
              {e.rules.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </section>
          <aside className="ed__side">
            <section className="ed__panel ed__prizes" aria-labelledby="pz-h">
              <p className="mono ed__k" id="pz-h">Payout · {inr(prizeTotal(e))}</p>
              <ol className="ed__podium">
                {e.prizes.map((p, i) => (
                  <li key={i} className={`ed__place ed__place--${i + 1}`}>
                    <span className="mono">{place[i]}</span>
                    <b className="display">{inr(p)}</b>
                  </li>
                ))}
              </ol>
            </section>
            <section className="ed__panel" aria-labelledby="co-h">
              <p className="mono ed__k" id="co-h">Coordinator</p>
              <p className="ed__coname">{e.contact.name}</p>
              <a className="mono ed__tel" href={`tel:${e.contact.phone.replace(/\s/g, '')}`}>{e.contact.phone}</a>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}
