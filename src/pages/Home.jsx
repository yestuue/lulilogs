import { useState, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { base44 } from '@/api/base44Client'
import { purchaseNumber, centsToNaira } from '@/lib/api'
import { toast } from '@/components/ui/use-toast'
import ServiceSelector from '@/components/ServiceSelector'
import CountryList from '@/components/CountryList'
import SmsWaitDialog from '@/components/SmsWaitDialog'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { user, setUser } = useOutletContext()
  const [selectedService, setSelectedService] = useState(null)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [orderCost, setOrderCost] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  const handleBuy = useCallback(
    async (priceItem, reusable, overridePrice) => {
      if (!user) return
      const costNaira = overridePrice !== undefined ? overridePrice : centsToNaira(priceItem.amount)
      if ((user.balance || 0) < costNaira) {
        toast({
          title: 'Insufficient Balance',
          description: `You need ₦${costNaira.toLocaleString()} but have ₦${(user.balance || 0).toLocaleString()}. Please deposit funds first.`,
          variant: 'destructive',
        })
        return
      }
      setPurchasing(true)
      try {
        const res = await purchaseNumber(priceItem.area_code, selectedService.code, reusable)
        const newBalance = (user.balance || 0) - costNaira
        await base44.auth.updateMe({ balance: newBalance })
        setUser((prev) => ({ ...prev, balance: newBalance }))

        await base44.entities.Transaction.create({
          user_email: user.email,
          type: 'purchase',
          amount: costNaira,
          status: 'completed',
          description: `${selectedService.name} - ${priceItem.area_name}`,
          order_id: res.data.order_id,
          service_code: selectedService.code,
          country_code: priceItem.area_code,
          phone_number: `+${res.data.dialing_code}${res.data.mobile_number}`,
        })
        setOrderCost(costNaira)
        setCurrentOrder(res.data)
        setDialogOpen(true)
      } catch (err) {
        toast({ title: 'Purchase Failed', description: err.message, variant: 'destructive' })
      } finally {
        setPurchasing(false)
      }
    },
    [user, selectedService, setUser],
  )

  const handleDialogClose = useCallback(async () => {
    setDialogOpen(false)
    setCurrentOrder(null)
  }, [])

  return (
    <div className="space-y-8 pb-12">
      <div className="px-1 py-2 text-center sm:py-4">
        <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          Buy Virtual Phone Numbers for Receiving SMS Online
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
          For businesses of all sizes to conduct legitimate communications.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-1 text-lg font-semibold tracking-tight text-slate-900">Service Selection</h2>
        <p className="mb-4 text-sm text-slate-500">Choose the platform you need a number for</p>
        <ServiceSelector selectedService={selectedService} onSelect={setSelectedService} />
      </div>
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
        <CountryList selectedService={selectedService} onBuy={handleBuy} />
      </div>
      {purchasing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl bg-card p-8 text-center shadow-xl">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="font-medium">Purchasing number...</p>
          </div>
        </div>
      )}
      <SmsWaitDialog
        order={currentOrder}
        open={dialogOpen}
        onClose={handleDialogClose}
        user={user}
        setUser={setUser}
        orderCost={orderCost}
      />
    </div>
  )
}
