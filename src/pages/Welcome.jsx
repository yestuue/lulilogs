import { base44 } from '@/api/base44Client'
import { Button } from '@/components/ui/button'

const LOGO_URL =
  'https://media.base44.com/images/public/69c870ced5543b54fe26e9f2/72bbe741e_IMG_0393.jpg'

export default function Welcome() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_URL} alt="Lulicodes" className="h-24 w-auto object-contain" />
        </div>
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5 text-left">
          {[
            'Buy virtual numbers instantly',
            'Receive SMS codes online',
            '100+ services supported',
            'Fast & affordable',
          ].map((f) => (
            <p key={f} className="text-sm text-foreground">
              • {f}
            </p>
          ))}
        </div>
        <div className="space-y-3">
          <Button className="h-12 w-full text-base font-semibold" onClick={() => base44.auth.redirectToLogin('/')}>
            Sign In
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full text-base font-semibold"
            onClick={() => base44.auth.redirectToLogin('/')}
          >
            Create Account
          </Button>
        </div>
      </div>
    </div>
  )
}
