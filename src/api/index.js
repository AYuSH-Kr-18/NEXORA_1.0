// ============================================================================
//  API SEAM — the ONLY place the frontend talks to "the server".
//  Right now every function is a mock backed by localStorage so the whole flow
//  works without a backend. A backend dev replaces the bodies with fetch()
//  calls and keeps the same inputs/outputs (documented in cook/ARCHITECTURE.md).
// ============================================================================
import { getEvent } from '../data/event.js'

const KEY = 'tg27.registrations'
const API_BASE = import.meta.env.VITE_API_BASE || '' // e.g. https://api.yourfest.in

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const load = () => JSON.parse(localStorage.getItem(KEY) || '{}')
const save = (all) => localStorage.setItem(KEY, JSON.stringify(all))

function newId() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)]
  return 'TG27-' + s
}

/**
 * Create a registration (status: PENDING_PAYMENT).
 * input:  { leader: {name,email,phone,college,course,year,city},
 *           entries: [{ eventId, teamName, members: [{name, phone}] }] }
 * output: { id, amount, status, createdAt, ...input }
 */
export async function createRegistration(input) {
  // TODO(backend): return (await fetch(`${API_BASE}/registrations`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(input)})).json()
  await wait(500)
  const amount = input.entries.reduce((s, en) => s + (getEvent(en.eventId)?.fee || 0), 0)
  const reg = { id: newId(), amount, status: 'PENDING_PAYMENT', createdAt: new Date().toISOString(), ...input }
  const all = load(); all[reg.id] = reg; save(all)
  return reg
}

/**
 * Submit payment proof (status -> PAYMENT_SUBMITTED, organisers verify later).
 * input:  { id, utr: '12 digits', screenshot: File|null }
 * output: the updated registration
 * Real backend: send multipart/form-data with the screenshot file.
 */
export async function submitPayment({ id, utr, screenshot }) {
  // TODO(backend): const fd = new FormData(); fd.append('utr', utr); fd.append('screenshot', screenshot)
  //                return (await fetch(`${API_BASE}/registrations/${id}/payment`, {method:'POST', body: fd})).json()
  await wait(700)
  const all = load()
  const reg = all[id]
  if (!reg) throw new Error('Registration not found')
  reg.payment = { utr, screenshotName: screenshot?.name || null, submittedAt: new Date().toISOString() }
  reg.status = 'PAYMENT_SUBMITTED'
  save(all)
  return reg
}

/**
 * Fetch one registration by id.  output: registration or null
 * statuses: PENDING_PAYMENT | PAYMENT_SUBMITTED | VERIFIED | REJECTED
 */
export async function getRegistration(id) {
  // TODO(backend): GET `${API_BASE}/registrations/${id}`
  await wait(200)
  return load()[String(id).trim().toUpperCase()] || null
}

/** Find registrations by leader phone or email. output: registration[] */
export async function findRegistrations(query) {
  // TODO(backend): GET `${API_BASE}/registrations?q=${encodeURIComponent(query)}`
  await wait(300)
  const q = String(query).trim().toLowerCase()
  return Object.values(load()).filter(
    (r) => r.id.toLowerCase() === q || r.leader.phone.replace(/\D/g, '').endsWith(q.replace(/\D/g, '')) && q.replace(/\D/g, '').length >= 10 || r.leader.email.toLowerCase() === q,
  )
}

export { API_BASE }
