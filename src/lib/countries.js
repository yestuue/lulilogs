export const COUNTRIES = [
  { name: 'Afghanistan', code: 'af' },
  { name: 'Albania', code: 'al' },
  { name: 'Algeria', code: 'dz' },
  { name: 'Angola', code: 'ao' },
  { name: 'Argentina', code: 'ar' },
  { name: 'Armenia', code: 'am' },
  { name: 'Australia', code: 'au' },
  { name: 'Austria', code: 'at' },
  { name: 'Azerbaijan', code: 'az' },
  { name: 'Bahrain', code: 'bh' },
  { name: 'Bangladesh', code: 'bd' },
  { name: 'Belarus', code: 'by' },
  { name: 'Benin', code: 'bj' },
  { name: 'Bolivia', code: 'bo' },
  { name: 'Botswana', code: 'bw' },
  { name: 'Brazil', code: 'br' },
  { name: 'Bulgaria', code: 'bg' },
  { name: 'Cambodia', code: 'kh' },
  { name: 'Cameroon', code: 'cm' },
  { name: 'Canada', code: 'ca' },
  { name: 'Colombia', code: 'co' },
  { name: 'Cyprus', code: 'cy' },
  { name: 'Denmark', code: 'dk' },
  { name: 'Egypt', code: 'eg' },
  { name: 'Estonia', code: 'ee' },
  { name: 'France', code: 'fr' },
  { name: 'Georgia', code: 'ge' },
  { name: 'Germany', code: 'de' },
  { name: 'India', code: 'in' },
  { name: 'Indonesia', code: 'id' },
  { name: 'Ireland', code: 'ie' },
  { name: 'Israel', code: 'il' },
  { name: 'Italy', code: 'it' },
  { name: 'Ivory Coast', code: 'ci' },
  { name: 'Japan', code: 'jp' },
  { name: 'Kazakhstan', code: 'kz' },
  { name: 'Kenya', code: 'ke' },
  { name: 'Kyrgyzstan', code: 'kg' },
  { name: "Lao People's Democratic Republic", code: 'la' },
  { name: 'Latvia', code: 'lv' },
  { name: 'Lithuania', code: 'lt' },
  { name: 'Madagascar', code: 'mg' },
  { name: 'Malaysia', code: 'my' },
  { name: 'Morocco', code: 'ma' },
  { name: 'Myanmar', code: 'mm' },
  { name: 'Netherlands', code: 'nl' },
  { name: 'New Zealand', code: 'nz' },
  { name: 'Nicaragua', code: 'ni' },
  { name: 'Nigeria', code: 'ng' },
  { name: 'Palestine', code: 'ps' },
  { name: 'Panama', code: 'pa' },
  { name: 'Philippines', code: 'ph' },
  { name: 'Poland', code: 'pl' },
  { name: 'Qatar', code: 'qa' },
  { name: 'Romania', code: 'ro' },
  { name: 'Russia', code: 'ru' },
  { name: 'Saudi Arabia', code: 'sa' },
  { name: 'Serbia', code: 'rs' },
  { name: 'Singapore', code: 'sg' },
  { name: 'South Africa', code: 'za' },
  { name: 'Spain', code: 'es' },
  { name: 'Tajikistan', code: 'tj' },
  { name: 'Tanzania', code: 'tz' },
  { name: 'Thailand', code: 'th' },
  { name: 'Turkey', code: 'tr' },
  { name: 'Ukraine', code: 'ua' },
  { name: 'United Arab Emirates', code: 'ae' },
  { name: 'United Kingdom', code: 'gb' },
  { name: 'United States', code: 'us' },
  { name: 'United States (Virtual)', code: 'usv' },
  { name: 'Vietnam', code: 'vn' },
]

function regionalIndicatorPair(alpha2) {
  const base = 0x1f1e6
  const a = alpha2.charCodeAt(0)
  const b = alpha2.charCodeAt(1)
  if (a < 97 || a > 122 || b < 97 || b > 122) return '🏳️'
  return String.fromCodePoint(base + (a - 97), base + (b - 97))
}

/** Returns a flag emoji for an API area code (ISO-like). */
export function getCountryFlag(code) {
  if (!code) return '🏳️'
  const c = String(code).toLowerCase()
  if (c === 'usv') return regionalIndicatorPair('us')
  if (c.length === 2) return regionalIndicatorPair(c)
  return '🏳️'
}
