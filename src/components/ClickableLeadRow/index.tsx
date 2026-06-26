'use client'

import { useRouter } from 'next/navigation'

export function ClickableLeadRow({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(href)}
      className="grid cursor-pointer gap-4 p-5 transition-colors hover:bg-gray-50 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_auto]"
    >
      {children}

      <div className="flex items-center justify-end text-3xl text-gray-300">→</div>
    </div>
  )
}
