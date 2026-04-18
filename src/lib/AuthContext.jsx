import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { base44 } from '@/api/base44Client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoadingPublicSettings(true)
      await new Promise((r) => setTimeout(r, 0))
      if (!cancelled) setIsLoadingPublicSettings(false)

      setIsLoadingAuth(true)
      try {
        await base44.auth.me()
        if (!cancelled) setAuthError(null)
      } catch (e) {
        const err = e && typeof e === 'object' && 'type' in e ? e : { type: 'auth_required' }
        if (!cancelled) setAuthError(err)
      } finally {
        if (!cancelled) setIsLoadingAuth(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.pathname || '/')
  }

  const value = useMemo(
    () => ({
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      navigateToLogin,
    }),
    [isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
