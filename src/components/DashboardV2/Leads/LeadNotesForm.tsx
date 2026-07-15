'use client'

import { WorkspacePanel, WorkspaceStatusFooter } from '@/components/DashboardV2/Workspace'
import { useWorkspaceEditor } from '@/hooks/useWorkspaceEditor'

type LeadNotesFormProps = {
  lead: {
    id: string
    notes?: string | null
  }
}

type LeadNotesValues = {
  notes: string
}

export function LeadNotesForm({ lead }: LeadNotesFormProps) {
  const editor = useWorkspaceEditor<LeadNotesValues>({
    initialValues: {
      notes: lead.notes || '',
    },
  })

  async function saveNotes() {
    editor.beginSave()

    try {
      const response = await fetch('/api/update-valuation-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead.id,
          notes: editor.values.notes,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok) {
        throw new Error(result.error || 'Could not update lead notes.')
      }

      editor.commitValues()
      editor.finishSave('Notes saved successfully.')
    } catch (saveError) {
      editor.failSave(saveError, 'Could not update lead notes.')
    }
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Internal notes"
        description="Private notes for agency staff. These are not visible to the seller."
      >
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-neutral-900">
            Notes
          </label>

          <p className="mt-1 text-sm leading-6 text-neutral-500">
            Record calls, valuation feedback, seller preferences and next steps.
          </p>

          <textarea
            id="notes"
            name="notes"
            className="mt-2 min-h-64 w-full resize-y border border-neutral-300 bg-white px-3 py-3 text-sm leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
            placeholder="Add internal notes..."
            value={editor.values.notes}
            onChange={(event) => {
              editor.setField('notes', event.target.value)
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
