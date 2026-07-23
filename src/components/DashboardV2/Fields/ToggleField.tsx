type ToggleFieldProps = {
  label: string
  name: string
  checked: boolean
  description?: string
  disabled?: boolean
  onChange: (checked: boolean) => void
}

export function ToggleField({
  label,
  name,
  checked,
  description,
  disabled = false,
  onChange,
}: ToggleFieldProps) {
  return (
    <div className="flex items-start justify-between gap-6 border border-neutral-200 p-4">
      <div>
        <label htmlFor={name} className="text-sm font-medium text-neutral-900">
          {label}
        </label>

        {description ? (
          <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
        ) : null}
      </div>

      <button
        id={name}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'relative mt-0.5 h-6 w-11 shrink-0 border transition',
          checked ? 'border-neutral-950 bg-neutral-950' : 'border-neutral-300 bg-white',
          disabled ? 'cursor-not-allowed opacity-50' : '',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-4 w-4 bg-white transition',
            checked ? 'left-5' : 'left-0.5',
            !checked ? 'border border-neutral-300' : '',
          ].join(' ')}
        />
      </button>
    </div>
  )
}
