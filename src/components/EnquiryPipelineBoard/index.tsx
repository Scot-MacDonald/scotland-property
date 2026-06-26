'use client'

import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CSSProperties, useEffect, useState } from 'react'

const statuses = [
  {
    label: 'New',
    value: 'new',
    className: 'border-yellow-200 bg-yellow-50',
    badgeClassName: 'bg-yellow-100',
  },
  {
    label: 'Contacted',
    value: 'contacted',
    className: 'border-blue-200 bg-blue-50',
    badgeClassName: 'bg-blue-100',
  },
  {
    label: 'Viewing Booked',
    value: 'viewing-booked',
    className: 'border-orange-200 bg-orange-50',
    badgeClassName: 'bg-orange-100',
  },
  {
    label: 'Offer Made',
    value: 'offer-made',
    className: 'border-purple-200 bg-purple-50',
    badgeClassName: 'bg-purple-100',
  },
  {
    label: 'Sale Agreed',
    value: 'sale-agreed',
    className: 'border-green-200 bg-green-50',
    badgeClassName: 'bg-green-100',
  },
  {
    label: 'Completed',
    value: 'completed',
    className: 'border-emerald-200 bg-emerald-50',
    badgeClassName: 'bg-emerald-100',
  },
  {
    label: 'Lost',
    value: 'lost',
    className: 'border-red-200 bg-red-50',
    badgeClassName: 'bg-red-100',
  },
]

type Enquiry = {
  id: string
  name?: string
  email?: string
  phone?: string
  message?: string
  notes?: string | null
  status?: string
  property?: {
    id?: string
    title?: string
    price?: number | null
    slug?: string
  } | null
}

export function EnquiryPipelineBoard({ initialEnquiries }: { initialEnquiries: Enquiry[] }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [enquiries, setEnquiries] = useState(initialEnquiries)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="overflow-x-auto">
        <div className="grid min-w-[1800px] gap-4 xl:grid-cols-7">
          <div className="border p-6 text-sm text-muted-foreground">Loading pipeline...</div>
        </div>
      </div>
    )
  }

  async function handleDragEnd(event: DragEndEvent) {
    const enquiryId = String(event.active.id)
    const nextStatus = event.over?.id ? String(event.over.id) : null

    if (!nextStatus) return

    const enquiry = enquiries.find((item) => item.id === enquiryId)

    if (!enquiry || enquiry.status === nextStatus) return

    const previousEnquiries = enquiries

    setEnquiries((current) =>
      current.map((item) => (item.id === enquiryId ? { ...item, status: nextStatus } : item)),
    )

    const res = await fetch('/api/update-enquiry-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enquiryId,
        status: nextStatus,
      }),
    })

    if (!res.ok) {
      setEnquiries(previousEnquiries)
      alert('Could not update enquiry status.')
      return
    }

    router.refresh()
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto">
        <div className="grid min-w-[1800px] gap-4 xl:grid-cols-7">
          {statuses.map((status) => {
            const statusEnquiries = enquiries.filter((enquiry) => enquiry.status === status.value)

            return <PipelineColumn key={status.value} status={status} enquiries={statusEnquiries} />
          })}
        </div>
      </div>
    </DndContext>
  )
}

function PipelineColumn({
  status,
  enquiries,
}: {
  status: (typeof statuses)[number]
  enquiries: Enquiry[]
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.value,
  })

  return (
    <section
      ref={setNodeRef}
      className={`border ${status.className} ${isOver ? 'ring-2 ring-black' : ''}`}
    >
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-medium">{status.label}</h2>

          <span className={`rounded-full px-3 py-1 text-xs ${status.badgeClassName}`}>
            {enquiries.length}
          </span>
        </div>
      </div>

      <div className="min-h-[240px] space-y-3 p-3">
        {enquiries.map((enquiry) => (
          <PipelineCard key={enquiry.id} enquiry={enquiry} />
        ))}

        {enquiries.length === 0 && (
          <div className="border border-dashed bg-white p-4 text-sm text-muted-foreground">
            Drop enquiries here.
          </div>
        )}
      </div>
    </section>
  )
}

function PipelineCard({ enquiry }: { enquiry: Enquiry }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: enquiry.id,
  })

  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  const property = typeof enquiry.property === 'object' ? enquiry.property : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab border bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 active:cursor-grabbing"
    >
      <Link
        href={`/admin/collections/enquiries/${enquiry.id}`}
        onClick={(event) => {
          if (isDragging) event.preventDefault()
        }}
      >
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div className="min-w-0">
            <p className="font-medium">{enquiry.name}</p>

            {enquiry.email && (
              <p className="mt-1 wrap-break-word text-sm text-muted-foreground">{enquiry.email}</p>
            )}
          </div>

          <span className="text-xl text-gray-300">→</span>
        </div>

        {property?.title && (
          <div className="mt-4 border-t pt-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Property</p>

            <p className="mt-1 text-sm">{property.title}</p>

            {property.price ? (
              <p className="mt-1 text-sm font-medium">£{property.price.toLocaleString('en-GB')}</p>
            ) : null}
          </div>
        )}

        {enquiry.phone && <p className="mt-4 text-sm text-muted-foreground">{enquiry.phone}</p>}

        {enquiry.message && (
          <div className="mt-4 border-t pt-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Message</p>

            <p className="mt-1 line-clamp-3 text-sm">{enquiry.message}</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {enquiry.phone && (
            <span className="border px-2 py-1 text-xs text-muted-foreground">Phone</span>
          )}

          {enquiry.notes && (
            <span className="border px-2 py-1 text-xs text-muted-foreground">Notes</span>
          )}
        </div>
      </Link>
    </div>
  )
}
