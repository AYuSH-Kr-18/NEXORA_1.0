// Code-drawn palm silhouettes. Deterministic shapes from a seed.
function rng(seed) { let a = seed; return () => { a = (a * 16807) % 2147483647; return (a - 1) / 2147483646 } }

function palm(seed, x0, h, lean) {
  const r = rng(seed)
  // trunk: curved quad with taper
  const topX = x0 + lean, topY = 1000 - h
  const cx = x0 + lean * 0.15, cy = 1000 - h * 0.55
  const wB = 16, wT = 7
  const trunk = `M${x0 - wB},1000 Q${cx - wB * 0.8},${cy} ${topX - wT},${topY} L${topX + wT},${topY} Q${cx + wB * 0.8},${cy} ${x0 + wB},1000 Z`
  // ring marks on trunk
  const rings = []
  for (let i = 1; i < 14; i++) {
    const t = i / 14
    const px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * topX
    const py = (1 - t) * (1 - t) * 1000 + 2 * (1 - t) * t * cy + t * t * topY
    const w = wB + (wT - wB) * t
    rings.push(`M${px - w - 1},${py} q${w + 1},${-4} ${2 * w + 2},0 v2 q${-(w + 1)},${-4} ${-(2 * w + 2)},0Z`)
  }
  // fronds
  const fronds = []
  const n = 9
  for (let i = 0; i < n; i++) {
    const a = -Math.PI + (i / (n - 1)) * Math.PI + (r() - 0.5) * 0.35
    const len = 150 + r() * 110
    const droop = 0.55 + r() * 0.5
    const ex = topX + Math.cos(a) * len, ey = topY + Math.sin(a) * len * 0.45 + len * droop * 0.55
    const mx = topX + Math.cos(a) * len * 0.5, my = topY + Math.sin(a) * len * 0.5 - 30
    // leaf as two curves with serrated edge points
    const pts = []
    const seg = 10
    for (let s = 0; s <= seg; s++) {
      const t = s / seg
      const bx = (1 - t) * (1 - t) * topX + 2 * (1 - t) * t * mx + t * t * ex
      const by = (1 - t) * (1 - t) * topY + 2 * (1 - t) * t * my + t * t * ey
      const width = Math.sin(t * Math.PI) * (26 + r() * 6) * (1 - t * 0.4)
      pts.push([bx, by, width, t])
    }
    let d = `M${topX},${topY}`
    pts.forEach(([bx, by, w, t], k) => { const jag = k % 2 ? 1 : 0.55; d += ` L${bx},${by - w * jag}` })
    for (let k = pts.length - 1; k >= 0; k--) { const [bx, by, w] = pts[k]; const jag = k % 2 ? 0.55 : 1; d += ` L${bx + 4},${by + w * jag * 0.7}` }
    fronds.push(d + 'Z')
  }
  // coconuts
  const nuts = [0, 1, 2].map((i) => `M${topX - 10 + i * 9},${topY + 10} a7,7 0 1,0 0.1,0Z`)
  return [trunk, ...rings, ...fronds, ...nuts].join(' ')
}

export default function Palms({ className = '' }) {
  return (
    <div className={`palms ${className}`} aria-hidden="true">
      <svg className="palms__l" viewBox="-40 180 520 820" preserveAspectRatio="xMinYMax meet">
        <path d={palm(11, 110, 720, 90)} />
        <path d={palm(23, 250, 560, 40)} opacity="0.92" />
      </svg>
      <svg className="palms__r" viewBox="1120 160 520 840" preserveAspectRatio="xMaxYMax meet">
        <path d={palm(37, 1500, 780, -120)} />
        <path d={palm(51, 1360, 520, -30)} opacity="0.92" />
      </svg>
    </div>
  )
}
