import type { SelectHTMLAttributes } from 'react'

type SelectOption = {
  label: string
  value: string
}

type SelectFieldProps = {
  label: string
  name: string
  options: SelectOption[]
  description?: string
  error?: string
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name'>

export function SelectField({
  label,
  name,
  options,
  description,
  error,
  className = '',
  ...props
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-900">
        {label}
      </label>

      {description ? (
        <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
      ) : null}

      <select
        id={name}
        name={name}
        className={[
          'mt-2 min-h-11 w-full border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition',
          'focus:border-neutral-950',
          error ? 'border-red-500' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
