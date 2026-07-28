type PublishingDestinationProps = {
  checked: boolean
  description: string
  disabled?: boolean
  label: string
  onChange: (checked: boolean) => void
  status: 'published' | 'not-published' | 'coming-soon'
}

const statusStyles = {
  published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'not-published': 'border-neutral-200 bg-neutral-50 text-neutral-600',
  'coming-soon': 'border-neutral-200 bg-neutral-100 text-neutral-600',
}

const statusLabels = {
  published: 'Published',
  'not-published': 'Not published',
  'coming-soon': 'Coming soon',
}

export function PublishingDestination({
  checked,
  description,
  disabled = false,
  label,
  onChange,
  status,
}: PublishingDestinationProps) {
  return (
    <div
      className={[
        'border border-neutral-200 bg-white p-5 sm:p-6',
        disabled ? 'opacity-70' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-sm font-semibold text-neutral-950">{label}</h3>

            <span
              className={[
                'inline-flex border px-2.5 py-1 text-xs font-medium',
                statusStyles[status],
              ].join(' ')}
            >
              {statusLabels[status]}
            </span>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">{description}</p>
        </div>

        <label
          className={[
            'relative mt-1 shrink-0',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          ].join(' ')}
        >
          <span className="sr-only">Toggle {label} publishing</span>

          <input
            checked={checked}
            className="peer sr-only"
            disabled={disabled}
            type="checkbox"
            onChange={(event) => onChange(event.target.checked)}
          />

          <span className="block h-6 w-11 border border-neutral-300 bg-neutral-200 transition peer-checked:border-neutral-950 peer-checked:bg-neutral-950 peer-disabled:cursor-not-allowed" />

          <span className="absolute left-1 top-1 h-4 w-4 bg-white transition peer-checked:translate-x-5" />
        </label>
      </div>
    </div>
  )
}
