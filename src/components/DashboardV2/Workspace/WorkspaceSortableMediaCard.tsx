'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export type WorkspaceMediaItem = {
  id: string
  filename: string
  url: string
  alt: string
}

type WorkspaceSortableMediaCardProps = {
  item: WorkspaceMediaItem
  index: number
  isLast: boolean
  onMoveBackward: () => void
  onMoveForward: () => void
  onRemove: () => void
}

export function WorkspaceSortableMediaCard({
  item,
  index,
  isLast,
  onMoveBackward,
  onMoveForward,
  onRemove,
}: WorkspaceSortableMediaCardProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  })

  return (
    <article
      ref={setNodeRef}
      className={[
        'border border-neutral-200 bg-white',
        isDragging ? 'relative z-10 opacity-60 shadow-lg' : 'opacity-100',
      ].join(' ')}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={item.alt} className="h-full w-full object-cover" src={item.url} />

        <button
          type="button"
          className="absolute right-3 top-3 inline-flex h-9 w-9 touch-none cursor-grab items-center justify-center border border-white/70 bg-white/95 text-neutral-800 shadow-sm active:cursor-grabbing"
          aria-label={`Reorder ${item.filename}`}
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <span aria-hidden="true" className="text-base leading-none">
            ⋮⋮
          </span>
        </button>
      </div>

      <div className="space-y-3 border-t border-neutral-200 p-3">
        <p className="truncate text-xs text-neutral-600" title={item.filename}>
          {item.filename}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="border border-neutral-300 px-2 py-1 text-xs text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={index === 0}
            onClick={onMoveBackward}
          >
            Previous
          </button>

          <button
            type="button"
            className="border border-neutral-300 px-2 py-1 text-xs text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isLast}
            onClick={onMoveForward}
          >
            Next
          </button>

          <button
            type="button"
            className="ml-auto border border-red-200 px-2 py-1 text-xs text-red-700"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}
