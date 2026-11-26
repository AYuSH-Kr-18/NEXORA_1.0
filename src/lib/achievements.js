// Xbox-style achievements, once per browser session. unlock('id') shows a small popup.
import { useSyncExternalStore } from 'react'
export const ACHIEVEMENTS = {
  tour: { title: 'Took the tour', desc: 'Scrolled past the opening credits.' },
  shopper: { title: 'Window shopper', desc: 'Opened three mission pages.' },
  cheat: { title: 'Cheater (respectfully)', desc: 'Typed a cheat code. We saw that.' },
  owl: { title: 'Night owl', desc: 'Browsing the heist after 11 PM.' },
  paperwork: { title: 'Paperwork', desc: 'Started a registration. Real criminals fill forms.' },
  legend: { title: 'Most wanted', desc: 'Hit five stars. The city knows your name.' },
}
const KEY = 'tg27.ach'
const got = new Set(JSON.parse((() => { try { return sessionStorage.getItem(KEY) } catch { return null } })() || '[]'))
let state = { last: null }
const subs = new Set()
export function unlock(id) {
  if (got.has(id) || !ACHIEVEMENTS[id]) return
  got.add(id); try { sessionStorage.setItem(KEY, JSON.stringify([...got])) } catch {}
  state = { last: { id, ...ACHIEVEMENTS[id], at: Date.now() } }; subs.forEach((f) => f())
}
export const useAchievement = () => useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => state)
export const unlockedCount = () => got.size
