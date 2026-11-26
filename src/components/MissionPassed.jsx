// GTA San Andreas-style "mission passed! respect ++": one centred graphic (both lines laid out
// together so they never overlap), smooth fade in / hold / fade out, background blurs behind it.
import { useEffect } from 'react'

export default function MissionPassed({ onDone }) {
  useEffect(() => { const t = setTimeout(() => onDone?.(), 4400); return () => clearTimeout(t) }, [])
  return (
    <div className="mp" role="status" aria-label="Mission passed! Respect plus plus" onClick={onDone}>
      <img className="mp__img" src="/mission-passed.svg" alt="" draggable="false" />
      <p className="mp__s">Proof submitted · verification within 24 hours</p>
    </div>
  )
}
