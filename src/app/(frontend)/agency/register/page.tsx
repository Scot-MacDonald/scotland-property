import Link from 'next/link'
import { AgencySignupForm } from '@/components/AgencySignupForm'

export default function AgencyRegisterPage() {
  return (
    <main className="mx-auto max-w-[720px] px-4 py-20">
      <div className="mb-12 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Scotland Luxury Estates
        </p>

        <h1 className="mt-4 text-5xl font-medium">Start Your Free Trial</h1>

        <p className="mt-6 text-muted-foreground">
          Join Scotland&apos;s luxury property marketplace and start receiving buyer enquiries and
          valuation leads today.
        </p>
      </div>

      <AgencySignupForm />

      <div className="mt-10 text-center">
        <Link href="/admin/login" className="text-sm underline">
          Already have an account?
        </Link>
      </div>
    </main>
  )
}
