import Link from 'next/link'

type DashboardButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variantClasses: Record<DashboardButtonVariant, string> = {
  primary: 'bg-black text-white hover:bg-neutral-800',
  secondary: 'border border-black/10 bg-white text-black hover:border-black',
  ghost: 'text-black hover:bg-black/5',
  danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
}

export function DashboardButton({
  href,
  children,
  variant = 'secondary',
  type = 'button',
  className = '',
}: {
  href?: string
  children: React.ReactNode
  variant?: DashboardButtonVariant
  type?: 'button' | 'submit'
  className?: string
}) {
  const classes = `inline-flex min-h-11 items-center justify-center px-5 text-sm uppercase tracking-[0.16em] transition ${variantClasses[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  )
}
