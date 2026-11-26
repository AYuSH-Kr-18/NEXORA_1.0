// GTA-style wanted level (0-5 stars) earned by exploring the site. Session only.
import { useSyncExternalStore } from 'react'
const KEY = 'tg27.wanted'
const MSG = {
  1: 'The city noticed you.',
  2: 'Casing the job.',
  3: 'You started a heist.',
  4: 'The cops are on to you.',
  5: 'Maximum wanted level. See you at the fest.',
}
let state = { level: Number((() => { try { return sessionStorage.getItem(KEY) } catch { return 0 } })() || 0), event: null }
const subs = new Set()
const emit = () => subs.forEach((f) => f())

/** Raise the wanted level to `to` (never lowers it). */
export function raise(to) {
  if (to <= state.level) return
  try { sessionStorage.setItem(KEY, String(to)) } catch {}
  state = { level: to, event: { kind: 'wanted', level: to, msg: MSG[to], id: Date.now() } }
  emit()
}
/** Show a red/blue "BUSTED!" toast (used for form errors). */
export function busted(msg) {
  state = { ...state, event: { kind: 'busted', msg, id: Date.now() } }
  emit()
}
export const useWanted = () => useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => state)
