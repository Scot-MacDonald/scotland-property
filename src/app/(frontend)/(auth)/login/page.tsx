import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { LoginForm } from './LoginForm'

export default async function LoginPage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (user?.collection === 'users') {
    const role = (user as any).role

    if (role === 'super-admin') {
      redirect('/admin')
    }

    redirect('/dashboard')
  }

  return (
    <main className="grid min-h-screen bg-[#f7f4ef] lg:grid-cols-[1fr_560px]">
      <section className="hidden border-r border-black/10 bg-[#111] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Scotland</p>

          <p className="mt-2 text-3xl font-medium">Luxury Estates</p>
        </div>

        <div>
          <p className="max-w-xl text-5xl font-medium leading-tight">
            The agency workspace for Scotland&apos;s exceptional homes.
          </p>

          <p className="mt-6 max-w-lg leading-7 text-white/55">
            Manage properties, enquiries, seller leads, agents and performance from one secure
            platform.
          </p>
        </div>

        <p className="text-xs uppercase tracking-[0.2em] text-white/35">Agency Workspace</p>
      </section>

      <section className="flex items-center justify-center px-6 py-16 sm:px-10 lg:px-14">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <p className="text-xs uppercase tracking-[0.35em] text-black/45">
              Scotland Luxury Estates
            </p>
          </div>

          <p className="text-sm uppercase tracking-[0.3em] text-black/45">Agency Workspace</p>

          <h1 className="mt-4 text-5xl font-medium tracking-tight">Welcome back</h1>

          <p className="mt-4 leading-7 text-black/55">
            Sign in to manage your agency, listings and client activity.
          </p>

          <LoginForm />

          <p className="mt-8 text-center text-xs leading-5 text-black/40">
            Access is restricted to authorised Scotland Luxury Estates users.
          </p>
        </div>
      </section>
    </main>
  )
}
