'use client'

import { WorkspacePanel, WorkspaceStatusFooter } from '@/components/DashboardV2/Workspace'
import { useWorkspaceEditor } from '@/hooks/useWorkspaceEditor'

type ViewingNotesFormProps = {
  viewingId: string
  internalNotes?: string | null
}

type ViewingNotesValues = {
  internalNotes: string
}

export function ViewingNotesForm({ viewingId, internalNotes }: ViewingNotesFormProps) {
  const editor = useWorkspaceEditor<ViewingNotesValues>({
    initialValues: {
      internalNotes: internalNotes || '',
    },
  })

  async function saveNotes() {
    if (!editor.isDirty || editor.isSaving) {
      return
    }

    const nextValues: ViewingNotesValues = {
      internalNotes: editor.values.internalNotes.trim(),
    }

    editor.beginSave()

    try {
      const response = await fetch('/api/update-viewing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: viewingId,
          internalNotes: nextValues.internalNotes || null,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok) {
        throw new Error(result.error || 'Could not update the viewing notes.')
      }

      editor.commitValues(nextValues)
      editor.finishSave('Viewing notes saved successfully.')
    } catch (saveError) {
      editor.failSave(saveError, 'Could not update the viewing notes.')
    }
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Appointment notes"
        description="Record private notes for your agency team. These are not visible to the viewer."
      >
        <div>
          <label htmlFor="internalNotes" className="block text-sm font-medium text-neutral-900">
            Internal notes
          </label>

          <textarea
            id="internalNotes"
            name="internalNotes"
            rows={12}
            placeholder="Add access instructions, viewer requirements, preparation notes or follow-up details..."
            className="mt-2 min-h-64 w-full resize-y border border-neutral-300 bg-white px-3 py-3 text-sm leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
            value={editor.values.internalNotes}
            onChange={(event) => {
              editor.setField('internalNotes', event.target.value)
            }}
          />
        </div>
      </WorkspacePanel>

      <WorkspaceStatusFooter
        error={editor.error}
        isDirty={editor.isDirty}
        isSaving={editor.isSaving}
        message={editor.message}
        onDiscard={editor.discardChanges}
        onSave={saveNotes}
        saveLabel="Save notes"
      />
    </div>
  )
}
