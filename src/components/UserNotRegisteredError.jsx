import { base44 } from '@/api/base44Client'
import { Button } from '@/components/ui/button'

export default function UserNotRegisteredError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Account not registered</h1>
      <p className="max-w-md text-muted-foreground">Your account is not registered for this app yet.</p>
      <Button onClick={() => base44.auth.redirectToLogin('/')}>Continue</Button>
    </div>
  )
}
