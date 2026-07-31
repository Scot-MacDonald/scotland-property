import type { ReactNode } from 'react'

type BuyerWorkspacePanelProps = {
  children: ReactNode
  className?: string
}

export function BuyerWorkspacePanel({ children, className = '' }: BuyerWorkspacePanelProps) {
  return (
    <section className={`border border-black/10 bg-white ${className}`.trim()}>{children}</section>
  )
}
