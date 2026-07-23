import type { InputHTMLAttributes } from 'react'

type TextFieldProps = {
  label: string
  name: string
  description?: string
  error?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name'>

export function TextField({
  label,
  name,
  description,
  error,
  className = '',
  ...props
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-900">
        {label}
      </label>

      {description ? (
        <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
      ) : null}

      <input
        id={name}
        name={name}
        className={[
          'mt-2 min-h-11 w-full border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition',
          'placeholder:text-neutral-400',
          'focus:border-neutral-950',
          error ? 'border-red-500' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
