'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Suggestion = {
  label: string
  href: string
  type: 'Town' | 'Region' | 'Property Type'
}

type Props = {
  suggestions: Suggestion[]
  currentQuery?: string
  placeholder?: string
  className?: string
}

export function Search({
  suggestions,
  currentQuery,
  placeholder = 'Search towns, regions, postcodes or property names',
  className = '',
}: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(currentQuery || '')

  const filteredSuggestions = suggestions
    .filter((suggestion) => suggestion.label.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      router.push('/properties')
      return
    }

    router.push(`/properties?q=${encodeURIComponent(trimmedQuery)}`)
  }

  return (
    <div className={`relative mt-8 w-full max-w-4xl ${className}`}>
      <form onSubmit={handleSubmit} className="flex w-full border-b border-t bg-white">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-2 py-7 text-2xl font-light outline-none placeholder:text-neutral-400"
        />

        <button
          type="submit"
          className="border-l px-10 text-xs uppercase tracking-[0.3em] transition hover:bg-black hover:text-white"
        >
          Search
        </button>
      </form>

      {query && filteredSuggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-40 border bg-white">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={`${suggestion.type}-${suggestion.label}`}
              type="button"
              onClick={() => router.push(suggestion.href)}
              className="flex w-full items-center justify-between border-b px-5 py-4 text-left last:border-b-0 hover:bg-neutral-50"
            >
              <span>{suggestion.label}</span>

              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {suggestion.type}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
