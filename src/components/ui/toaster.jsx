import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all',
            t.variant === 'destructive'
              ? 'destructive border-destructive bg-destructive text-destructive-foreground'
              : 'border bg-background text-foreground',
          )}
        >
          <div className="grid gap-1">
            {t.title ? <div className="text-sm font-semibold">{t.title}</div> : null}
            {t.description ? <div className="text-sm opacity-90">{t.description}</div> : null}
          </div>
        </div>
      ))}
    </div>
  )
}
