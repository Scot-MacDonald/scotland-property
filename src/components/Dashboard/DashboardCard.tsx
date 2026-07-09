import Link from 'next/link'

export function DashboardCard({
  title,
  value,
  href,
}: {
  title: string
  value: number
  href: string
}) {
  return (
    <Link href={href} className="border bg-white p-6 transition hover:bg-neutral-50">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{title}</p>

      <p className="mt-4 text-5xl font-medium">{value}</p>
    </Link>
  )
}
