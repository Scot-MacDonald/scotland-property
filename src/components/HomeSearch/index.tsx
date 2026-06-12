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
}

export function HomeSearch({ suggestions }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')

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
    <div className="relative mt-8 w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Scotland..."
          className="flex-1 border border-gray-300 px-5 py-4 text-lg outline-none focus:border-black"
        />

        <button type="submit" className="bg-black px-8 py-4 text-white">
          Search
        </button>
      </form>

      {query && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 border bg-white shadow-lg">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={`${suggestion.type}-${suggestion.label}`}
              type="button"
              onClick={() => router.push(suggestion.href)}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
            >
              <span>{suggestion.label}</span>

              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {suggestion.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
