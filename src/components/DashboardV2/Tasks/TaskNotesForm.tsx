'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { WorkspaceForm, WorkspacePanel } from '@/components/DashboardV2/Workspace'

type TaskNotesFormProps = {
  taskId: string
  internalNotes?: string | null
}

type SaveState = 'idle' | 'saving' | 'success' | 'error'

export function TaskNotesForm({ taskId, internalNotes }: TaskNotesFormProps) {
  const router = useRouter()

  const initialNotes = internalNotes || ''

  const [notes, setNotes] = useState(initialNotes)
  const [savedNotes, setSavedNotes] = useState(initialNotes)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const hasChanges = notes !== savedNotes

  function handleChange(value: string) {
    setNotes(value)
    setSaveState('idle')
    setErrorMessage('')
  }

  function handleDiscard() {
    setNotes(savedNotes)
    setSaveState('idle')
    setErrorMessage('')
  }

  async function handleSave() {
    setSaveState('saving')
    setErrorMessage('')

    try {
      const response = await fetch('/api/update-task-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          internalNotes: notes,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
        internalNotes?: string | null
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Could not update the task notes.')
      }

      const savedValue = result.internalNotes || ''

      setNotes(savedValue)
      setSavedNotes(savedValue)
      setSaveState('success')

      router.refresh()

      window.setTimeout(() => {
        setSaveState('idle')
      }, 2500)
    } catch (error) {
      setSaveState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Could not update the task notes.')
    }
  }

  return (
    <WorkspaceForm
      hasChanges={hasChanges}
      saving={saveState === 'saving'}
      saved={saveState === 'success'}
      error={saveState === 'error' ? errorMessage : null}
      onSave={handleSave}
      onDiscard={handleDiscard}
    >
      <WorkspacePanel
        title="Internal notes"
        description="Private information visible only to the agency team."
      >
        <div>
          <label
            htmlFor="task-internal-notes"
            className="block text-sm font-medium text-neutral-900"
          >
            Notes
          </label>

          <textarea
            id="task-internal-notes"
            value={notes}
            onChange={(event) => {
              handleChange(event.target.value)
            }}
            disabled={saveState === 'saving'}
            rows={12}
            placeholder="Add private notes about this task..."
            className="mt-2 block min-h-64 w-full resize-y border border-neutral-300 bg-white px-4 py-3 text-sm leading-7 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
          />

          <p className="mt-2 text-xs text-neutral-500">
            These notes are not visible to buyers, sellers or other public users.
          </p>
        </div>
      </WorkspacePanel>
    </WorkspaceForm>
  )
}
