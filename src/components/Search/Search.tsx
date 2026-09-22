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
  embedded?: boolean
  searchPath?: string
}

export function Search({
  suggestions,
  currentQuery,
  placeholder = 'Search towns, regions, postcodes or property names',
  className = '',
  embedded = false,
  searchPath = '/properties',
}: Props) {
  const router = useRouter()

  const [query, setQuery] = useState(currentQuery || '')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredSuggestions = suggestions
    .filter((suggestion) => suggestion.label.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuery = query.trim()

    setShowSuggestions(false)

    if (!trimmedQuery) {
      router.push(searchPath)
      return
    }

    router.push(`${searchPath}?q=${encodeURIComponent(trimmedQuery)}`)
  }

  function handleSuggestionClick(suggestion: Suggestion) {
    setQuery(suggestion.label)
    setShowSuggestions(false)

    if (searchPath === '/properties/map') {
      const url = new URL(suggestion.href, window.location.origin)
      const suggestionQuery = url.searchParams.get('q')

      if (suggestionQuery) {
        router.push(`${searchPath}?q=${encodeURIComponent(suggestionQuery)}`)
        return
      }
    }

    router.push(suggestion.href)
  }

  return (
    <div className={`relative w-full ${embedded ? '' : 'mt-8 max-w-3xl'} ${className}`}>
      <form
        onSubmit={handleSubmit}
        className={`flex w-full bg-white ${embedded ? 'h-12' : 'border'}`}
      >
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => {
            if (query.trim()) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-400 ${
            embedded ? 'px-5 text-sm' : 'px-4 py-4 text-base'
          }`}
        />

        <button
          type="submit"
          className={`shrink-0 border-l text-[10px] font-medium uppercase tracking-[0.22em] transition hover:bg-black hover:text-white ${
            embedded ? 'px-5' : 'px-7'
          }`}
        >
          Search
        </button>
      </form>

      {showSuggestions && query.trim() && filteredSuggestions.length > 0 ? (
        <div className="absolute -left-px -right-px top-full z-[1100] border bg-white">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={`${suggestion.type}-${suggestion.label}`}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="flex h-12 w-full items-center justify-between border-b px-5 text-left transition last:border-b-0 hover:bg-black hover:text-white"
            >
              <span>{suggestion.label}</span>

              <span className="text-[10px] uppercase tracking-[0.2em] opacity-60">
                {suggestion.type}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
