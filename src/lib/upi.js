import { payment } from '../data/event.js'

// Standard UPI deep link. Opens GPay/PhonePe/Paytm/BHIM on phones.
export function upiLink(amount, regId) {
  const p = new URLSearchParams({
    pa: payment.vpa,
    pn: payment.payeeName,
    am: Number(amount).toFixed(2),
    cu: 'INR',
    tn: `${payment.notePrefix} ${regId}`,
  })
  return 'upi://pay?' + p.toString().replace(/\+/g, '%20')
}
