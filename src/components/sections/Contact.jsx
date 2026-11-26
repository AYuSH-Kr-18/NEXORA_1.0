import { Link } from 'react-router-dom'
import { contacts, socials, sponsors, fest } from '../../data/event.js'
import { SectionHead, Skyline } from './common.jsx'

export default function Contact() {
  return (
    <section id="contact" className="sec contact">
      <div className="wrap">
        <SectionHead kicker="Comms" title="Meet" script="the gang" />
        <div className="contact__grid">
          <ul className="contact__people">
            {contacts.map((c, i) => (
              <li key={i} className="contact__card frame">
                <p className="mono contact__role">{c.title || c.role}</p>{c.title && <p className="contact__real">{c.role}</p>}
                <p className="contact__name">{c.name}</p>
                <a className="contact__phone mono" href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a>
              </li>
            ))}
          </ul>
          <div className="contact__socials">
            <p className="mono contact__k">Follow the feed</p>
            {socials.map((s) => (
              <a key={s.label} className="contact__social" href={s.url} target="_blank" rel="noopener noreferrer">
                <span>{s.label}</span><span className="arw" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
        <div className="finalcall frame">
          <div className="finalcall__sky" aria-hidden="true" />
          <Skyline seed={71} className="finalcall__city" />
          <div className="finalcall__body">
            <p className="mono finalcall__k">Last call · {fest.dateLabel}</p>
            <p className="display finalcall__t">Your gang is <span className="script">waiting</span></p>
            <div className="finalcall__cta">
              <Link className="btn btn--hot" to="/register">Accept a mission</Link>
              <Link className="btn" to="/#schedule">See the heist plan</Link>
            </div>
          </div>
        </div>
        <div className="sponsors">
          <p className="mono contact__k">Bankrolled by</p>
          <ul className="sponsors__row">
            {sponsors.map((s) => (
              <li key={s} className="sponsor"><span className="display">{s}</span><span className="mono">Your brand here</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
