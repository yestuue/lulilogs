import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { base44 } from '@/api/base44Client'
import { getSms } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Phone, Copy, Check, MessageSquare, RefreshCw } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import moment from 'moment'

export default function Orders() {
  const { user } = useOutletContext()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [checkingId, setCheckingId] = useState(null)

  useEffect(() => {
    if (!user) return
    base44.entities.Transaction
      .filter({ user_email: user.email }, '-created_date', 50)
      .then(setTransactions)
      .finally(() => setLoading(false))
  }, [user?.email])

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const checkSms = async (tx) => {
    setCheckingId(tx.id)
    try {
      const res = await getSms(tx.order_id)
      if (res.data) {
        await base44.entities.Transaction.update(tx.id, { sms_code: res.data })
        setTransactions((prev) => prev.map((t) => (t.id === tx.id ? { ...t, sms_code: res.data } : t)))
        toast({ title: 'SMS Received!', description: `Code: ${res.data}` })
      }
    } catch (err) {
      toast({ title: 'No SMS yet', description: err.message })
    } finally {
      setCheckingId(null)
    }
  }

  const statusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div className="py-2 text-center">
        <h1 className="text-2xl font-bold">Order History</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your recent transactions and purchases</p>
      </div>
      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Phone className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${tx.type === 'deposit' ? 'text-green-600' : 'text-foreground'}`}
                    >
                      {tx.type === 'deposit' ? '+' : '-'}₦{tx.amount?.toLocaleString()}
                    </span>
                    <Badge variant={statusColor(tx.status)} className="text-xs">
                      {tx.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {tx.type}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{tx.description}</p>
                  {tx.phone_number && (
                    <div className="mt-2 flex items-center gap-2">
                      <code className="rounded bg-accent px-2 py-0.5 font-mono text-sm">{tx.phone_number}</code>
                      <button
                        type="button"
                        onClick={() => copyText(tx.phone_number, `phone-${tx.id}`)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copiedId === `phone-${tx.id}` ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                  {tx.sms_code && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-green-600" />
                        <code className="font-mono text-sm font-bold text-green-700">{tx.sms_code}</code>
                        <button
                          type="button"
                          onClick={() => copyText(tx.sms_code, `sms-${tx.id}`)}
                          className="text-green-600 hover:text-green-700"
                        >
                          {copiedId === `sms-${tx.id}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">{moment(tx.created_date).fromNow()}</p>
                </div>
                {tx.type === 'purchase' && tx.order_id && !tx.sms_code && (
                  <Button variant="outline" size="sm" onClick={() => checkSms(tx)} disabled={checkingId === tx.id} className="flex-shrink-0">
                    {checkingId === tx.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    <span className="ml-1.5 hidden sm:inline">Check SMS</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
