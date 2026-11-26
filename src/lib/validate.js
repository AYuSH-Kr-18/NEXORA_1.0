export const isName = (s) => /^[A-Za-z][A-Za-z .'-]{1,59}$/.test(String(s).trim())
export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim())
// Indian mobile: optional +91 / 0, then 10 digits starting 6-9
// Indian mobile, exactly 10 digits, format xxxxxxxxxx (e.g. 9876543210), first digit 6-9.
export const onlyDigits = (s, max = 10) => {
  let d = String(s ?? '').replace(/\D/g, '')
  // pasted with a country/trunk prefix, e.g. "+91 98765 43210" or "09876543210": drop it
  if (d.length > max && d.startsWith('91')) d = d.slice(2)
  else if (d.length > max && d.startsWith('0')) d = d.slice(1)
  return d.slice(0, max)
}
export const isPhone = (s) => /^[6-9]\d{9}$/.test(String(s ?? ''))
/** what we store: the same 10 digits ('' if invalid) */
export const normalizePhone = (s) => (isPhone(s) ? String(s) : '')
// UPI UTR / RRN is 12 digits
export const isUtr = (s) => /^\d{12}$/.test(String(s).trim())
export const required = (s) => String(s ?? '').trim().length > 0
