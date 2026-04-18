import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { base44 } from '@/api/base44Client'
import { Button } from '@/components/ui/button'
import { Wallet, History, Menu, X, LogOut, Phone, MessageCircle, ShieldCheck } from 'lucide-react'

const LOGO_URL =
  'https://media.base44.com/images/public/69c870ced5543b54fe26e9f2/72bbe741e_IMG_0393.jpg'

export default function Navbar({ user }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const balance = user?.balance || 0
  const isAdmin = user?.role === 'admin' || user?.email === 'scottcade6@gmail.com'
  const navLinks = [
    { to: '/', label: 'Buy Number', icon: Phone },
    { to: '/deposit', label: 'Deposit', icon: Wallet },
    { to: '/orders', label: 'Orders', icon: History },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
  ]

  const walletChip = (
    <div
      className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm sm:text-sm"
      title="Wallet balance"
    >
      <Wallet className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
      <span className="tabular-nums">₦{Number(balance).toLocaleString()}</span>
    </div>
  )

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16">
        <Link to="/" className="flex shrink-0 items-center">
          <img src={LOGO_URL} alt="LuliCodes" className="h-9 w-auto object-contain sm:h-10" />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = location.pathname === link.to
            return (
              <Link key={link.to} to={link.to}>
                <Button variant={active ? 'default' : 'ghost'} size="sm" className="gap-2">
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            )
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {walletChip}
          <div className="hidden items-center gap-1 md:flex">
            <a href="https://t.me/lulilogs" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2 border-primary/25 text-primary hover:bg-primary/10">
                <MessageCircle className="h-4 w-4" />
                Chat Support
              </Button>
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => base44.auth.logout('/welcome')}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-2 md:hidden">
          <div className="divide-y divide-slate-100">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = location.pathname === link.to
              return (
                <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="block">
                  <div
                    className={`flex items-center gap-3 py-3 text-sm font-medium ${
                      active ? 'text-primary' : 'text-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    {link.label}
                  </div>
                </Link>
              )
            })}
            <a
              href="https://t.me/lulilogs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-3 text-sm font-medium text-primary"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              Chat Support
            </a>
            <button
              type="button"
              onClick={() => base44.auth.logout('/welcome')}
              className="flex w-full items-center gap-3 py-3 text-left text-sm font-medium text-destructive"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
