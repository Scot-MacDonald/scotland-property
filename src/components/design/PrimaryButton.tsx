import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  href?: string
  type?: 'button' | 'submit'
  onClick?: () => void
  className?: string
}

export function PrimaryButton({ children, href, type = 'button', onClick, className = '' }: Props) {
  const classes = `inline-flex items-center justify-center border border-black bg-black px-6 py-3 text-sm uppercase tracking-[0.15em] text-white transition hover:bg-white hover:text-black ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
