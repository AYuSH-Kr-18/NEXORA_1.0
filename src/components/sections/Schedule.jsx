import { useState } from 'react'
import { Link } from 'react-router-dom'
import { schedule, venues } from '../../data/event.js'
import { SectionHead } from './common.jsx'

export default function Schedule() {
  const [day, setDay] = useState(schedule[0].day)
  const cur = schedule.find((d) => d.day === day)
  const onKey = (e) => {
    const i = schedule.findIndex((d) => d.day === day)
    if (e.key === 'ArrowRight') setDay(schedule[(i + 1) % schedule.length].day)
    if (e.key === 'ArrowLeft') setDay(schedule[(i - 1 + schedule.length) % schedule.length].day)
  }
  return (
    <section id="schedule" className="sec schedule">
      <div className="wrap">
        <SectionHead kicker="Timings" title="The" script="heist plan">
          <div className="tabs" role="tablist" aria-label="Choose day" onKeyDown={onKey}>
            {schedule.map((d) => (
              <button key={d.day} role="tab" id={`day-tab-${d.day}`} aria-controls="day-panel" aria-selected={day === d.day} tabIndex={day === d.day ? 0 : -1}
                className={`tab mono ${day === d.day ? 'is-active' : ''}`} onClick={() => setDay(d.day)}>
                Day {d.day} <span className="tab__sub">{d.date}</span>
              </button>
            ))}
          </div>
        </SectionHead>
        <ol className="timeline" id="day-panel" role="tabpanel" aria-labelledby={`day-tab-${day}`}>
          {cur.items.map((it, i) => (
            <li key={i} className="timeline__row">
              <time className="display timeline__time">{it.time}</time>
              <span className="timeline__dot" aria-hidden="true" />
              <div className="timeline__body">
                <p className="timeline__title">{it.event ? <Link to={`/events/${it.event}`}>{it.title} <span className="arw" aria-hidden="true">↗</span></Link> : it.title}</p>
                <p className="mono timeline__venue">{venues[it.venue]?.name} · {venues[it.venue]?.where}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
