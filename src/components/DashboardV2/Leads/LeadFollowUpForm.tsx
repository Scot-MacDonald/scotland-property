'use client'

import { TextField, ToggleField } from '@/components/DashboardV2/Fields'
import { WorkspacePanel, WorkspaceStatusFooter } from '@/components/DashboardV2/Workspace'
import { useWorkspaceEditor } from '@/hooks/useWorkspaceEditor'

type LeadFollowUpFormProps = {
  lead: {
    id: string
    nextFollowUpAt?: string | null
    nextFollowUpTask?: string | null
    followUpCompleted?: boolean | null
  }
}

type LeadFollowUpValues = {
  nextFollowUpAt: string
  nextFollowUpTask: string
  followUpCompleted: boolean
}

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)

  return localDate.toISOString().slice(0, 16)
}

export function LeadFollowUpForm({ lead }: LeadFollowUpFormProps) {
  const editor = useWorkspaceEditor<LeadFollowUpValues>({
    initialValues: {
      nextFollowUpAt: toDateTimeLocal(lead.nextFollowUpAt),
      nextFollowUpTask: lead.nextFollowUpTask || '',
      followUpCompleted: lead.followUpCompleted ?? false,
    },
  })

  async function saveFollowUp() {
    editor.beginSave()

    try {
      const response = await fetch('/api/update-valuation-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead.id,
          nextFollowUpAt: editor.values.nextFollowUpAt
            ? new Date(editor.values.nextFollowUpAt).toISOString()
            : '',
          nextFollowUpTask: editor.values.nextFollowUpTask,
          followUpCompleted: editor.values.followUpCompleted,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok) {
        throw new Error(result.error || 'Could not update lead follow-up.')
      }

      editor.commitValues()
      editor.finishSave('Follow-up saved successfully.')
    } catch (saveError) {
      editor.failSave(saveError, 'Could not update lead follow-up.')
    }
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Next follow-up"
        description="Schedule the next action for this seller lead."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <TextField
            label="Follow-up date and time"
            name="nextFollowUpAt"
            type="datetime-local"
            value={editor.values.nextFollowUpAt}
            onChange={(event) => {
              editor.setField('nextFollowUpAt', event.target.value)
            }}
          />

          <TextField
            label="Next task"
            name="nextFollowUpTask"
            description="For example: call client, send valuation pack, or confirm appointment."
            placeholder="Call client"
            value={editor.values.nextFollowUpTask}
            onChange={(event) => {
              editor.setField('nextFollowUpTask', event.target.value)
            }}
          />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Completion"
        description="Mark the current follow-up action as completed."
      >
        <ToggleField
          checked={editor.values.followUpCompleted}
          description="Turn this on when the scheduled follow-up has been completed."
          label="Follow-up completed"
          name="followUpCompleted"
          onChange={(checked) => {
            editor.setField('followUpCompleted', checked)
          }}
        />
      </WorkspacePanel>

      <WorkspaceStatusFooter
        error={editor.error}
        isDirty={editor.isDirty}
        isSaving={editor.isSaving}
        message={editor.message}
        onDiscard={editor.discardChanges}
        onSave={saveFollowUp}
        saveLabel="Save follow-up"
      />
    </div>
  )
}
