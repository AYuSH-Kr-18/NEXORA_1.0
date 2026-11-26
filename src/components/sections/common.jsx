import { useEffect, useRef, useState } from 'react'

export const isFrozenDoc = () => typeof document !== 'undefined' && document.documentElement.classList.contains('frozen')
export const prefersReduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function Stars({ n, total = 5 }) {
  return (
    <span className="stars" aria-label={`Difficulty ${n} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < n ? 'on' : 'off'} aria-hidden="true">★</span>
      ))}
    </span>
  )
}

// true once the element has entered the viewport (or immediately when frozen / reduced motion)
export function useInView(opts = { threshold: 0.2 }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(() => isFrozenDoc() || prefersReduced())
  useEffect(() => {
    if (seen || !ref.current) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, opts)
    io.observe(ref.current)
    return () => io.disconnect()
  }, [seen])
  return [ref, seen]
}

export function SectionHead({ kicker, title, script, children }) {
  return (
    <header className="sec-head">
      <p className="mono sec-head__kicker"><span className="sec-head__tick" aria-hidden="true" />{kicker}<span className="sec-head__hud" aria-hidden="true" /></p>
      <h2 className="display sec-head__title">
        {title}
        {script && <span className="script sec-head__script">{script}</span>}
      </h2>
      {children && <div className="sec-head__aside">{children}</div>}
    </header>
  )
}

// ---- deterministic skyline silhouette strip (code-drawn, no images)
function rand(seed) { let a = seed >>> 0 || 1; return () => { a = (a * 16807) % 2147483647; return (a - 1) / 2147483646 } }
function skylinePaths(seed) {
  const r = rand(seed)
  let x = -10, b = '', w = '', p = ''
  while (x < 1450) {
    const bw = 26 + Math.floor(r() * 64)
    const mid = Math.abs(x - 720) / 720               // lower in the middle so it reads as a horizon
    const bh = 22 + Math.floor(Math.pow(r(), 2) * 120 * (0.45 + 0.55 * mid))
    const top = 160 - bh
    b += `M${x},160V${top}H${x + bw}V160Z`
    if (r() > 0.82) b += `M${x + bw / 2 - 1},${top}V${top - 14 - r() * 12}h2V${top}Z` // antenna
    // windows
    for (let wy = top + 8; wy < 152; wy += 9) {
      for (let wx = x + 5; wx < x + bw - 6; wx += 8) {
        if (r() > 0.86) w += `M${wx},${wy}h3v4h-3Z`
      }
    }
    // the odd palm between blocks
    if (r() > 0.86) {
      const px = x + bw + 4, ph = 50 + r() * 40
      p += `M${px},160Q${px + 4},${160 - ph / 2} ${px + 7},${160 - ph}h2Q${px + 6},${160 - ph / 2} ${px + 3},160Z`
      for (let k = 0; k < 6; k++) {
        const a = -Math.PI + (k / 5) * Math.PI, len = 16 + r() * 8
        const ex = px + 8 + Math.cos(a) * len, ey = 160 - ph + Math.sin(a) * len * 0.4 + len * 0.45
        p += `M${px + 8},${160 - ph}Q${(px + 8 + ex) / 2},${160 - ph - 8} ${ex},${ey}Q${(px + 8 + ex) / 2},${160 - ph - 2} ${px + 8},${160 - ph + 2}Z`
      }
      x += 14
    }
    x += bw + (r() > 0.7 ? 6 : 0)
  }
  return { b, w, p }
}

export function Skyline({ seed = 7, className = '' }) {
  const { b, w, p } = skylinePaths(seed)
  return (
    <svg className={`skyline ${className}`} viewBox="0 0 1440 160" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path className="skyline__far" d={skylinePaths(seed + 11).b} transform="translate(0 18) scale(1 0.9)" />
      <path className="skyline__b" d={b + p} />
      <path className="skyline__w" d={w} />
    </svg>
  )
}

// a sunset horizon strip used as a break between sections
export function HorizonBreak({ seed }) {
  return (
    <div className="horizon" aria-hidden="true">
      <div className="horizon__sky" />
      <div className="horizon__sun" />
      <Skyline seed={seed} />
    </div>
  )
}

// small HUD glyph per mission category
export function MissionGlyph({ type }) {
  return type === 'gaming' ? (
    <svg className="glyph" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M9 10h14c4 0 6.5 3.5 7 8.5.4 4-1.6 6.5-4 6.5-2 0-3-1.4-4.4-3.4H10.4C9 23.6 8 25 6 25c-2.4 0-4.4-2.5-4-6.5C2.5 13.5 5 10 9 10Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 15v5M5.5 17.5h5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="22" cy="16" r="1.4" fill="currentColor" /><circle cx="25.5" cy="19" r="1.4" fill="currentColor" />
    </svg>
  ) : (
    <svg className="glyph" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="9" y="9" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="13" width="6" height="6" fill="currentColor" />
      <path d="M12 9V4M16 9V4M20 9V4M12 28v-5M16 28v-5M20 28v-5M9 12H4M9 16H4M9 20H4M28 12h-5M28 16h-5M28 20h-5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
