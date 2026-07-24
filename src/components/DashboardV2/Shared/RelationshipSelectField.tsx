'use client'

import type { ChangeEvent } from 'react'

export type RelationshipSelectOption = {
  id: string
  label: string
  description?: string | null
}

type RelationshipSelectFieldProps = {
  label: string
  name: string
  value: string
  options: RelationshipSelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  description?: string
  error?: string | null
  required?: boolean
  disabled?: boolean
  className?: string
}

export function RelationshipSelectField({
  label,
  name,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  description,
  error,
  required = false,
  disabled = false,
  className,
}: RelationshipSelectFieldProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value)
  }

  const descriptionId = description ? `${name}-description` : undefined
  const errorId = error ? `${name}-error` : undefined

  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-xs font-semibold uppercase tracking-wide text-neutral-600"
      >
        {label}

        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </label>

      {description ? (
        <p id={descriptionId} className="mt-1 text-sm leading-6 text-neutral-500">
          {description}
        </p>
      ) : null}

      <div className="relative mt-2">
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={[
            'h-11 w-full appearance-none border bg-white px-3 pr-10 text-sm text-neutral-950 outline-none transition',
            'focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950',
            'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500',
            error ? 'border-red-400 focus:border-red-600 focus:ring-red-600' : 'border-neutral-300',
          ].join(' ')}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.description ? `${option.label} — ${option.description}` : option.label}
            </option>
          ))}
        </select>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-500"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="h-4 w-4"
          >
            <path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {error ? (
        <p id={errorId} className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}
