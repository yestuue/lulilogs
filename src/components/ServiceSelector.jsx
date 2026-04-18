import { useState, useMemo } from 'react'
import { SERVICES, getServiceImage } from '@/lib/services'
import { Search, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'

const POPULAR_SERVICES = ['wa', 'tg', 'tk', 'google', 'amz', 'red', 'ig', 'fb']

export default function ServiceSelector({ selectedService, onSelect }) {
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const popularList = useMemo(
    () => POPULAR_SERVICES.map((code) => SERVICES.find((s) => s.code === code)).filter(Boolean),
    [],
  )
  const filtered = useMemo(() => {
    if (!search) return showAll ? SERVICES : popularList
    return SERVICES.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  }, [search, showAll, popularList])

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setShowAll(true)
          }}
          className="pl-10"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((service) => (
          <button
            key={service.code}
            type="button"
            onClick={() => onSelect(service)}
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all ${
              selectedService?.code === service.code
                ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                : 'border-slate-200 bg-white text-slate-800 hover:border-primary/35 hover:bg-slate-50'
            }`}
          >
            <img
              src={getServiceImage(service.code)}
              alt={service.name}
              className="h-6 w-6 flex-shrink-0 rounded-md object-contain"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <span className="truncate">{service.name}</span>
          </button>
        ))}
      </div>
      {!search && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mx-auto mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Show all services <ChevronDown className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
