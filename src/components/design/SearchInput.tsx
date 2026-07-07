'use client'

import { useState } from 'react'

type Props = {
  currentQuery?: string
  placeholder?: string
}

export function SearchInput({
  currentQuery,
  placeholder = 'Search towns, regions, postcodes or property names',
}: Props) {
  const [query, setQuery] = useState(currentQuery || '')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const params = new URLSearchParams(window.location.search)

    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }

    const queryString = params.toString()
    window.location.href = queryString ? `/properties?${queryString}` : '/properties'
  }

  return (
    <form onSubmit={handleSubmit} className="border-b border-t bg-white">
      <div className="flex items-center gap-4 py-5">
        <span className="text-xl">⌕</span>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-xl outline-none placeholder:text-neutral-400"
        />
      </div>
    </form>
  )
}
