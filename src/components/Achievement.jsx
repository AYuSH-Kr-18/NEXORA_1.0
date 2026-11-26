// Small achievement popup (bottom-left, above the HUD) + cheat codes + page-visit tracking.
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAchievement, unlock, ACHIEVEMENTS, unlockedCount } from '../lib/achievements.js'
import { raise, useWanted } from '../lib/wanted.js'

import './achievement.css'

const CHEATS = ['lockin', 'booyah', 'heist', 'robowar', 'goggleson']

export default function Achievement() {
  const { last } = useAchievement()
  const { level } = useWanted()
  const [show, setShow] = useState(null)
  const [cheat, setCheat] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => { if (!last) return; setShow(last); const t = setTimeout(() => setShow(null), 3800); return () => clearTimeout(t) }, [last])
  useEffect(() => { if (level >= 5) unlock('legend') }, [level])
  useEffect(() => { const h = new Date().getHours(); if (h >= 23 || h < 4) setTimeout(() => unlock('owl'), 9000) }, [])
  // mission page visits
  useEffect(() => {
    if (!pathname.startsWith('/events/')) return
    const k = 'tg27.seen'; let seen = []
    try { seen = JSON.parse(sessionStorage.getItem(k) || '[]') } catch {}
    if (!seen.includes(pathname)) seen.push(pathname)
    try { sessionStorage.setItem(k, JSON.stringify(seen)) } catch {}
    if (seen.length >= 3) unlock('shopper')
  }, [pathname])
  useEffect(() => { if (pathname === '/register') unlock('paperwork') }, [pathname])
  // cheat codes: type a code anywhere (not inside inputs)
  useEffect(() => {
    let buf = ''
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select')) return
      if (e.key.length !== 1) return
      buf = (buf + e.key.toLowerCase()).slice(-12)
      if (CHEATS.some((c) => buf.endsWith(c))) {
        buf = ''; unlock('cheat'); raise(Math.min(5, level + 1))
        setCheat(true); setTimeout(() => setCheat(false), 1400)
      }
    }
    addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey)
  }, [level])

  return (
    <>
      {cheat && <div className="cheat" aria-hidden="true"><span>Cheat activated</span></div>}
      {show && (
        <div className="ach" role="status" key={show.at}>
          <span className="ach__badge">★</span>
          <span className="ach__txt"><b>Achievement unlocked</b><span>{show.title}</span><i>{show.desc}</i></span>
          <span className="ach__n">{unlockedCount()}/{Object.keys(ACHIEVEMENTS).length}</span>
        </div>
      )}
    </>
  )
}
