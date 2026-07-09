import Link from 'next/link'

export function DashboardAgentCard({
  name,
  role,
  email,
  phone,
  href = '/dashboard/agents',
}: {
  name: string
  role?: string
  email?: string
  phone?: string
  href?: string
}) {
  return (
    <article className="border border-black/10 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-neutral-200 text-lg font-medium">
          {name.charAt(0)}
        </div>

        <div className="min-w-0">
          <h3 className="text-2xl font-medium">{name}</h3>

          {role && <p className="mt-1 text-sm text-black/60">{role}</p>}

          <div className="mt-4 grid gap-1 text-sm text-black/60">
            {email && <p>{email}</p>}
            {phone && <p>{phone}</p>}
          </div>

          <Link
            href={href}
            className="mt-5 inline-flex border border-black/10 px-4 py-2 text-sm transition hover:border-black"
          >
            Edit Agent
          </Link>
        </div>
      </div>
    </article>
  )
}
