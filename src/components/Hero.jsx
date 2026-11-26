import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fest } from '../data/event.js'
import { now, isFrozen, frozenT, T, shouldPlayIntro, markIntroSeen, reducedMotion } from '../lib/clock.js'
import { setIntro } from '../lib/intro.js'
import FluidCanvas from './FluidCanvas.jsx'
import Loader from './Loader.jsx'
import Palms from './Palms.jsx'
import { unlock } from '../lib/achievements.js'
import './hero.css'

function useCountdown(iso, frozen) {
  const target = new Date(iso).getTime()
  const [n, setN] = useState(() => (frozen ? target - 86 * 864e5 - 4 * 36e5 - 1234e3 : Date.now()))
  useEffect(() => { if (frozen) return; const id = setInterval(() => setN(Date.now()), 1000); return () => clearInterval(id) }, [frozen])
  const ms = Math.max(0, target - (frozen ? target - 86 * 864e5 - 4 * 36e5 - 1234e3 : n))
  const d = Math.floor(ms / 864e5), hh = Math.floor(ms / 36e5) % 24, mm = Math.floor(ms / 6e4) % 60, ss = Math.floor(ms / 1e3) % 60
  const p = (x) => String(x).padStart(2, '0')
  return `${d}D ${p(hh)}H ${p(mm)}M ${p(ss)}S`
}

export default function Hero() {
  const [intro] = useState(() => shouldPlayIntro() && !reducedMotion)
  const [t, setT] = useState(() => (intro ? (isFrozen ? frozenT : 0) : 1e9))
  const [skipped, setSkipped] = useState(false)
  const heroRef = useRef(null)
  const countdown = useCountdown(fest.startsAt, isFrozen)

  // drive the intro timeline
  useEffect(() => {
    if (!intro || isFrozen) return
    let raf
    const tick = () => { const v = now(); setT(v); if (v < T.done + 200) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [intro])
  const tt = skipped ? 1e9 : t
  const hudIn = tt >= T.hudStart
  useEffect(() => { setIntro({ playing: tt < T.done, hud: hudIn }) }, [hudIn, tt < T.done])
  useEffect(() => { if (tt >= T.done) markIntroSeen() }, [tt >= T.done])
  useEffect(() => () => setIntro({ playing: false, hud: true }), [])
  useEffect(() => {
    document.body.style.overflow = tt < T.hudStart ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [tt < T.hudStart])

  // scroll: title drifts and fades
  useEffect(() => {
    const el = heroRef.current
    const on = () => { const k = Math.min(1, scrollY / innerHeight); el.style.setProperty('--k', k.toFixed(3)); if (k > 0.8) unlock('tour') }
    on(); addEventListener('scroll', on, { passive: true }); return () => removeEventListener('scroll', on)
  }, [])

  const skip = () => { setSkipped(true); markIntroSeen() }

  return (
    <section className={`hero ${hudIn ? 'is-in' : ''}`} ref={heroRef} aria-label={`${fest.name} ${fest.year}`}>
      <FluidCanvas intro={intro && !skipped} revealed={tt >= T.revealStart} />
      {intro && tt < T.loaderOut + 400 && <Loader t={tt} onSkip={skip} />}

      {new URLSearchParams(location.search).get('bg') !== 'b' && <Palms className={tt >= T.revealEnd - 300 ? 'is-in' : ''} />}

      <div className="hero__inner">
        <h1 className="hero__title">
          <span className="hero__line display">{'TECHNO'.split('').map((c, i) => <span key={i} style={{ '--i': i }}>{c}</span>)}</span>
          <span className="hero__line display">{'GAMING'.split('').map((c, i) => <span key={i} style={{ '--i': i + 6 }}>{c}</span>)}</span>
          <span className="hero__script script">{fest.edition}</span>
          <span className="sr-only">{fest.year}</span>
        </h1>

        <div className="hero__strip">
          <i className="hero__corner hero__corner--l" />
          {fest.heroInfo.map((x, i) => (
            <div key={x.k} className="hero__info" style={{ '--d': i + 3 }}>
              <span className="mono hero__k">{x.k}</span>
              <span className="mono hero__v">{i === 0 && <b className="hero__dot" />}{x.v}</span>
            </div>
          ))}
          <i className="hero__corner hero__corner--r" />
        </div>
      </div>

      <div className="hero__bl hud-fade" style={{ '--d': 7 }}>
        <a href="#briefing" className="hero__down" aria-label="Scroll to briefing">
          <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 4v15M5 12l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
        </a>
        <p className="mono">{fest.tagline}</p>
      </div>

      <div className="hero__br hud-fade" style={{ '--d': 8 }}>
        <div className="hero__count frame">
          <span className="mono hero__k">Starts in</span>
          <span className="mono hero__cd">{countdown}</span>
          <span className="stars mono" aria-label="Wanted level 3 of 5">★★★<span className="off">★★</span></span>
        </div>
        <div className="hero__ctas">
          <Link to="/register" className="btn btn--hot">Start the heist</Link>
          <a href="#missions" className="btn">View missions ↓</a>
        </div>
      </div>
    </section>
  )
}
