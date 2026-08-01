type BuyerProfileDetailsProps = {
  email: string
  agencyName?: string | null
  lastActiveAt?: string | null
  createdAt: string
  updatedAt: string
}

function formatDate(value?: string | null, includeTime = false) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime
      ? {
          hour: '2-digit',
          minute: '2-digit',
        }
      : {}),
  }).format(date)
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-black/10 px-5 py-4 first:border-t-0">
      <p className="text-xs uppercase tracking-[0.14em] text-black/40">{label}</p>

      <p className="mt-2 break-words text-sm text-black/80">{value}</p>
    </div>
  )
}

export function BuyerProfileDetails({
  email,
  agencyName,
  lastActiveAt,
  createdAt,
  updatedAt,
}: BuyerProfileDetailsProps) {
  return (
    <aside className="border border-black/10 bg-white">
      <div className="px-5 py-5">
        <h2 className="font-medium">Account information</h2>
      </div>

      <DetailRow label="Email" value={email} />
      <DetailRow label="Managing agency" value={agencyName || 'Not assigned'} />
      <DetailRow label="Last active" value={formatDate(lastActiveAt, true)} />
      <DetailRow label="Member since" value={formatDate(createdAt)} />
      <DetailRow label="Last updated" value={formatDate(updatedAt, true)} />
    </aside>
  )
}
