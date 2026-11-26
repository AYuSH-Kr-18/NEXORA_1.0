import { fest } from '../../data/event.js'
import { useInView } from './common.jsx'

export default function Briefing() {
  const [ref, seen] = useInView({ threshold: 0.25 })
  let w = 0
  return (
    <section id="briefing" className={`sec sec--clear briefing ${seen ? 'is-in' : ''}`} ref={ref}>
      <div className="wrap briefing__inner">
        <p className="mono briefing__label">Mission briefing</p>
        {fest.about.map((para, pi) => (
          <p key={pi} className={`briefing__para ${pi === 0 ? 'briefing__para--lead' : ''}`}>
            {para.split(' ').map((word, i) => (
              <span key={i} className="briefing__w" style={{ '--i': w++ }}>{word} </span>
            ))}
          </p>
        ))}
        <dl className="briefing__meta frame">
          <div><dt className="mono">When</dt><dd className="mono">{fest.dateLabel}</dd></div>
          <div><dt className="mono">Organised by</dt><dd className="mono">{fest.organiser}</dd></div>
          <div><dt className="mono">Where</dt><dd className="mono">{fest.college}</dd></div>
          <div><dt className="mono">Edition</dt><dd className="mono">{fest.edition}</dd></div>
        </dl>
      </div>
    </section>
  )
}
