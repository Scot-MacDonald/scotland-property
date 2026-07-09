import Link from 'next/link'

export function DashboardActionCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link href={href} className="border bg-white p-8 transition hover:bg-neutral-50">
      <h3 className="text-2xl font-medium">{title}</h3>

      <p className="mt-4 text-sm text-muted-foreground">{description}</p>
    </Link>
  )
}
