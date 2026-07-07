import type { ReactNode } from 'react'

type Props = {
  eyebrow?: string
  title: string
  description?: ReactNode
  className?: string
}

export function PageHeading({ eyebrow, title, description, className = '' }: Props) {
  return (
    <header className={`pb-10 ${className}`}>
      {eyebrow ? (
        <p className="text-sm uppercase tracking-[0.35em] text-neutral-500">{eyebrow}</p>
      ) : null}

      <h1 className="mt-5 max-w-5xl text-5xl font-light leading-none tracking-tight md:text-6xl">
        {title}
      </h1>

      {description ? (
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-neutral-600">{description}</p>
      ) : null}
    </header>
  )
}
