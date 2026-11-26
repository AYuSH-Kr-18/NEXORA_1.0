import { useState } from 'react'
import { Link } from 'react-router-dom'
import { faqs, fest, payment } from '../../data/event.js'
import { SectionHead } from './common.jsx'

export default function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="sec faq">
      <div className="wrap faq__wrap">
        <div className="faq__side">
          <SectionHead kicker="Need intel?" title="Street" script="intel" />
          <aside className="faq__hud frame" aria-label="Quick help">
            <div className="faq__hud-row"><span className="mono">Registration closes</span><b>{new Date(fest.registrationClosesAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</b></div>
            <div className="faq__hud-row"><span className="mono">Payment help</span><a href={`tel:${payment.helpPhone.replace(/\s/g, '')}`}>{payment.helpPhone}</a></div>
            <div className="faq__hud-row"><span className="mono">Verification</span><b>Within 24 hours</b></div>
            <div className="faq__hud-cta">
              <Link className="btn btn--sm btn--hot" to="/register">Register</Link>
              <Link className="btn btn--sm" to="/pass">Find my pass</Link>
            </div>
          </aside>
        </div>
        <div className="faq__list">
          {faqs.map((f, i) => {
            const on = open === i
            return (
              <div key={i} className={`faq__item ${on ? 'is-open' : ''}`}>
                <h3 className="faq__q">
                  <button aria-expanded={on} aria-controls={`faq-a-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(on ? -1 : i)}>
                    <span>{f.q}</span>
                    <span className="faq__icon" aria-hidden="true">{on ? '−' : '+'}</span>
                  </button>
                </h3>
                <div className="faq__a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={!on}>
                  <p>{f.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
