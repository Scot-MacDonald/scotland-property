import Link from 'next/link'

type BuyerStatCardProps = {
  eyebrow: string
  value: number
  label: string
  href: string
}

export function BuyerStatCard({ eyebrow, value, label, href }: BuyerStatCardProps) {
  return (
    <Link
      href={href}
      className="group border border-black/10 bg-white p-6 transition hover:bg-black hover:text-white md:p-8"
    >
      <p className="text-xs uppercase tracking-[0.24em] text-black/40 transition group-hover:text-white/50">
        {eyebrow}
      </p>

      <p className="mt-6 text-5xl font-medium tracking-tight">{value}</p>

      <p className="mt-3 text-sm text-black/55 transition group-hover:text-white/65">{label}</p>
    </Link>
  )
}
