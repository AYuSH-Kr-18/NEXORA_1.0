import { useEffect, useState } from 'react'
import { events, inr, prizeTotal, totalPrizePool } from '../../data/event.js'
import { SectionHead, useInView, isFrozenDoc, prefersReduced } from './common.jsx'

function useCountUp(target, run) {
  const instant = isFrozenDoc() || prefersReduced()
  const [v, setV] = useState(instant ? target : 0)
  useEffect(() => {
    if (!run || instant) return
    let raf, t0
    const step = (t) => {
      t0 ??= t
      const p = Math.min(1, (t - t0) / 1600)
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [run])
  return v
}

export default function Prizes() {
  const [ref, seen] = useInView({ threshold: 0.3 })
  const v = useCountUp(totalPrizePool, seen)
  const sorted = [...events].sort((a, b) => prizeTotal(b) - prizeTotal(a))
  return (
    <section id="prizes" className="sec prizes">
      <div className="wrap">
        <SectionHead kicker="Total payout" title="The big" script="score" />
        <div className="prizes__cash frame" ref={ref}>
          <span className="mono prizes__cash-label">Prize pool</span>
          <p className="display prizes__cash-value" aria-label={inr(totalPrizePool)}>
            <span className="prizes__cash-sym">₹</span>{v.toLocaleString('en-IN')}
          </p>
          <span className="mono prizes__cash-sub">Cash prizes across {events.length} missions, plus certificates for every finisher</span>
        </div>
        <div className="prizes__table" role="table" aria-label="Prizes per event">
          <div className="prizes__row prizes__row--head mono" role="row">
            <span role="columnheader">Mission</span>
            <span role="columnheader">1st</span>
            <span role="columnheader">2nd</span>
            <span role="columnheader">3rd</span>
          </div>
          {sorted.map((e) => (
            <div key={e.id} className="prizes__row" role="row">
              <span role="cell" className="prizes__ev"><b>{e.name}</b></span>
              <span role="cell" className="prizes__p1" data-k="1st">{inr(e.prizes[0])}</span>
              <span role="cell" data-k="2nd">{inr(e.prizes[1])}</span>
              <span role="cell" data-k="3rd">{inr(e.prizes[2])}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
