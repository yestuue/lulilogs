import { useSyncExternalStore } from 'react'

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 4000

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastStore = {
  state: { toasts: [] },
  listeners: new Set(),
  emit() {
    this.listeners.forEach((l) => l())
  },
  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  },
  getSnapshot() {
    return this.state
  },
  addToast(toast) {
    const id = genId()
    const next = {
      ...toast,
      id,
      open: true,
    }
    this.state = {
      toasts: [next, ...this.state.toasts].slice(0, TOAST_LIMIT),
    }
    this.emit()
    if (TOAST_REMOVE_DELAY > 0) {
      setTimeout(() => {
        this.dismiss(id)
      }, TOAST_REMOVE_DELAY)
    }
    return { id, dismiss: () => this.dismiss(id), update: () => {} }
  },
  dismiss(id) {
    this.state = {
      ...this.state,
      toasts: this.state.toasts.map((t) => (t.id === id ? { ...t, open: false } : t)),
    }
    this.emit()
    setTimeout(() => {
      this.state = {
        ...this.state,
        toasts: this.state.toasts.filter((t) => t.id !== id),
      }
      this.emit()
    }, 200)
  },
}

export function toast({ title, description, variant, ...props }) {
  return toastStore.addToast({ title, description, variant, ...props })
}

export function useToast() {
  const state = useSyncExternalStore(
    (cb) => toastStore.subscribe(cb),
    () => toastStore.getSnapshot(),
    () => toastStore.getSnapshot(),
  )
  return {
    toasts: state.toasts,
    toast,
    dismiss: (id) => toastStore.dismiss(id),
  }
}
