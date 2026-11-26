import { raise, busted } from '../lib/wanted.js'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { getEvent, inr, payment, fest } from '../data/event.js'
import { getRegistration, submitPayment } from '../api/index.js'
import { upiLink } from '../lib/upi.js'
import { isUtr } from '../lib/validate.js'
import '../styles/flow.css'

const MAX = 5 * 1024 * 1024

export default function Pay() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reg, setReg] = useState(undefined)
  const [qr, setQr] = useState('')
  const [utr, setUtr] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState('')

  useEffect(() => { getRegistration(id).then(setReg) }, [id])
  useEffect(() => {
    if (!reg) return
    QRCode.toDataURL(upiLink(reg.amount, reg.id), { margin: 1, width: 560, color: { dark: '#0b0614', light: '#fff6ec' }, errorCorrectionLevel: 'M' }).then(setQr)
  }, [reg])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  if (reg === undefined) return <main className="flow"><div className="wrap mono">Loading mission…</div></main>
  if (reg === null) {
    return (
      <main className="flow">
        <div className="wrap flow__head">
          <span className="mono flow__kicker">Payment</span>
          <h1 className="display flow__title sunset-text">Not found</h1>
          <p className="flow__sub">We could not find registration <strong>{id}</strong> on this device.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="btn" to="/pass">Look up my registration</Link>
            <Link className="btn btn--hot" to="/register">Register</Link>
          </div>
        </div>
      </main>
    )
  }

  const link = upiLink(reg.amount, reg.id)
  const already = reg.status !== 'PENDING_PAYMENT'

  async function copy(text, what) {
    try { await navigator.clipboard.writeText(text); setCopied(what); setTimeout(() => setCopied(''), 1600) } catch {}
  }

  function pick(f) {
    const er = { ...errors }; delete er.shot
    if (!f) return
    if (!f.type.startsWith('image/')) er.shot = 'Upload an image (PNG or JPG).'
    else if (f.size > MAX) er.shot = 'Image must be under 5 MB.'
    setErrors(er)
    if (er.shot) return
    if (preview) URL.revokeObjectURL(preview)
    setFile(f); setPreview(URL.createObjectURL(f))
  }

  async function submit(ev) {
    ev.preventDefault()
    const er = {}
    const clean = utr.replace(/\s/g, '')
    if (!isUtr(clean)) er.utr = 'UTR is the 12-digit number in your UPI app\'s payment details.'
    if (!file) er.shot = 'Upload the payment screenshot.'
    setErrors(er)
    if (Object.keys(er).length) { document.getElementById(er.utr ? 'utr' : 'shot')?.focus(); busted(er.utr ? 'That UTR does not look right.' : 'Upload the payment screenshot.'); return }
    setBusy(true)
    try {
      await submitPayment({ id: reg.id, utr: clean, screenshot: file })
      raise(5)
      navigate(`/pass/${reg.id}`, { state: { passed: true } })
    } catch (e) {
      setErrors({ form: e.message || 'Could not submit. Try again.' }); setBusy(false)
    }
  }

  return (
    <main className="flow">
      <div className="wrap">
        <header className="flow__head">
          <span className="mono flow__kicker">{fest.name} {fest.year} · Payment</span>
          <h1 className="display flow__title sunset-text">Pay the buy-in</h1>
          <p className="flow__sub">Registration <strong className="mono" style={{ fontSize: 14 }}>{reg.id}</strong> is saved. Pay the exact amount below, then submit the UTR and a screenshot for verification.</p>
        </header>

        {already && (
          <div className="hud-notice frame" role="status">
            <span className="mono hud-notice__k">Status · under verification</span>
            <span>Payment proof for this registration was already submitted.</span>
            <Link className="btn btn--sm" to={`/pass/${reg.id}`}>View your pass</Link>
          </div>
        )}

        <div className="pay">
          <div className="qrbox frame">
            <span className="mono" style={{ color: 'var(--muted)' }}>Scan with any UPI app</span>
            <div className="qrbox__qr">{qr && <img src={qr} alt={`UPI QR code to pay ${inr(reg.amount)} to ${payment.vpa}`} />}</div>
            <div className="qrbox__amt sunset-text">{inr(reg.amount)}</div>
            <div className="qrbox__vpa">
              <span className="mono qrbox__vpaid">Pay to <strong>{payment.vpa}</strong></span>
              <button className="btn btn--sm" type="button" onClick={() => copy(payment.vpa, 'vpa')}>{copied === 'vpa' ? 'Copied' : 'Copy UPI ID'}</button>
              <button className="btn btn--sm" type="button" onClick={() => copy(String(reg.amount), 'amt')}>{copied === 'amt' ? 'Copied' : 'Copy amount'}</button>
            </div>
            <a className="btn btn--hot" href={link} style={{ width: '100%' }}>Open UPI app</a>
            <p className="qrbox__hint">The button works on phones with GPay, PhonePe, Paytm or BHIM. On a laptop, scan the QR with your phone. Add <span className="mono">{payment.notePrefix} {reg.id}</span> in the note if your app asks.</p>
          </div>

          <div>
            <div className="panel frame">
              <div className="panel__title"><h2>Order</h2><span className="mono" style={{ color: 'var(--muted)' }}>{reg.leader.name}</span></div>
              <div className="lines">
                {reg.entries.map((en) => {
                  const e = getEvent(en.eventId)
                  return (
                    <div className="line" key={en.eventId}>
                      <span className="line__name">{e?.name || en.eventId}</span><span>{inr(e?.fee || 0)}</span>
                      <span className="line__sub">{en.teamName} · {en.members.length} player{en.members.length > 1 ? 's' : ''}</span>
                    </div>
                  )
                })}
                <div className="line line--total"><span>Total</span><span className="sunset-text">{inr(reg.amount)}</span></div>
              </div>
            </div>

            <ol className="howto">
              <li><b className="howto__dot" /><span><strong>Pay {inr(reg.amount)}</strong> by scanning the QR or tapping Open UPI app.</span></li>
              <li><b className="howto__dot" /><span><strong>Copy the UTR</strong>, the 12-digit reference in your UPI app's payment details.</span></li>
              <li><b className="howto__dot" /><span><strong>Submit it below</strong> with a screenshot. We verify within 24 hours.</span></li>
            </ol>

            <form className="panel frame" onSubmit={submit} noValidate>
              <div className="panel__title"><h2>Payment proof</h2><span className="mono" style={{ color: 'var(--muted)' }}>{reg.id}</span></div>
              <div className="field" style={{ marginBottom: 14 }}>
                <label htmlFor="utr">UTR / UPI reference number</label>
                <input id="utr" className="input mono" style={{ fontSize: 16, letterSpacing: '0.12em' }} inputMode="numeric" autoComplete="off" maxLength={14} placeholder="12 digits" value={utr} aria-invalid={!!errors.utr} onChange={(e) => setUtr(e.target.value.replace(/[^\d\s]/g, ''))} />
                {errors.utr && <span className="err" role="alert">{errors.utr}</span>}
              </div>
              <div className="field" style={{ marginBottom: 14 }}>
                <span className="mono" style={{ color: 'var(--muted)', fontSize: 11 }}>Payment screenshot</span>
                {file ? (
                  <div className="preview">
                    <img src={preview} alt="Payment screenshot preview" />
                    <div style={{ flex: 1 }}>
                      <div className="preview__name">{file.name}</div>
                      <div className="mono" style={{ color: 'var(--muted)' }}>{(file.size / 1024).toFixed(0)} KB</div>
                    </div>
                    <button type="button" className="linkbtn linkbtn--danger" onClick={() => { setFile(null); URL.revokeObjectURL(preview); setPreview('') }}>Remove</button>
                  </div>
                ) : (
                  <label className="upload" htmlFor="shot">
                    <input id="shot" type="file" accept="image/*" onChange={(e) => pick(e.target.files?.[0])} />
                    <span className="mono" style={{ color: 'var(--cream)' }}>Tap to upload</span>
                    <span style={{ fontSize: 13 }}>PNG or JPG, max 5 MB</span>
                  </label>
                )}
                {errors.shot && <span className="err" role="alert">{errors.shot}</span>}
              </div>
              {errors.form && <div className="notice notice--err">{errors.form}</div>}
              <button className="btn btn--hot" type="submit" disabled={busy} style={{ width: '100%' }}>{busy ? 'Submitting…' : 'Submit for verification'}</button>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 0 }}>{payment.verifyNote} Trouble paying? Call <a href={`tel:${payment.helpPhone.replace(/\s/g, '')}`}>{payment.helpPhone}</a>.</p>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
