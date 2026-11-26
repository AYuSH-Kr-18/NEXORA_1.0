import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import '../components/wanted.css'
import MissionPassed from '../components/MissionPassed.jsx'
import QRCode from 'qrcode'
import { fest, getEvent, venues, inr, payment, schedule } from '../data/event.js'
import { getRegistration, findRegistrations } from '../api/index.js'
import '../styles/flow.css'

const STATUS = {
  PENDING_PAYMENT: { cls: 'pending', label: 'Payment pending' },
  PAYMENT_SUBMITTED: { cls: 'submitted', label: 'Under verification' },
  VERIFIED: { cls: 'verified', label: 'Active · verified' },
  REJECTED: { cls: 'rejected', label: 'Payment rejected' },
}
const Chip = ({ status }) => {
  const s = STATUS[status] || STATUS.PENDING_PAYMENT
  return <span className={`chip chip--${s.cls}`}>{s.label}</span>
}

export default function Pass() {
  const { id } = useParams()
  return id ? <Ticket id={id} /> : <Lookup />
}

function Lookup() {
  const [q, setQ] = useState('')
  const [res, setRes] = useState(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function go(e) {
    e.preventDefault()
    const v = q.trim()
    if (!v) return
    setBusy(true)
    const one = await getRegistration(v)
    if (one) { navigate(`/pass/${one.id}`); return }
    setRes(await findRegistrations(v)); setBusy(false)
  }

  return (
    <main className="flow">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <header className="flow__head">
          <span className="mono flow__kicker">{fest.name} {fest.year} · Mission pass</span>
          <h1 className="display flow__title sunset-text">Find my pass</h1>
          <p className="flow__sub">Enter your registration ID (TG27-XXXXXX), the leader's mobile number or email.</p>
        </header>
        <form className="lookup" onSubmit={go}>
          <label htmlFor="q" className="sr-only">Registration ID, mobile or email</label>
          <input id="q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="TG27-ABC123 or 98765 43210" autoComplete="off" />
          <button className="btn btn--hot" disabled={busy}>{busy ? 'Searching…' : 'Find'}</button>
        </form>
        {res && (
          <div className="results">
            {res.length === 0 && <div className="notice">No registration found. Passes are stored on the device you registered from until the backend goes live. <Link to="/register">Register now</Link></div>}
            {res.map((r) => (
              <Link key={r.id} className="result" to={`/pass/${r.id}`}>
                <span><strong className="mono" style={{ fontSize: 14 }}>{r.id}</strong><br /><span style={{ color: 'var(--muted)', fontSize: 14 }}>{r.entries.length} mission{r.entries.length > 1 ? 's' : ''} · {inr(r.amount)}</span></span>
                <Chip status={r.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function Ticket({ id }) {
  const [reg, setReg] = useState(undefined)
  const [qr, setQr] = useState('')
  const loc = useLocation()
  const [passed, setPassed] = useState(!!loc.state?.passed)
  useEffect(() => { if (!passed) return; document.body.classList.add('has-passed'); const t = setTimeout(() => setPassed(false), 5000); return () => { clearTimeout(t); document.body.classList.remove('has-passed') } }, [passed])
  useEffect(() => { getRegistration(id).then(setReg) }, [id])
  useEffect(() => {
    if (reg) QRCode.toDataURL(reg.id, { margin: 1, width: 520, color: { dark: '#0b0614', light: '#fff6ec' } }).then(setQr)
  }, [reg])

  if (reg === undefined) return <main className="flow"><div className="wrap mono">Loading pass…</div></main>
  if (reg === null) {
    return (
      <main className="flow">
        <div className="wrap flow__head">
          <span className="mono flow__kicker">Mission pass</span>
          <h1 className="display flow__title sunset-text">Busted</h1>
          <p className="flow__sub">No record of <strong>{id}</strong> on this device.</p>
          <div><Link className="btn" to="/pass">Search again</Link></div>
        </div>
      </main>
    )
  }

  const wanted = Math.max(...reg.entries.map((en) => getEvent(en.eventId)?.wanted || 1))

  return (
    <main className="flow">
      {passed && <MissionPassed onDone={() => setPassed(false)} />}
      <div className="wrap pass-wrap">
        <header className="flow__head flow__head--center">
          <span className="mono flow__kicker">Mission pass</span>
          <h1 className="display flow__title sunset-text">{reg.status === 'PENDING_PAYMENT' ? 'Mission in progress' : 'Mission passed'}</h1>
          <p className="flow__sub no-print">
            {reg.status === 'PENDING_PAYMENT' && 'Your spot is held. Pay the fee to send it for verification.'}
            {reg.status === 'PAYMENT_SUBMITTED' && 'Payment proof submitted. Organisers verify it within 24 hours, then this pass turns ACTIVE. Save or screenshot it.'}
            {reg.status === 'VERIFIED' && 'Payment verified. Show this QR at the help desk with your college ID.'}
            {reg.status === 'REJECTED' && 'We could not verify your payment. Contact the organisers.'}
          </p>
        </header>

        <article className="ticket" aria-label="Mission pass">
          <i className="ticket__foil" aria-hidden="true" />
          <div className="ticket__main">
            <div className="ticket__brand">
              <h2 className="ticket__fest">{fest.name}<span className="script">{fest.year}</span></h2>
              <Chip status={reg.status} />
            </div>
            <div>
              <div className="mono" style={{ color: 'var(--muted)' }}>Registration ID</div>
              <div className="ticket__id">{reg.id}</div>
            </div>
            <dl className="ticket__kv mono">
              <div><dt>Leader</dt><dd>{reg.leader.name}</dd></div>
              <div><dt>College</dt><dd>{reg.leader.college}</dd></div>
              <div><dt>Dates</dt><dd>{fest.dateLabel}</dd></div>
              <div><dt>Wanted level</dt><dd><span className="stars">{[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= wanted ? '' : 'off'}>★</span>)}</span></dd></div>
            </dl>
            <div className="ticket__events">
              {reg.entries.map((en) => {
                const e = getEvent(en.eventId)
                return (
                  <div className="ticket__event" key={en.eventId}>
                    <strong>{e?.name || en.eventId}</strong>
                    <span className="mono">{en.members.length}P</span>
                    <small className="mono">Day {e?.day} · {e?.time} · {venues[e?.venue]?.name}{en.teamName && e?.teamMax > 1 ? ` · ${en.teamName}` : ''}</small>
                  </div>
                )
              })}
            </div>
          </div>
          <aside className="ticket__stub">
            <div className="ticket__qr">{qr && <img src={qr} alt={`QR code for ${reg.id}`} />}</div>
            <span className="mono">{reg.id}</span>
            <span className="mono" style={{ color: 'var(--muted)', textAlign: 'center' }}>Show at check-in<br />with college ID</span>
          </aside>
        </article>

        <WhatNext reg={reg} />

        <div className="ticket-actions">
          {reg.status === 'PENDING_PAYMENT' && <Link className="btn btn--hot" to={`/pay/${reg.id}`}>Pay now · {inr(reg.amount)}</Link>}
          <button className="btn" onClick={() => window.print()}>Print / Save PDF</button>
          <Link className="btn" to="/register">Add another mission</Link>
        </div>
      </div>
    </main>
  )
}

function WhatNext({ reg }) {
  const first = schedule.flatMap((d) => d.items.map((it) => ({ ...it, day: d.day, date: d.date })))
  const checkin = first.find((it) => /check-in/i.test(it.title)) || first[0]
  const evs = reg.entries.map((en) => getEvent(en.eventId)).filter(Boolean).sort((a, b) => a.day - b.day)
  const firstEv = evs[0]
  const items = [
    { k: 'Check-in opens', v: checkin ? `${checkin.date} · ${checkin.time}` : fest.dateLabel, s: venues[checkin?.venue]?.name },
    { k: 'Your first mission', v: firstEv ? `Day ${firstEv.day} · ${firstEv.time}` : '-', s: firstEv ? `${firstEv.name} · ${venues[firstEv.venue]?.name}` : '' },
    { k: 'Bring', v: 'College ID + this QR', s: 'Screenshot or print works' },
    { k: 'Need help?', v: payment.helpPhone, s: 'Call or WhatsApp the desk', href: `tel:${payment.helpPhone.replace(/\s/g, '')}` },
  ]
  return (
    <section className="whatnext" aria-label="What next">
      <span className="mono whatnext__title">What next</span>
      <div className="whatnext__grid">
        {items.map((it) => (
          <div className="whatnext__item frame" key={it.k}>
            <span className="mono whatnext__k">{it.k}</span>
            {it.href ? <a className="whatnext__v" href={it.href}>{it.v}</a> : <span className="whatnext__v">{it.v}</span>}
            {it.s && <span className="whatnext__s">{it.s}</span>}
          </div>
        ))}
      </div>
    </section>
  )
}
