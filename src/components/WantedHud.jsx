import { useEffect, useState } from 'react'
import { useWanted } from '../lib/wanted.js'
import { useIntro } from '../lib/intro.js'
import './wanted.css'

// Wanted stars (top-right), police-light edge flash and a toast on every change.
export default function WantedHud() {
  const { level, event } = useWanted()
  const { hud } = useIntro()
  const [shown, setShown] = useState(null)
  useEffect(() => {
    if (!event) return
    setShown(event)
    const id = setTimeout(() => setShown(null), event.kind === 'busted' ? 2600 : 3200)
    return () => clearTimeout(id)
  }, [event])
  if (!hud) return null
  return (
    <>
      {level > 0 && (
        <div className={`wanted ${shown?.kind === 'wanted' ? 'is-up' : ''}`} role="img" aria-label={`Wanted level ${level} of 5`}>
          {[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= level ? 'on' : ''}>★</span>)}
        </div>
      )}
      {shown && <div key={shown.id} className={`police police--${shown.kind}`} aria-hidden="true" />}
      {shown && (
        <div key={'t' + shown.id} className={`wtoast wtoast--${shown.kind}`} role="status">
          {shown.kind === 'busted' ? (
            <><b className="display">Busted!</b><span>{shown.msg}</span></>
          ) : (
            <><b className="wtoast__stars">{'★'.repeat(shown.level)}<i>{'★'.repeat(5 - shown.level)}</i></b><b className="display">{shown.level === 5 ? 'Maximum wanted level' : 'Wanted level up'}</b><span>{shown.msg}</span></>
          )}
        </div>
      )}
    </>
  )
}
