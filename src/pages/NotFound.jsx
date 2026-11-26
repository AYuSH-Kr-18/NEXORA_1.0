import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <main className="page-pad wrap" style={{ minHeight: '70vh', display: 'grid', placeContent: 'center', textAlign: 'center', gap: 18 }}>
      <p className="mono" style={{ color: 'var(--gold)' }}>Mission failed</p>
      <h1 className="display sunset-text" style={{ fontSize: 'clamp(64px, 14vw, 180px)', margin: 0 }}>Wasted</h1>
      <p style={{ color: 'var(--muted)' }}>This page is off the map.</p>
      <div><Link className="btn" to="/">Back to base</Link></div>
    </main>
  )
}
