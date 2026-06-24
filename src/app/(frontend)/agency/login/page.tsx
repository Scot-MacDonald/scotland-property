import { AgencyLoginForm } from '@/components/AgencyLoginForm'

export default function AgencyLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[520px] items-center px-4 py-16">
      <div className="w-full border p-8">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Agency Login</p>

        <h1 className="mt-3 text-4xl font-medium tracking-tight">
          Sign in to your agency dashboard
        </h1>

        <p className="mt-4 text-muted-foreground">
          Manage valuation leads, listings and agency performance.
        </p>

        <AgencyLoginForm />
      </div>
    </main>
  )
}
