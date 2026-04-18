import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { base44 } from '@/api/base44Client'
import Navbar from './Navbar'

export default function Layout() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function loadUser() {
      try {
        const me = await base44.auth.me()
        setUser(me)
      } catch {
        setUser(null)
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    const unsubscribe = base44.entities.User.subscribe((event) => {
      if (event.data?.email === user?.email) {
        setUser((prev) => ({ ...prev, ...event.data }))
      }
    })
    return unsubscribe
  }, [user?.email])

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet context={{ user, setUser }} />
      </main>
    </div>
  )
}
