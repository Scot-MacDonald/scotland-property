'use client'

import { SelectField, TextField } from '@/components/DashboardV2/Fields'
import { WorkspacePanel, WorkspaceStatusFooter } from '@/components/DashboardV2/Workspace'
import { useWorkspaceEditor } from '@/hooks/useWorkspaceEditor'

type ViewingStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'

type AgentOption = {
  id: string
  label: string
}

type ViewingOverviewFormProps = {
  viewing: {
    id: string
    dateTime: string
    durationMinutes?: number | null
    status?: string | null
    agentId?: string | null
    contactName: string
    contactEmail: string
    contactPhone?: string | null
  }
  agents: AgentOption[]
}

type ViewingOverviewValues = {
  dateTime: string
  durationMinutes: string
  status: ViewingStatus
  agent: string
  contactName: string
  contactEmail: string
  contactPhone: string
}

const viewingStatusOptions = [
  {
    value: 'requested',
    label: 'Requested',
  },
  {
    value: 'confirmed',
    label: 'Confirmed',
  },
  {
    value: 'completed',
    label: 'Completed',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
  },
  {
    value: 'no-show',
    label: 'No show',
  },
]

const durationOptions = [15, 30, 45, 60, 75, 90, 120].map((duration) => ({
  value: String(duration),
  label: `${duration} minutes`,
}))

function isViewingStatus(value: string | null | undefined): value is ViewingStatus {
  return viewingStatusOptions.some((option) => option.value === value)
}

function formatDateTimeLocal(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function ViewingOverviewForm({ viewing, agents }: ViewingOverviewFormProps) {
  const editor = useWorkspaceEditor<ViewingOverviewValues>({
    initialValues: {
      dateTime: formatDateTimeLocal(viewing.dateTime),
      durationMinutes: String(viewing.durationMinutes || 60),
      status: isViewingStatus(viewing.status) ? viewing.status : 'requested',
      agent: viewing.agentId || '',
      contactName: viewing.contactName || '',
      contactEmail: viewing.contactEmail || '',
      contactPhone: viewing.contactPhone || '',
    },
  })

  async function saveViewing() {
    if (!editor.isDirty || editor.isSaving) {
      return
    }

    const nextValues: ViewingOverviewValues = {
      ...editor.values,
      contactName: editor.values.contactName.trim(),
      contactEmail: editor.values.contactEmail.trim(),
      contactPhone: editor.values.contactPhone.trim(),
    }

    editor.beginSave()

    try {
      const response = await fetch('/api/update-viewing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: viewing.id,
          dateTime: nextValues.dateTime,
          durationMinutes: Number(nextValues.durationMinutes),
          status: nextValues.status,
          agent: nextValues.agent || null,
          contactName: nextValues.contactName,
          contactEmail: nextValues.contactEmail,
          contactPhone: nextValues.contactPhone || null,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok) {
        throw new Error(result.error || 'Could not update the viewing.')
      }

      editor.commitValues(nextValues)
      editor.finishSave('Viewing saved successfully.')
    } catch (saveError) {
      editor.failSave(saveError, 'Could not update the viewing.')
    }
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Viewing overview"
        description="Manage the appointment time, status, duration and assigned agent."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <TextField
            label="Date and time"
            name="dateTime"
            required
            type="datetime-local"
            value={editor.values.dateTime}
            onChange={(event) => {
              editor.setField('dateTime', event.target.value)
            }}
          />

          <SelectField
            label="Status"
            name="status"
            required
            value={editor.values.status}
            options={viewingStatusOptions}
            onChange={(event) => {
              editor.setField('status', event.target.value as ViewingStatus)
            }}
          />

          <SelectField
            label="Duration"
            name="durationMinutes"
            required
            value={editor.values.durationMinutes}
            options={durationOptions}
            onChange={(event) => {
              editor.setField('durationMinutes', event.target.value)
            }}
          />

          <SelectField
            label="Assigned agent"
            name="agent"
            value={editor.values.agent}
            options={[
              {
                value: '',
                label: 'No assigned agent',
              },
              ...agents.map((agent) => ({
                value: agent.id,
                label: agent.label,
              })),
            ]}
            onChange={(event) => {
              editor.setField('agent', event.target.value)
            }}
          />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Viewer details"
        description="Update the person attending the appointment."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <TextField
            label="Name"
            name="contactName"
            required
            value={editor.values.contactName}
            onChange={(event) => {
              editor.setField('contactName', event.target.value)
            }}
          />

          <TextField
            label="Email"
            name="contactEmail"
            required
            type="email"
            value={editor.values.contactEmail}
            onChange={(event) => {
              editor.setField('contactEmail', event.target.value)
            }}
          />

          <TextField
            label="Phone"
            name="contactPhone"
            type="tel"
            value={editor.values.contactPhone}
            onChange={(event) => {
              editor.setField('contactPhone', event.target.value)
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
        onSave={saveViewing}
        saveLabel="Save viewing"
      />
    </div>
  )
}
