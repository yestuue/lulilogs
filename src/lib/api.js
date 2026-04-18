const API_BASE = 'https://api.bee-sms.com/v1'
/** Set in `.env` as VITE_BEE_SMS_TOKEN=your_token (do not commit secrets). */
const API_TOKEN = import.meta.env.VITE_BEE_SMS_TOKEN ?? ''

export const USD_TO_NGN = 1600

/** Bee SMS `amount` / balance fields are USD cents (100 = $1.00). */
export function centsToNaira(cents) {
  const n = Number(cents)
  if (!Number.isFinite(n) || n < 0) return 0
  const usd = Math.round(n) / 100
  return Math.max(0, Math.ceil(usd * USD_TO_NGN))
}

export function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString()}`
}

async function apiCall(endpoint, params = {}) {
  if (!API_TOKEN) {
    throw new Error('Missing VITE_BEE_SMS_TOKEN — add it to your .env file.')
  }
  const url = new URL(`${API_BASE}${endpoint}`)
  url.searchParams.set('token', API_TOKEN)
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      url.searchParams.set(key, val)
    }
  })
  const res = await fetch(url.toString())
  const data = await res.json()
  if (data.code !== 200) {
    throw new Error(`[${data.code}] ${data.message || 'API Error'}`)
  }
  return data
}

export async function getBalance() {
  return apiCall('/user/balance')
}

export async function getPrices(area, service) {
  return apiCall('/otp/prices', { area, service })
}

export async function purchaseNumber(area, service, reuse) {
  return apiCall('/otp/purchase', { area, service, reuse: reuse ? 'true' : undefined })
}

export async function getSms(orderId) {
  return apiCall('/otp/sms', { order: orderId })
}

export async function cancelOrder(orderId) {
  return apiCall('/otp/cancel', { order: orderId })
}
