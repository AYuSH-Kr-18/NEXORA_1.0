import { useEffect, useMemo, useState } from 'react'
import { raise, busted } from '../lib/wanted.js'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { events, getEvent, inr, teamLabel, venues, fest } from '../data/event.js'
import { createRegistration } from '../api/index.js'
import { isName, isEmail, isPhone, normalizePhone, onlyDigits, required } from '../lib/validate.js'
import '../styles/flow.css'

const DRAFT = 'tg27.registerDraft'
const STEPS = ['Pick missions', 'Gang details', 'Review & pay']
const emptyLeader = { name: '', email: '', phone: '', college: '', course: '', year: '', city: '' }

export function Stars({ n }) {
  return (
    <span className="stars" aria-label={`Difficulty ${n} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= n ? '' : 'off'}>★</span>)}
    </span>
  )
}

function span(e) {
  const m = [...e.time.matchAll(/(\d{1,2}):(\d{2})/g)].map((x) => +x[1] * 60 + +x[2])
  const s = m[0] ?? 0
  let end = m[m.length - 1] ?? s + 60
  if (end <= s) end = 24 * 60
  return [s, end]
}
function clashes(ids) {
  const out = []
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) {
      const a = getEvent(ids[i]), b = getEvent(ids[j])
      if (!a || !b || a.day !== b.day) continue
      const [as, ae] = span(a), [bs, be] = span(b)
      if (as < be && bs < ae) out.push([a, b])
    }
  return out
}

function loadDraft() {
  try { return JSON.parse(sessionStorage.getItem(DRAFT)) || null } catch { return null }
}

export default function Register() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [d, setD] = useState(() => {
    const saved = loadDraft()
    const base = saved || { step: 0, selected: [], leader: emptyLeader, teams: {}, consent: false }
    const pre = params.get('event')
    if (pre && getEvent(pre) && !base.selected.includes(pre)) {
      base.selected = [...base.selected, pre]
      base.teams = { ...base.teams, [pre]: newTeam(getEvent(pre)) }
    }
    return base
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [failMsg, setFailMsg] = useState('')

  useEffect(() => raise(3), [])
  useEffect(() => { try { sessionStorage.setItem(DRAFT, JSON.stringify(d)) } catch {} }, [d])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [d.step])

  const selectedEvents = d.selected.map(getEvent).filter(Boolean)
  const total = selectedEvents.reduce((s, e) => s + e.fee, 0)
  const clashList = useMemo(() => clashes(d.selected), [d.selected])

  const set = (patch) => setD((x) => ({ ...x, ...patch }))
  const setLeader = (k, v) => setD((x) => ({ ...x, leader: { ...x.leader, [k]: v } }))
  const setTeam = (id, patch) => setD((x) => ({ ...x, teams: { ...x.teams, [id]: { ...x.teams[id], ...patch } } }))
  const setMember = (id, i, k, v) => setD((x) => {
    const members = x.teams[id].members.map((m, j) => (j === i ? { ...m, [k]: v } : m))
    return { ...x, teams: { ...x.teams, [id]: { ...x.teams[id], members } } }
  })

  function toggle(e) {
    setD((x) => {
      const on = x.selected.includes(e.id)
      const selected = on ? x.selected.filter((s) => s !== e.id) : [...x.selected, e.id]
      const teams = { ...x.teams }
      if (!on && !teams[e.id]) teams[e.id] = newTeam(e)
      return { ...x, selected, teams }
    })
  }

  function validateCrew() {
    const er = {}
    const L = d.leader
    if (!isName(L.name)) er['l-name'] = 'Enter your full name (letters only).'
    if (!isEmail(L.email)) er['l-email'] = 'Enter a valid email.'
    if (!isPhone(L.phone)) er['l-phone'] = 'Enter 10 digits, like 9876543210 (starts with 6, 7, 8 or 9).'
    if (!required(L.college)) er['l-college'] = 'College is required.'
    if (!required(L.course)) er['l-course'] = 'Course is required.'
    if (!required(L.year)) er['l-year'] = 'Pick your year.'
    if (!required(L.city)) er['l-city'] = 'City is required.'
    for (const e of selectedEvents) {
      const t = d.teams[e.id]
      if (e.teamMax > 1 && !required(t.teamName)) er[`t-${e.id}`] = 'Give your gang a name.'
      // every player in a gang needs their own number (the leader is player 1)
      const seen = new Set([normalizePhone(L.phone)].filter(Boolean))
      t.members.forEach((m, i) => {
        if (!isName(m.name)) er[`m-${e.id}-${i}-name`] = 'Name required.'
        const p = normalizePhone(m.phone)
        if (!p) er[`m-${e.id}-${i}-phone`] = 'Enter 10 digits, like 9876543210.'
        else if (seen.has(p)) er[`m-${e.id}-${i}-phone`] = 'This number is already used by another player in this gang.'
        else seen.add(p)
      })
    }
    setErrors(er)
    const first = Object.keys(er)[0]
    if (first) {
      const el = document.getElementById(first)
      el?.focus(); el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      const n = Object.keys(er).length
      busted(`Fix the ${n} highlighted field${n > 1 ? 's' : ''}.`)
      return false
    }
    raise(4)
    return true
  }

  async function submit() {
    if (!d.consent) { setErrors({ consent: 'Please accept the rules to continue.' }); busted('Accept the rules first.'); return }
    setBusy(true); setFailMsg('')
    try {
      const L = { ...d.leader, name: d.leader.name.trim(), email: d.leader.email.trim(), phone: normalizePhone(d.leader.phone) }
      const reg = await createRegistration({
        leader: L,
        entries: selectedEvents.map((e) => ({
          eventId: e.id,
          teamName: e.teamMax > 1 ? d.teams[e.id].teamName.trim() : L.name,
          members: [{ name: L.name, phone: L.phone }, ...d.teams[e.id].members.map((m) => ({ name: m.name.trim(), phone: normalizePhone(m.phone) }))],
        })),
      })
      sessionStorage.removeItem(DRAFT)
      navigate(`/pay/${reg.id}`)
    } catch (err) {
      setFailMsg(err.message || 'Could not create registration. Try again.')
      setBusy(false)
    }
  }

  const err = (id) => errors[id] ? <span className="err" role="alert">{errors[id]}</span> : null
  const field = (id, label, value, onChange, extra = {}) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className="input" value={value} onChange={(ev) => onChange(ev.target.value)} aria-invalid={!!errors[id]} {...extra} />
      {err(id)}
    </div>
  )

  return (
    <main className="flow">
      <div className="wrap">
        <header className="flow__head">
          <span className="mono flow__kicker">{fest.name} {fest.year} · Registration</span>
          <h1 className="display flow__title sunset-text">Mission setup</h1>
          <p className="flow__sub">Pick your missions, add your gang, then pay with any UPI app. Registration closes 15 Feb.</p>
        </header>

        <div className="steps" aria-label={`Step: ${STEPS[d.step]}`}>
          <div className="steps__labels">
            {STEPS.map((s, i) => (
              <span key={s} className={`mono ${i < d.step ? 'is-on' : ''} ${i === d.step ? 'is-now' : ''}`} aria-current={i === d.step ? 'step' : undefined}>{s}</span>
            ))}
          </div>
          <div className="steps__bar"><i style={{ width: `${((d.step + 1) / STEPS.length) * 100}%` }} /></div>
        </div>

        <div className="flow__layout">
        <div className="flow__main">

        {d.step === 0 && (
          <section aria-label="Pick missions">
            <div className="pick-grid">
              {events.map((e) => {
                const on = d.selected.includes(e.id)
                return (
                  <button key={e.id} type="button" className={`pick ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => toggle(e)}>
                    <div className="pick__top">
                      <span className={`mono pick__cat pick__cat--${e.category}`}>{e.category}</span>
                      <Stars n={e.wanted} />
                    </div>
                    <span className="mono pick__code">Mission: {e.codename}</span>
                    <h3 className="pick__name">{e.name}</h3>
                    <div className="pick__meta mono">
                      <span>{teamLabel(e)}</span><span>Day {e.day} · {e.time}</span><span>{venues[e.venue]?.name}</span>
                    </div>
                    <span className="pick__fee">{inr(e.fee)}<span className="mono" style={{ color: 'var(--muted)', marginLeft: 6 }}>{e.teamMax > 1 ? '/ team' : '/ player'}</span></span>
                    <span className="pick__check" aria-hidden="true">{on ? '✓' : ''}</span>
                  </button>
                )
              })}
            </div>
            {clashList.length > 0 && <ClashWarn list={clashList} />}
            <div className="totalbar totalbar--mobile">
              <div>
                <div className="totalbar__amt">{inr(total)}</div>
                <div className="mono totalbar__count">{d.selected.length} mission{d.selected.length === 1 ? '' : 's'} selected</div>
              </div>
              <button className="btn btn--hot" disabled={!d.selected.length} onClick={() => set({ step: 1 })}>Next: gang</button>
            </div>
          </section>
        )}

        {d.step === 1 && (
          <section aria-label="Gang details">
            <div className="panel frame">
              <div className="panel__title"><h2>Gang leader</h2><span className="mono" style={{ color: 'var(--muted)' }}>We contact this person</span></div>
              <div className="grid-2">
                {field('l-name', 'Full name', d.leader.name, (v) => setLeader('name', v), { autoComplete: 'name' })}
                {field('l-phone', 'Mobile (WhatsApp)', d.leader.phone, (v) => setLeader('phone', onlyDigits(v)), { type: 'tel', inputMode: 'numeric', pattern: '[6-9][0-9]{9}', autoComplete: 'tel-national', placeholder: '9876543210' })}
                {field('l-email', 'Email', d.leader.email, (v) => setLeader('email', v), { type: 'email', autoComplete: 'email' })}
                {field('l-college', 'College / University', d.leader.college, (v) => setLeader('college', v))}
                {field('l-course', 'Course / Branch', d.leader.course, (v) => setLeader('course', v), { placeholder: 'B.Tech CSE' })}
                <div className="field">
                  <label htmlFor="l-year">Year</label>
                  <select id="l-year" className="input" value={d.leader.year} onChange={(ev) => setLeader('year', ev.target.value)} aria-invalid={!!errors['l-year']}>
                    <option value="">Select</option>
                    {['1st year', '2nd year', '3rd year', '4th year', '5th year', 'Postgraduate', 'Other'].map((y) => <option key={y}>{y}</option>)}
                  </select>
                  {err('l-year')}
                </div>
                {field('l-city', 'City', d.leader.city, (v) => setLeader('city', v), { autoComplete: 'address-level2' })}
              </div>
            </div>

            {clashList.length > 0 && <ClashWarn list={clashList} />}

            {selectedEvents.map((e) => {
              const t = d.teams[e.id]
              const canAdd = t.members.length + 1 < e.teamMax
              const canRemove = t.members.length + 1 > e.teamMin
              return (
                <div className="panel frame" key={e.id}>
                  <div className="panel__title">
                    <h3>{e.name}</h3>
                    <span className="mono" style={{ color: 'var(--muted)' }}>{teamLabel(e)} · {inr(e.fee)}</span>
                  </div>
                  {e.teamMax > 1 && (
                    <div style={{ marginBottom: 8 }}>
                      {field(`t-${e.id}`, 'Gang name', t.teamName, (v) => setTeam(e.id, { teamName: v }), { placeholder: 'e.g. Sunset Syndicate' })}
                    </div>
                  )}
                  <div className="member">
                    <span className="mono member__tag">Lead</span>
                    <div className="field"><label>Name</label><input className="input" readOnly value={d.leader.name || 'Team leader (above)'} /></div>
                    <div className="field"><label>Mobile</label><input className="input" readOnly value={d.leader.phone} /></div>
                    <span />
                  </div>
                  {t.members.map((m, i) => (
                    <div className="member" key={i}>
                      <span className="mono member__tag">P{i + 2}</span>
                      <div className="field">
                        <label htmlFor={`m-${e.id}-${i}-name`}>Player name</label>
                        <input id={`m-${e.id}-${i}-name`} className="input" value={m.name} aria-invalid={!!errors[`m-${e.id}-${i}-name`]} onChange={(ev) => setMember(e.id, i, 'name', ev.target.value)} />
                        {err(`m-${e.id}-${i}-name`)}
                      </div>
                      <div className="field">
                        <label htmlFor={`m-${e.id}-${i}-phone`}>Mobile</label>
                        <input id={`m-${e.id}-${i}-phone`} className="input" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" autoComplete="off" placeholder="9876543210" value={m.phone} aria-invalid={!!errors[`m-${e.id}-${i}-phone`]} onChange={(ev) => setMember(e.id, i, 'phone', onlyDigits(ev.target.value))} />
                        {err(`m-${e.id}-${i}-phone`)}
                      </div>
                      {canRemove && i + 2 > e.teamMin
                        ? <button type="button" className="linkbtn linkbtn--danger" onClick={() => setTeam(e.id, { members: t.members.filter((_, j) => j !== i) })}>Remove</button>
                        : <span />}
                    </div>
                  ))}
                  {canAdd && (
                    <button type="button" className="linkbtn" onClick={() => setTeam(e.id, { members: [...t.members, { name: '', phone: '' }] })}>
                      + Add {t.members.length + 1 >= e.teamMin ? 'substitute / extra player' : 'player'}
                    </button>
                  )}
                </div>
              )
            })}

            <div className="flow__nav">
              <button className="btn" onClick={() => set({ step: 0 })}>Back</button>
              <button className="btn btn--hot" onClick={() => validateCrew() && set({ step: 2 })}>Next: review</button>
            </div>
          </section>
        )}

        {d.step === 2 && (
          <section aria-label="Review and pay">
            <div className="panel frame">
              <div className="panel__title"><h2>Review</h2><button className="linkbtn" onClick={() => set({ step: 1 })}>Edit details</button></div>
              <dl className="ticket__kv mono" style={{ marginBottom: 12 }}>
                <div><dt>Leader</dt><dd>{d.leader.name}</dd></div>
                <div><dt>Mobile</dt><dd>{d.leader.phone}</dd></div>
                <div><dt>Email</dt><dd>{d.leader.email}</dd></div>
                <div><dt>College</dt><dd>{d.leader.college}</dd></div>
              </dl>
              <div className="lines">
                {selectedEvents.map((e) => (
                  <div className="line" key={e.id}>
                    <span className="line__name">{e.name}</span>
                    <span>{inr(e.fee)}</span>
                    <span className="line__sub">
                      {e.teamMax > 1 ? `${d.teams[e.id].teamName} · ` : ''}{d.teams[e.id].members.length + 1} player{d.teams[e.id].members.length ? 's' : ''} · Day {e.day}, {e.time} · {venues[e.venue]?.name}
                    </span>
                  </div>
                ))}
                <div className="line line--total"><span>Total</span><span className="sunset-text">{inr(total)}</span></div>
              </div>
            </div>
            {clashList.length > 0 && <ClashWarn list={clashList} />}
            <label className="consent">
              <input type="checkbox" checked={d.consent} onChange={(ev) => { set({ consent: ev.target.checked }); setErrors({}) }} />
              <span>I have read the rules of each mission. I understand fees are non-refundable unless the organisers cancel an event, and that my registration is confirmed only after payment is verified.</span>
            </label>
            {err('consent')}
            {failMsg && <div className="notice notice--err" style={{ marginTop: 14 }}>{failMsg}</div>}
            <div className="flow__nav">
              <button className="btn" onClick={() => set({ step: 1 })}>Back</button>
              <button className="btn btn--hot" disabled={busy} onClick={submit}>{busy ? 'Creating…' : `Continue to payment · ${inr(total)}`}</button>
            </div>
            <p className="mono" style={{ color: 'var(--muted)', marginTop: 18 }}>Already registered? <Link to="/pass">Find your pass</Link></p>
          </section>
        )}
        </div>
        <MissionBrief events={selectedEvents} total={total} step={d.step} onNext={() => set({ step: 1 })} />
        </div>
      </div>
    </main>
  )
}

export function SunsetArt({ className = '' }) {
  // code-drawn mini key art: dusk sky, striped sun, skyline, sea, palms
  const bld = [[0, 34], [14, 52], [26, 40], [36, 66], [48, 30], [58, 46], [70, 24], [82, 58], [94, 38], [108, 48], [122, 28], [134, 62], [148, 36], [160, 50], [172, 30], [186, 44], [198, 34]]
  return (
    <svg className={`sunset-art ${className}`} viewBox="0 0 220 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sa-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#26103f" /><stop offset=".45" stopColor="#7a1f6e" /><stop offset=".8" stopColor="#e8466f" /><stop offset="1" stopColor="#ff9a4a" /></linearGradient>
        <linearGradient id="sa-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9a0" /><stop offset=".6" stopColor="#ff8a4a" /><stop offset="1" stopColor="#ff3d8b" /></linearGradient>
        <linearGradient id="sa-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a1a5e" /><stop offset="1" stopColor="#0b0614" /></linearGradient>
        <clipPath id="sa-cut"><rect x="0" y="0" width="220" height="62" /><rect x="0" y="64" width="220" height="3" /><rect x="0" y="69.5" width="220" height="2.5" /><rect x="0" y="74.5" width="220" height="2" /></clipPath>
      </defs>
      <rect width="220" height="90" fill="url(#sa-sky)" />
      <circle cx="110" cy="66" r="30" fill="url(#sa-sun)" clipPath="url(#sa-cut)" />
      {bld.map(([x, h], i) => <rect key={i} x={x} y={90 - h * 0.55} width="11" height={h * 0.55} fill="#2a0f3f" />)}
      {bld.filter((_, i) => i % 3 === 0).map(([x, h], i) => <rect key={'w' + i} x={x + 3} y={90 - h * 0.55 + 4} width="2" height="2" fill="#ffc56b" opacity=".8" />)}
      <rect y="90" width="220" height="40" fill="url(#sa-sea)" />
      {[94, 99, 105, 112, 120].map((y, i) => <rect key={y} x={110 - (20 + i * 6)} y={y} width={(20 + i * 6) * 2} height={1.4 - i * 0.15} fill="#ff7a3d" opacity={0.7 - i * 0.12} />)}
      <g fill="#13061f">
        <path d="M14 130 Q20 100 30 70 L32 70 Q24 102 20 130Z" />
        <path d="M31 70 q-14 -2 -26 10 q14 -6 26 -8Z M31 70 q12 -6 26 2 q-14 -2 -26 0Z M31 70 q-6 -10 -20 -12 q12 4 20 12Z M31 70 q4 -12 18 -14 q-12 6 -18 14Z M31 70 q-2 8 -10 20 q6 -10 10 -20Z" />
        <path d="M206 130 Q200 104 192 82 L194 82 Q202 104 212 130Z" />
        <path d="M193 82 q-14 -4 -26 6 q14 -4 26 -4Z M193 82 q12 -6 24 0 q-12 -2 -24 0Z M193 82 q-4 -10 -18 -12 q10 4 18 12Z M193 82 q4 -10 16 -12 q-10 6 -16 12Z" />
      </g>
    </svg>
  )
}

function MissionBrief({ events: list, total, step, onNext }) {
  const wanted = list.length ? Math.max(...list.map((e) => e.wanted)) : 0
  return (
    <aside className="brief frame" aria-label="Mission brief">
      <div className="brief__art">
        <SunsetArt />
        <span className="mono brief__tag">Mission brief</span>
      </div>
      <div className="brief__body">
        <div className="brief__row mono"><span>Wanted level</span><Stars n={wanted} /></div>
        {list.length === 0 && <p className="brief__empty">No missions picked yet. Tap a card to add it to your run.</p>}
        <ul className="brief__list">
          {list.map((e) => (
            <li key={e.id}>
              <span><strong>{e.name}</strong><small className="mono">Day {e.day} · {e.time}</small></span>
              <span className="mono">{inr(e.fee)}</span>
            </li>
          ))}
        </ul>
        <div className="brief__total"><span className="mono">Total due</span><span className="display sunset-text">{inr(total)}</span></div>
        {step === 0 && <button className="btn btn--hot brief__cta" disabled={!list.length} onClick={onNext}>Next: gang</button>}
        <p className="brief__note">Pay by UPI after review. Fees are per team, or per player for solo events.</p>
      </div>
    </aside>
  )
}

function newTeam(e) {
  return { teamName: '', members: Array.from({ length: Math.max(0, e.teamMin - 1) }, () => ({ name: '', phone: '' })) }
}

function ClashWarn({ list }) {
  return (
    <div className="notice" role="status" style={{ marginTop: 16 }}>
      <strong>Timing clash:</strong>{' '}
      {list.map(([a, b]) => `${a.name} and ${b.name} overlap on Day ${a.day}`).join('; ')}. You can still register, but one player cannot be in both at once.
    </div>
  )
}
