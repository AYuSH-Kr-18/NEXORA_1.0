import { Link, useLocation } from 'react-router-dom'
import { fest, socials } from '../data/event.js'
import './footer.css'

export default function Footer() {
  const { pathname } = useLocation()
  if (pathname !== '/') return <CompactFooter />
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__sign">
          <p className="mono footer__k">Thanks for tuning in</p>
          <p className="display footer__big">See you on<br />the <span className="sunset-text">streets</span></p>
          <p className="script footer__script">{fest.dateLabel.toLowerCase()}</p>
        </div>
        <div className="footer__cols">
          <div>
            <p className="mono footer__k">Event</p>
            <p>{fest.name} {fest.year}<br />{fest.dateLabel}<br />{fest.college}</p>
          </div>
          <div>
            <p className="mono footer__k">Jump to</p>
            <ul className="footer__links">
              <li><Link to="/#missions">Missions</Link></li>
              <li><Link to="/#schedule">Schedule</Link></li>
              <li><Link to="/#venue">Venue</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/pass">My pass</Link></li>
            </ul>
          </div>
          <div>
            <p className="mono footer__k">Social</p>
            <ul className="footer__links">
              {socials.map((s) => <li key={s.label}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label} <span className="arw" aria-hidden="true">↗</span></a></li>)}
            </ul>
          </div>
          <div>
            <p className="mono footer__k">Organised by</p>
            <p>{fest.organiser}</p>
          </div>
        </div>
        <div className="footer__base mono">
          <span>© {fest.year} {fest.organiser}</span>
          <span>Fan-made theme, not affiliated with Rockstar Games.</span>
        </div>
      </div>
    </footer>
  )
}

function CompactFooter() {
  return (
    <footer className="footer footer--compact">
      <div className="wrap">
        <div className="footer__bar">
          <Link to="/" className="footer__brand"><span className="display">{fest.name}</span><span className="script">{fest.year.slice(2)}</span></Link>
          <span className="mono footer__meta">{fest.dateLabel} · {fest.college}</span>
          <nav className="footer__inline" aria-label="Footer">
            <Link to="/#missions">Missions</Link>
            <Link to="/#schedule">Schedule</Link>
            <Link to="/#faq">FAQ</Link>
            <Link to="/pass">My pass</Link>
            {socials.map((s) => <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>)}
          </nav>
        </div>
        <div className="footer__base mono">
          <span>© {fest.year} {fest.organiser}</span>
          <span>Fan-made theme, not affiliated with Rockstar Games.</span>
        </div>
      </div>
    </footer>
  )
}
