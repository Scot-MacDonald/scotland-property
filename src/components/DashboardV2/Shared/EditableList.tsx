'use client'

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'

export type EditableListItem = {
  id: string
  label: string
  complete?: boolean
}

type EditableListProps = {
  items: EditableListItem[]
  onChange: (items: EditableListItem[]) => void
  allowCompletion?: boolean
  allowDelete?: boolean
  allowAdd?: boolean
  allowReorder?: boolean
  placeholder?: string
  emptyLabel?: string
  addLabel?: string
  disabled?: boolean
  className?: string
}

function createItem(): EditableListItem {
  return {
    id: crypto.randomUUID(),
    label: '',
    complete: false,
  }
}

export function EditableList({
  items,
  onChange,
  allowCompletion = true,
  allowDelete = true,
  allowAdd = true,
  allowReorder = false,
  placeholder = 'Add an item',
  emptyLabel = 'No items yet.',
  addLabel = 'Add item',
  disabled = false,
  className,
}: EditableListProps) {
  const [focusItemId, setFocusItemId] = useState<string | null>(null)

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    if (!focusItemId) {
      return
    }

    const input = inputRefs.current[focusItemId]

    if (!input) {
      return
    }

    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)

    setFocusItemId(null)
  }, [focusItemId, items])

  function updateItem(itemId: string, updater: (item: EditableListItem) => EditableListItem) {
    onChange(
      items.map((item) => {
        if (item.id !== itemId) {
          return item
        }

        return updater(item)
      }),
    )
  }

  function updateLabel(itemId: string, event: ChangeEvent<HTMLInputElement>) {
    updateItem(itemId, (item) => ({
      ...item,
      label: event.target.value,
    }))
  }

  function toggleComplete(itemId: string) {
    if (!allowCompletion || disabled) {
      return
    }

    updateItem(itemId, (item) => ({
      ...item,
      complete: !item.complete,
    }))
  }

  function addItem(afterItemId?: string) {
    if (!allowAdd || disabled) {
      return
    }

    const nextItem = createItem()

    if (!afterItemId) {
      onChange([...items, nextItem])
      setFocusItemId(nextItem.id)
      return
    }

    const currentIndex = items.findIndex((item) => item.id === afterItemId)

    if (currentIndex === -1) {
      onChange([...items, nextItem])
      setFocusItemId(nextItem.id)
      return
    }

    const nextItems = [...items]

    nextItems.splice(currentIndex + 1, 0, nextItem)

    onChange(nextItems)
    setFocusItemId(nextItem.id)
  }

  function deleteItem(itemId: string, focusPrevious = false) {
    if (!allowDelete || disabled) {
      return
    }

    const currentIndex = items.findIndex((item) => item.id === itemId)

    if (currentIndex === -1) {
      return
    }

    const nextItems = items.filter((item) => item.id !== itemId)

    onChange(nextItems)

    if (focusPrevious && currentIndex > 0) {
      setFocusItemId(items[currentIndex - 1].id)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, item: EditableListItem) {
    if (disabled) {
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()

      if (allowAdd) {
        addItem(item.id)
      }

      return
    }

    if (event.key === 'Backspace' && item.label.length === 0 && items.length > 1 && allowDelete) {
      event.preventDefault()
      deleteItem(item.id, true)
    }
  }

  return (
    <div className={className}>
      {items.length === 0 ? (
        <div className="border border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 text-center">
          <p className="text-sm text-neutral-500">{emptyLabel}</p>

          {allowAdd ? (
            <button
              type="button"
              onClick={() => {
                addItem()
              }}
              disabled={disabled}
              className="mt-4 inline-flex items-center justify-center border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add first item
            </button>
          ) : null}
        </div>
      ) : (
        <div className="divide-y divide-neutral-200 border border-neutral-200 bg-white">
          {items.map((item) => (
            <div key={item.id} className="group flex min-h-14 items-center gap-3 px-3 py-2">
              {allowCompletion ? (
                <button
                  type="button"
                  onClick={() => {
                    toggleComplete(item.id)
                  }}
                  disabled={disabled}
                  aria-label={
                    item.complete
                      ? `Mark ${item.label || 'item'} incomplete`
                      : `Mark ${item.label || 'item'} complete`
                  }
                  className={[
                    'inline-flex h-5 w-5 shrink-0 items-center justify-center border transition',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    item.complete
                      ? 'border-neutral-950 bg-neutral-950 text-white'
                      : 'border-neutral-300 bg-white text-transparent hover:border-neutral-950',
                  ].join(' ')}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="m5 10 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : null}

              <input
                ref={(element) => {
                  inputRefs.current[item.id] = element
                }}
                type="text"
                value={item.label}
                onChange={(event) => {
                  updateLabel(item.id, event)
                }}
                onKeyDown={(event) => {
                  handleKeyDown(event, item)
                }}
                disabled={disabled}
                placeholder={placeholder}
                aria-label="List item"
                className={[
                  'min-w-0 flex-1 border-0 bg-transparent px-0 py-2 text-sm text-neutral-950 outline-none',
                  'placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:text-neutral-500',
                  item.complete ? 'text-neutral-500 line-through' : '',
                ].join(' ')}
              />

              {allowReorder ? (
                <span
                  title="Drag-and-drop reordering will be added in the next step."
                  className="inline-flex h-8 w-8 shrink-0 cursor-not-allowed items-center justify-center text-neutral-300"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <circle cx="7" cy="5" r="1.2" />
                    <circle cx="13" cy="5" r="1.2" />
                    <circle cx="7" cy="10" r="1.2" />
                    <circle cx="13" cy="10" r="1.2" />
                    <circle cx="7" cy="15" r="1.2" />
                    <circle cx="13" cy="15" r="1.2" />
                  </svg>
                </span>
              ) : null}

              {allowDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    deleteItem(item.id)
                  }}
                  disabled={disabled}
                  aria-label={`Delete ${item.label || 'item'}`}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-neutral-400 opacity-0 transition hover:text-red-700 focus:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 6h12M8 3h4l1 3H7l1-3Zm-2 3 .7 10h6.6L14 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && allowAdd ? (
        <button
          type="button"
          onClick={() => {
            addItem()
          }}
          disabled={disabled}
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-neutral-700 transition hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span
            className="inline-flex h-5 w-5 items-center justify-center border border-neutral-300 text-base leading-none"
            aria-hidden="true"
          >
            +
          </span>

          {addLabel}
        </button>
      ) : null}
    </div>
  )
}
