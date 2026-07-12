type DashboardUserCardProps = {
  name: string
  email: string
  role: string
}

export function DashboardUserCard({ name, email, role }: DashboardUserCardProps) {
  return (
    <article className="border border-black/10 bg-white p-6 transition hover:border-black/20">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">{name}</h3>

          <p className="mt-1 text-sm text-black/55">{email}</p>
        </div>

        <span className="border border-black/10 px-2 py-1 text-xs uppercase tracking-[0.18em]">
          {role}
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="text-sm underline underline-offset-4">Edit</button>

        <button className="text-sm text-red-600 underline underline-offset-4">Disable</button>
      </div>
    </article>
  )
}
