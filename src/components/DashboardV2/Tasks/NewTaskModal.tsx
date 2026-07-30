'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'

type TaskRelationshipType = 'property' | 'lead' | 'enquiry' | 'viewing' | 'buyer'

type AgentOption = {
  value: string
  label: string
}

type NewTaskModalProps = {
  relationshipType: TaskRelationshipType
  relationshipId: string
  relationshipTitle?: string | null
  agents?: AgentOption[]
  triggerLabel?: string
  triggerClassName?: string
}

type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'

type FormState = {
  title: string
  description: string
  priority: TaskPriority
  dueAt: string
  assignedAgent: string
}

const initialFormState: FormState = {
  title: '',
  description: '',
  priority: 'normal',
  dueAt: '',
  assignedAgent: '',
}

function formatRelationshipType(type: TaskRelationshipType) {
  switch (type) {
    case 'property':
      return 'property'

    case 'lead':
      return 'lead'

    case 'enquiry':
      return 'enquiry'

    case 'viewing':
      return 'viewing'

    case 'buyer':
      return 'buyer'

    default:
      return 'record'
  }
}

export function NewTaskModal({
  relationshipType,
  relationshipId,
  relationshipTitle,
  agents = [],
  triggerLabel = 'New task',
  triggerClassName,
}: NewTaskModalProps) {
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(initialFormState)

  const relatedLabel = formatRelationshipType(relationshipType)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, isSubmitting])

  function openModal() {
    setError(null)
    setIsOpen(true)
  }

  function closeModal() {
    if (isSubmitting) {
      return
    }

    setIsOpen(false)
    setError(null)
    setForm(initialFormState)
  }

  function updateField<Key extends keyof FormState>(field: Key, value: FormState[Key]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const title = form.title.trim()

    if (!title) {
      setError('Please enter a task title.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/create-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: form.description.trim() || null,
          priority: form.priority,
          dueAt: form.dueAt || null,
          assignedAgent: form.assignedAgent || null,
          relationshipType,
          relationshipId,
        }),
      })

      const result = (await response.json().catch(() => null)) as {
        ok?: boolean
        error?: string
      } | null

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || 'The task could not be created.')
      }

      setForm(initialFormState)
      setIsOpen(false)
      router.refresh()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'The task could not be created.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={
          triggerClassName ||
          'flex h-10 w-full items-center justify-center bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800'
        }
      >
        {triggerLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Close task form"
            onClick={closeModal}
            className="absolute inset-0 bg-black/45"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-task-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-6 border-b border-neutral-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Work management
                </p>

                <h2 id="new-task-title" className="mt-1 text-xl font-semibold text-neutral-950">
                  New task
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  Create a task for this {relatedLabel}
                  {relationshipTitle ? `: ${relationshipTitle}` : '.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center border border-neutral-200 text-xl text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                <div>
                  <label
                    htmlFor="new-task-title-input"
                    className="mb-2 block text-sm font-semibold text-neutral-800"
                  >
                    Title
                  </label>

                  <input
                    id="new-task-title-input"
                    type="text"
                    value={form.title}
                    onChange={(event) => updateField('title', event.target.value)}
                    placeholder="For example, arrange property photography"
                    autoFocus
                    required
                    className="min-h-11 w-full border border-neutral-300 px-4 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new-task-description"
                    className="mb-2 block text-sm font-semibold text-neutral-800"
                  >
                    Description
                  </label>

                  <textarea
                    id="new-task-description"
                    value={form.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    placeholder="Add any useful context or instructions."
                    rows={5}
                    className="w-full resize-y border border-neutral-300 px-4 py-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="new-task-priority"
                      className="mb-2 block text-sm font-semibold text-neutral-800"
                    >
                      Priority
                    </label>

                    <select
                      id="new-task-priority"
                      value={form.priority}
                      onChange={(event) =>
                        updateField('priority', event.target.value as TaskPriority)
                      }
                      className="min-h-11 w-full border border-neutral-300 bg-white px-4 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="new-task-due-at"
                      className="mb-2 block text-sm font-semibold text-neutral-800"
                    >
                      Due date
                    </label>

                    <input
                      id="new-task-due-at"
                      type="datetime-local"
                      value={form.dueAt}
                      onChange={(event) => updateField('dueAt', event.target.value)}
                      className="min-h-11 w-full border border-neutral-300 px-4 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="new-task-agent"
                    className="mb-2 block text-sm font-semibold text-neutral-800"
                  >
                    Assigned agent
                  </label>

                  <select
                    id="new-task-agent"
                    value={form.assignedAgent}
                    onChange={(event) => updateField('assignedAgent', event.target.value)}
                    className="min-h-11 w-full border border-neutral-300 bg-white px-4 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
                  >
                    <option value="">Unassigned</option>

                    {agents.map((agent) => (
                      <option key={agent.value} value={agent.value}>
                        {agent.label}
                      </option>
                    ))}
                  </select>
                </div>

                {error ? (
                  <div
                    role="alert"
                    className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-neutral-200 bg-white px-6 py-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating…' : 'Create task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
