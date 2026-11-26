import { T } from '../lib/clock.js'

const GLYPHS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789$#*+<>/'
const h = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x) }

// Text that types itself in with scrambling glyphs, cycling through lines.
function scramble(lines, t, seed, period = 900) {
  const k = Math.floor(t / period)
  const target = lines[(k + seed) % lines.length]
  const local = (t % period) / period
  const tick = Math.floor(t / 55)
  return target.split('').map((c, i) => {
    if (c === ' ') return ' '
    const reveal = Math.min(1, local * 2.4)
    return i / target.length < reveal ? c : GLYPHS[Math.floor(h(tick * 13 + i * 7 + seed) * GLYPHS.length)]
  }).join('')
}

const MICRO = [
  { lines: ['HELLO PLAYER', 'WELCOME TO THE CITY', 'GAME ON'], pos: 'top' },
  { lines: ['SAVING GAME', 'LOADING MAP', 'SYNCING CREW'], pos: 'left' },
  { lines: ['$ 2,00,000', 'PRIZE POOL', 'CASH READY'], pos: 'right' },
  { lines: ['1010 0110', '<RAIOT/>', '0x1F 0x2A'], pos: 'bl' },
  { lines: ['SUNSET EDITION', 'FEB 2027', '★★★☆☆'], pos: 'br' },
  { lines: ['N 23°15′', 'GPS LOCK', 'SIGNAL 4/4'], pos: 'tl' },
  { lines: ['8 MISSIONS', '2 DAYS', '1 CITY'], pos: 'tr' },
]

const TIPS = [
  'TIP: Gangs that register early get the best slots.',
  'TIP: Keep your UTR number. It is your proof of payment.',
  'TIP: Raise your wanted level by exploring the city.',
]

function progress(t) {
  const p = Math.min(1, t / T.loaderEnd)
  const e = 1 - Math.pow(1 - p, 2.4)
  // small plateaus so it feels like real assets loading
  const stepped = Math.floor(e * 100 / 4) * 4 + (p > 0.98 ? 100 : 0)
  return Math.min(100, stepped)
}

export default function Loader({ t, onSkip }) {
  const out = t >= T.loaderEnd
  const pct = progress(t)
  return (
    <div className={`loader ${out ? 'is-out' : ''} ${t > T.loaderOut ? 'is-gone' : ''}`} role="status" aria-label={`Loading ${pct}%`}>
      <div className="loader__center">
        <h2 className="loader__word display">
          {'LOADING'.split('').map((c, i) => (
            <span key={i} style={{ '--i': i }}>{c}</span>
          ))}
        </h2>
        {MICRO.map((m, i) => (
          <span key={i} className={`loader__micro mono loader__micro--${m.pos}`}>{scramble(m.lines, t, i)}</span>
        ))}
      </div>
      <div className="loader__bottom">
        <button className="loader__skip mono" onClick={onSkip}>Skip intro</button>
        <p className="loader__tip mono">{TIPS[Math.floor(t / 1300) % TIPS.length]}</p>
        <span className="loader__pct mono">{pct}%</span>
        <div className="loader__line"><i style={{ transform: `scaleX(${pct / 100})` }} /></div>
      </div>
    </div>
  )
}
