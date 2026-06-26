'use client'

import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CSSProperties, useState } from 'react'

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
    label: 'Booked',
    value: 'valuation-booked',
    className: 'border-orange-200 bg-orange-50',
    badgeClassName: 'bg-orange-100',
  },
  {
    label: 'Won',
    value: 'instruction-won',
    className: 'border-green-200 bg-green-50',
    badgeClassName: 'bg-green-100',
  },
  {
    label: 'Lost',
    value: 'lost',
    className: 'border-red-200 bg-red-50',
    badgeClassName: 'bg-red-100',
  },
]

function formatMoney(value?: number | null) {
  if (!value) return 'Not provided'
  return `£${value.toLocaleString('en-GB')}`
}

function getFollowUpStatus(dateValue?: string | null) {
  if (!dateValue) return null

  const now = new Date()
  const followUpDate = new Date(dateValue)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (followUpDate < now) return 'overdue'
  if (followUpDate >= today && followUpDate < tomorrow) return 'today'

  return 'upcoming'
}

function getFollowUpLabel(status: string | null) {
  if (status === 'overdue') return 'Overdue'
  if (status === 'today') return 'Due today'
  if (status === 'upcoming') return 'Upcoming'
  return 'No follow-up'
}

function getFollowUpClass(status: string | null) {
  if (status === 'overdue') return 'border-red-200 bg-red-50 text-red-700'
  if (status === 'today') return 'border-yellow-200 bg-yellow-50 text-yellow-800'
  if (status === 'upcoming') return 'border-gray-200 bg-gray-50 text-gray-700'
  return 'border-gray-200 bg-white text-gray-500'
}

type Lead = {
  id: string
  name?: string
  email?: string
  phone?: string
  postcode?: string
  estimatedValue?: number | null
  status?: string
  source?: string
  notes?: string | null
  nextFollowUpAt?: string | null
  nextFollowUpTask?: string | null
}

export function ValuationLeadPipelineBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)

  async function handleDragEnd(event: DragEndEvent) {
    const leadId = String(event.active.id)
    const nextStatus = event.over?.id ? String(event.over.id) : null

    if (!nextStatus) return

    const lead = leads.find((item) => item.id === leadId)

    if (!lead || lead.status === nextStatus) return

    const previousLeads = leads

    setLeads((current) =>
      current.map((item) => (item.id === leadId ? { ...item, status: nextStatus } : item)),
    )

    const res = await fetch('/api/update-valuation-lead-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leadId,
        status: nextStatus,
      }),
    })

    if (!res.ok) {
      setLeads(previousLeads)
      alert('Could not update lead status.')
      return
    }

    router.refresh()
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid gap-4 xl:grid-cols-5">
        {statuses.map((status) => {
          const statusLeads = leads.filter((lead) => lead.status === status.value)

          return <PipelineColumn key={status.value} status={status} leads={statusLeads} />
        })}
      </div>
    </DndContext>
  )
}

function PipelineColumn({ status, leads }: { status: (typeof statuses)[number]; leads: Lead[] }) {
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
            {leads.length}
          </span>
        </div>
      </div>

      <div className="min-h-[220px] space-y-3 p-3">
        {leads.map((lead) => (
          <PipelineCard key={lead.id} lead={lead} />
        ))}

        {leads.length === 0 && (
          <div className="border border-dashed bg-white p-4 text-sm text-muted-foreground">
            Drop leads here.
          </div>
        )}
      </div>
    </section>
  )
}

function PipelineCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  })

  const followUpStatus = getFollowUpStatus(lead.nextFollowUpAt)

  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab border bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 active:cursor-grabbing"
    >
      <Link
        href={`/admin/collections/valuation-leads/${lead.id}`}
        onClick={(event) => {
          if (isDragging) event.preventDefault()
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">{lead.name}</p>

            <p className="mt-1 text-sm text-muted-foreground">{lead.postcode || 'No postcode'}</p>
          </div>

          <span className="text-xl text-gray-300">→</span>
        </div>

        <p className="mt-4 text-lg font-medium">{formatMoney(lead.estimatedValue)}</p>

        <div className={`mt-4 border px-3 py-2 text-xs ${getFollowUpClass(followUpStatus)}`}>
          <p className="uppercase tracking-[0.2em]">{getFollowUpLabel(followUpStatus)}</p>

          {lead.nextFollowUpAt && (
            <p className="mt-1 normal-case tracking-normal">
              {new Date(lead.nextFollowUpAt).toLocaleString('en-GB')}
            </p>
          )}

          {lead.nextFollowUpTask && (
            <p className="mt-1 normal-case tracking-normal">{lead.nextFollowUpTask}</p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="border px-2 py-1 text-xs text-muted-foreground">
            {lead.source || 'website'}
          </span>

          {lead.phone && (
            <span className="border px-2 py-1 text-xs text-muted-foreground">Phone</span>
          )}

          {lead.notes && (
            <span className="border px-2 py-1 text-xs text-muted-foreground">Notes</span>
          )}
        </div>
      </Link>
    </div>
  )
}
