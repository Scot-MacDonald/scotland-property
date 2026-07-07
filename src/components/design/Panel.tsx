import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export function Panel({ children, className = '' }: Props) {
  return <section className={`border bg-white ${className}`}>{children}</section>
}
