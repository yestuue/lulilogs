import { useState, useEffect, useCallback } from 'react'
import { getSms, cancelOrder } from '@/lib/api'
import { base44 } from '@/api/base44Client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Copy, Check, X, Phone } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export default function SmsWaitDialog({ order, open, onClose, user, setUser, orderCost }) {
  const [smsCode, setSmsCode] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copiedSms, setCopiedSms] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (open) {
      setSmsCode(null)
      setCopied(false)
      setCopiedSms(false)
      setElapsed(0)
    }
  }, [open, order?.order_id])

  const doRefund = useCallback(
    async (reason) => {
      if (user && orderCost) {
        const newBalance = (user.balance || 0) + orderCost
        await base44.auth.updateMe({ balance: newBalance })
        setUser((prev) => ({ ...prev, balance: newBalance }))
      }
      toast({
        title: 'Auto-refunded',
        description: `₦${orderCost?.toLocaleString()} returned — ${reason}`,
      })
      onClose(true)
    },
    [user, orderCost, setUser, onClose],
  )

  useEffect(() => {
    if (!order || !open || smsCode) return
    const interval = setInterval(async () => {
      try {
        const res = await getSms(order.order_id)
        if (res.data) {
          setSmsCode(res.data)
        }
      } catch (err) {
        const msg = err.message || ''
        const isTerminal =
          msg.includes('[50107]') ||
          msg.includes('[50112]') ||
          msg.includes('released or timeout') ||
          msg.includes('canceled and refunded')
        if (isTerminal) {
          clearInterval(interval)
          doRefund('no SMS received')
        }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [order, open, smsCode, doRefund])

  useEffect(() => {
    if (!open || smsCode) return
    const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [open, smsCode])

  const canCancel = elapsed >= 60 && !smsCode

  const handleCancel = async () => {
    if (smsCode) return
    setCancelling(true)
    try {
      await cancelOrder(order.order_id)
      if (user && orderCost) {
        const newBalance = (user.balance || 0) + orderCost
        await base44.auth.updateMe({ balance: newBalance })
        setUser((prev) => ({ ...prev, balance: newBalance }))
      }
      toast({
        title: 'Order cancelled & refunded',
        description: `₦${orderCost?.toLocaleString()} returned to your balance.`,
      })
      onClose(true)
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setCancelling(false)
    }
  }

  const copyToClipboard = useCallback((text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'phone') {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      setCopiedSms(true)
      setTimeout(() => setCopiedSms(false), 2000)
    }
  }, [])

  const phoneDisplay = order ? `+${order.dialing_code}${order.mobile_number}` : ''
  const secondsToCancel = Math.max(0, 60 - elapsed)

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose(false)
      }}
    >
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            {smsCode ? 'SMS Received!' : 'Waiting for SMS...'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-primary bg-primary/10 p-5 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Your Phone Number</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-extrabold tracking-wider text-foreground">{phoneDisplay}</span>
              <Button variant="ghost" size="icon" type="button" onClick={() => copyToClipboard(phoneDisplay, 'phone')}>
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Use this number to receive your SMS code</p>
          </div>
          {smsCode ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
              <p className="mb-2 text-xs text-green-600">SMS Code</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-3xl font-bold tracking-widest text-green-700">{smsCode}</span>
                <Button variant="ghost" size="icon" type="button" onClick={() => copyToClipboard(smsCode, 'sms')}>
                  {copiedSms ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Waiting for SMS...</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {elapsed < 60 ? `Cancel available in ${secondsToCancel}s` : 'You can now cancel and get a refund'}
              </p>
            </div>
          )}
          <div className="flex gap-2">
            {smsCode ? (
              <Button className="flex-1" type="button" onClick={() => onClose(false)}>
                Done
              </Button>
            ) : (
              <Button
                variant="destructive"
                className="flex-1"
                type="button"
                onClick={handleCancel}
                disabled={!canCancel || cancelling}
              >
                {cancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                {canCancel ? 'Cancel & Refund' : `Cancel in ${secondsToCancel}s`}
              </Button>
            )}
          </div>
          {!smsCode && (
            <p className="text-center text-xs text-muted-foreground">Refund is only available if no SMS code has been received.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
