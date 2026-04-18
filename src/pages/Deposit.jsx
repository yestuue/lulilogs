import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { base44 } from '@/api/base44Client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { Wallet, Loader2, Copy, Check, Upload, FileImage, Clock } from 'lucide-react'

const BANK_DETAILS = {
  bank: 'OPay (Paycon)',
  accountNumber: '6114013526',
  accountName: 'IMOLEAYO MOSES SAMUEL',
}

export default function Deposit() {
  const { user } = useOutletContext()
  const [amount, setAmount] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const copyAccount = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) setReceipt(file)
  }

  const handleSubmit = async () => {
    if (!amount || Number(amount) < 1000) {
      toast({ title: 'Minimum deposit is ₦1,000', variant: 'destructive' })
      return
    }
    if (!receipt) {
      toast({ title: 'Please upload your payment receipt', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: receipt })
      await base44.entities.Transaction.create({
        user_email: user.email,
        type: 'deposit',
        amount: Number(amount),
        status: 'pending',
        description: `Manual deposit - ₦${Number(amount).toLocaleString()} (pending approval)`,
        receipt_url: file_url,
      })
      setSubmitted(true)
      toast({ title: 'Request submitted!', description: 'Your deposit will be approved shortly.' })
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-12">
      <div className="py-2 text-center">
        <h1 className="text-2xl font-bold">Fund Your Wallet</h1>
        <p className="mt-1 text-sm text-muted-foreground">Transfer to the account below and submit your receipt</p>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-center text-primary-foreground">
        <p className="text-sm opacity-80">Current Balance</p>
        <p className="mt-1 text-4xl font-extrabold">₦{(user?.balance || 0).toLocaleString()}</p>
      </div>
      {submitted ? (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Clock className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-lg font-bold">Request Submitted!</h2>
          <p className="text-sm text-muted-foreground">Your deposit is pending approval.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false)
              setAmount('')
              setReceipt(null)
            }}
          >
            Make Another Deposit
          </Button>
        </div>
      ) : (
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-3 rounded-xl bg-accent p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Account Details</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bank:</span>
              <span className="font-medium">{BANK_DETAILS.bank}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Acct No:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold">{BANK_DETAILS.accountNumber}</span>
                <button type="button" onClick={copyAccount} className="text-muted-foreground hover:text-primary">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-bold">{BANK_DETAILS.accountName}</span>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Amount <span className="text-muted-foreground">(Min ₦1,000)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-muted-foreground">₦</span>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 pl-8"
                min={1000}
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Payment Receipt</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-accent/50">
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
              {receipt ? (
                <div className="flex items-center gap-2 text-primary">
                  <FileImage className="h-6 w-6" />
                  <span className="max-w-[200px] truncate text-sm font-medium">{receipt.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-primary" />
                  <p className="text-sm font-medium">Upload Payment Receipt</p>
                  <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or PDF</p>
                </>
              )}
            </label>
          </div>
          <Button className="h-12 w-full text-base font-semibold" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-5 w-5" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
