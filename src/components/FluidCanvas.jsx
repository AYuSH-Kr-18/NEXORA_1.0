import { useEffect, useRef, useState } from 'react'
import { createFluid } from '../gl/fluid.js'
import { now, isFrozen, frozenT, scriptedTrail, reducedMotion } from '../lib/clock.js'
import './fluid.css'

// Fixed full-screen WebGL background. Falls back to a CSS sunset if WebGL2 is
// missing, and to a still frame when the user prefers reduced motion.
export default function FluidCanvas({ intro, revealed }) {
  const ref = useRef(null)
  const [ok, setOk] = useState(true)
  useEffect(() => {
    let fluid = null
    try { fluid = createFluid(ref.current, { intro }) } catch (e) { console.warn('WebGL fallback', e) }
    if (!fluid) { setOk(false); return }
    window.__fluid = fluid
    const measure = () => {
      const el = document.querySelector('.hero__title')
      if (!el) return fluid.setClear([0, 0, 0, 0])
      const r = el.getBoundingClientRect(), W = innerWidth, Hh = innerHeight
      fluid.setClear([r.left / W, 1 - r.bottom / Hh, r.right / W, 1 - r.top / Hh])
    }
    measure(); document.fonts?.ready.then(measure)
    const onResize = () => { fluid.resize(); measure() }
    const onScroll = () => { fluid.setScroll(Math.min(1, scrollY / innerHeight)); measure() }
    addEventListener('resize', onResize); addEventListener('scroll', onScroll, { passive: true }); onScroll()
    if (isFrozen) document.fonts.ready.then(() => { measure(); fluid.renderAt(frozenT, { trail: scriptedTrail }) })
    else if (reducedMotion) fluid.renderAt(intro ? 7000 : 2000)
    else fluid.start(now)
    return () => { removeEventListener('resize', onResize); removeEventListener('scroll', onScroll); fluid.destroy() }
  }, [intro])
  return (
    <div className="fluid" aria-hidden="true">
      {ok ? <canvas ref={ref} className="fluid__canvas" /> : <div className={`fluid__fallback ${revealed ? 'is-revealed' : ''}`} />}
    </div>
  )
}
