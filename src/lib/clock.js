// Intro timeline clock. `?t=<ms>` freezes the intro at that moment so the
// screenshot harness gets deterministic stills. `?intro=1` forces the intro
// even if it was already seen this session; `?intro=0` skips it.
const params = new URLSearchParams(location.search)
export const frozenT = params.has('t') ? Number(params.get('t')) : null
export const isFrozen = frozenT !== null
export const scriptedTrail = params.get('trail') === '1'
const t0 = performance.now()
export const now = () => (isFrozen ? frozenT : performance.now() - t0)

export const reducedMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function shouldPlayIntro() {
  if (params.get('intro') === '0') return false
  if (params.get('intro') === '1' || isFrozen) return true
  if (location.pathname !== '/') return false // deep links skip the intro
  try { return !sessionStorage.getItem('tg27.introSeen') } catch { return true }
}
export function markIntroSeen() { try { sessionStorage.setItem('tg27.introSeen', '1') } catch {} }

// Intro phases (ms). Shared by the loader DOM and the WebGL reveal.
export const T = {
  loaderEnd: 2600,    // progress hits 100%
  loaderOut: 3000,    // loader text gone
  rippleStart: 2700,  // liquid starts rising in the dark
  revealStart: 3500,  // sunset bleeds through
  revealEnd: 4700,
  hudStart: 4300,     // HUD stagger begins
  done: 5600,
}
