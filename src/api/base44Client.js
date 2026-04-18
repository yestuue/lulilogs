/**
 * Local dev stand-in for the Base44 client used in the original app.
 * Persists user, transactions, and price overrides in localStorage.
 * Replace with your real Base44 SDK when connecting to production.
 */

const KEYS = {
  user: 'lulicodes_user',
  transactions: 'lulicodes_transactions',
  overrides: 'lulicodes_price_overrides',
}

const bus = {
  User: new Set(),
  PriceOverride: new Set(),
}

function emit(channel, payload) {
  bus[channel].forEach((fn) => {
    try {
      fn(payload)
    } catch {
      /* ignore */
    }
  })
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function authRequired() {
  const err = new Error('Authentication required')
  err.type = 'auth_required'
  throw err
}

export const base44 = {
  auth: {
    async me() {
      const user = readJson(KEYS.user, null)
      if (!user) authRequired()
      return user
    },
    redirectToLogin(redirect = '/') {
      const demo = {
        email: 'demo@lulicodes.test',
        balance: 50000,
        role: 'user',
      }
      writeJson(KEYS.user, demo)
      window.location.assign(redirect || '/')
    },
    logout(path = '/welcome') {
      localStorage.removeItem(KEYS.user)
      window.location.assign(path)
    },
    async updateMe(patch) {
      const prev = readJson(KEYS.user, null)
      if (!prev) authRequired()
      const next = { ...prev, ...patch }
      writeJson(KEYS.user, next)
      emit('User', { data: next })
      return next
    },
  },
  entities: {
    User: {
      subscribe(fn) {
        bus.User.add(fn)
        return () => bus.User.delete(fn)
      },
    },
    Transaction: {
      async create(record) {
        const list = readJson(KEYS.transactions, [])
        const tx = {
          id: crypto.randomUUID(),
          ...record,
          created_date: new Date().toISOString(),
        }
        list.unshift(tx)
        writeJson(KEYS.transactions, list)
        return tx
      },
      async filter(query, _sort, limit = 50) {
        let list = readJson(KEYS.transactions, [])
        if (query?.user_email) {
          list = list.filter((t) => t.user_email === query.user_email)
        }
        list.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        return list.slice(0, limit)
      },
      async update(id, patch) {
        const list = readJson(KEYS.transactions, [])
        const idx = list.findIndex((t) => t.id === id)
        if (idx === -1) return null
        list[idx] = { ...list[idx], ...patch }
        writeJson(KEYS.transactions, list)
        return list[idx]
      },
    },
    PriceOverride: {
      async list() {
        return readJson(KEYS.overrides, [])
      },
      subscribe(fn) {
        bus.PriceOverride.add(fn)
        return () => bus.PriceOverride.delete(fn)
      },
    },
  },
  integrations: {
    Core: {
      async UploadFile({ file }) {
        return { file_url: typeof file === 'string' ? file : URL.createObjectURL(file) }
      },
    },
  },
}
