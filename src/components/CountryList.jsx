import { useState, useEffect, useMemo } from 'react'
import { getPrices, centsToNaira, formatNaira } from '@/lib/api'
import { base44 } from '@/api/base44Client'
import { getCountryFlag } from '@/lib/countries'
import { Search, ShoppingCart, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

export default function CountryList({ selectedService, onBuy }) {
  const [prices, setPrices] = useState([])
  const [overrides, setOverrides] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [reusable, setReusable] = useState(false)

  useEffect(() => {
    base44.entities.PriceOverride.list().then(setOverrides)
    const unsub = base44.entities.PriceOverride.subscribe(() => {
      base44.entities.PriceOverride.list().then(setOverrides)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!selectedService) return
    setLoading(true)
    setPrices([])
    getPrices(undefined, selectedService.code)
      .then((res) => setPrices(res.data || []))
      .catch(() => setPrices([]))
      .finally(() => setLoading(false))
  }, [selectedService?.code])

  const overrideMap = useMemo(() => {
    const map = {}
    overrides
      .filter((o) => selectedService && o.service_code === selectedService.code)
      .forEach((o) => {
        map[o.country_code] = o.price_naira
      })
    return map
  }, [overrides, selectedService?.code])

  const filtered = useMemo(() => {
    let list = prices
    if (search) list = list.filter((p) => p.area_name.toLowerCase().includes(search.toLowerCase()))
    return list.sort((a, b) => a.amount - b.amount)
  }, [prices, search])

  if (!selectedService) {
    return <div className="py-12 text-center text-muted-foreground">Please select a service first</div>
  }

  const priceInNaira = (item) =>
    overrideMap[item.area_code] !== undefined ? overrideMap[item.area_code] : centsToNaira(item.amount)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Country Selection</h2>
          <p className="mt-0.5 text-sm text-slate-500">Areas for {selectedService.name}</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <Checkbox checked={reusable} onCheckedChange={(v) => setReusable(v === true)} />
          Reusable
        </label>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search country/area..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading prices...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">No countries available for this service</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.area_code}
              className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white px-3 py-3 transition-shadow hover:shadow-sm sm:px-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-xl leading-none shadow-sm">
                  {getCountryFlag(item.area_code)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.area_name}</p>
                  <p className="text-xs text-slate-500">{item.qty.toLocaleString()} available</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onBuy(item, reusable, overrideMap[item.area_code])}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-95 sm:px-4"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>
                  Buy {formatNaira(priceInNaira(item))}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
