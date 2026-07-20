'use client'

import { SelectField } from '@/components/DashboardV2/Fields'
import { WorkspacePanel, WorkspaceStatusFooter } from '@/components/DashboardV2/Workspace'
import { useWorkspaceEditor } from '@/hooks/useWorkspaceEditor'

type ViewingOutcome =
  | 'not-recorded'
  | 'interested'
  | 'second-viewing'
  | 'considering-offer'
  | 'offer-expected'
  | 'not-interested'

type ViewingFeedbackFormProps = {
  viewing: {
    id: string
    viewerRating?: number | null
    viewingOutcome?: string | null
    feedback?: string | null
    vendorFeedback?: string | null
    followUpRequired?: boolean | null
    followUpNotes?: string | null
  }
}

type ViewingFeedbackValues = {
  viewerRating: string
  viewingOutcome: ViewingOutcome
  feedback: string
  vendorFeedback: string
  followUpRequired: string
  followUpNotes: string
}

const ratingOptions = [
  {
    value: '',
    label: 'Not rated',
  },
  {
    value: '1',
    label: '1 — Very low interest',
  },
  {
    value: '2',
    label: '2 — Low interest',
  },
  {
    value: '3',
    label: '3 — Moderate interest',
  },
  {
    value: '4',
    label: '4 — Strong interest',
  },
  {
    value: '5',
    label: '5 — Very strong interest',
  },
]

const outcomeOptions = [
  {
    value: 'not-recorded',
    label: 'Not recorded',
  },
  {
    value: 'interested',
    label: 'Interested',
  },
  {
    value: 'second-viewing',
    label: 'Second viewing requested',
  },
  {
    value: 'considering-offer',
    label: 'Considering an offer',
  },
  {
    value: 'offer-expected',
    label: 'Offer expected',
  },
  {
    value: 'not-interested',
    label: 'Not interested',
  },
]

const followUpOptions = [
  {
    value: 'no',
    label: 'No follow-up required',
  },
  {
    value: 'yes',
    label: 'Follow-up required',
  },
]

function isViewingOutcome(value: string | null | undefined): value is ViewingOutcome {
  return outcomeOptions.some((option) => option.value === value)
}

type TextareaFieldProps = {
  id: string
  label: string
  value: string
  placeholder: string
  rows?: number
  onChange: (value: string) => void
}

function TextareaField({ id, label, value, placeholder, rows = 8, onChange }: TextareaFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-900">
        {label}
      </label>

      <textarea
        id={id}
        name={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        className="mt-2 w-full resize-y border border-neutral-300 bg-white px-3 py-3 text-sm leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
      />
    </div>
  )
}

export function ViewingFeedbackForm({ viewing }: ViewingFeedbackFormProps) {
  const editor = useWorkspaceEditor<ViewingFeedbackValues>({
    initialValues: {
      viewerRating: viewing.viewerRating ? String(viewing.viewerRating) : '',
      viewingOutcome: isViewingOutcome(viewing.viewingOutcome)
        ? viewing.viewingOutcome
        : 'not-recorded',
      feedback: viewing.feedback || '',
      vendorFeedback: viewing.vendorFeedback || '',
      followUpRequired: viewing.followUpRequired ? 'yes' : 'no',
      followUpNotes: viewing.followUpNotes || '',
    },
  })

  async function saveFeedback() {
    if (!editor.isDirty || editor.isSaving) {
      return
    }

    const nextValues: ViewingFeedbackValues = {
      ...editor.values,
      feedback: editor.values.feedback.trim(),
      vendorFeedback: editor.values.vendorFeedback.trim(),
      followUpNotes: editor.values.followUpNotes.trim(),
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
          viewerRating: nextValues.viewerRating ? Number(nextValues.viewerRating) : null,
          viewingOutcome: nextValues.viewingOutcome,
          feedback: nextValues.feedback || null,
          vendorFeedback: nextValues.vendorFeedback || null,
          followUpRequired: nextValues.followUpRequired === 'yes',
          followUpNotes: nextValues.followUpNotes || null,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok) {
        throw new Error(result.error || 'Could not update the viewing feedback.')
      }

      editor.commitValues(nextValues)
      editor.finishSave('Viewing feedback saved successfully.')
    } catch (saveError) {
      editor.failSave(saveError, 'Could not update the viewing feedback.')
    }
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Viewer response"
        description="Record the viewer’s level of interest and the likely outcome of the appointment."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <SelectField
            label="Viewer rating"
            name="viewerRating"
            value={editor.values.viewerRating}
            options={ratingOptions}
            onChange={(event) => {
              editor.setField('viewerRating', event.target.value)
            }}
          />

          <SelectField
            label="Viewing outcome"
            name="viewingOutcome"
            value={editor.values.viewingOutcome}
            options={outcomeOptions}
            onChange={(event) => {
              editor.setField('viewingOutcome', event.target.value as ViewingOutcome)
            }}
          />
        </div>

        <div className="mt-6">
          <TextareaField
            id="feedback"
            label="Viewer feedback"
            value={editor.values.feedback}
            placeholder="Record what the viewer liked, disliked, questioned or raised during the appointment..."
            onChange={(value) => {
              editor.setField('feedback', value)
            }}
          />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Vendor feedback"
        description="Record information that should be shared with the property owner."
      >
        <TextareaField
          id="vendorFeedback"
          label="Feedback for the vendor"
          value={editor.values.vendorFeedback}
          placeholder="Summarise the feedback that should be communicated to the vendor..."
          onChange={(value) => {
            editor.setField('vendorFeedback', value)
          }}
        />
      </WorkspacePanel>

      <WorkspacePanel
        title="Follow-up"
        description="Record whether further action is required after the viewing."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <SelectField
            label="Follow-up status"
            name="followUpRequired"
            value={editor.values.followUpRequired}
            options={followUpOptions}
            onChange={(event) => {
              editor.setField('followUpRequired', event.target.value)
            }}
          />
        </div>

        <div className="mt-6">
          <TextareaField
            id="followUpNotes"
            label="Follow-up notes"
            rows={6}
            value={editor.values.followUpNotes}
            placeholder="Add details about calls, emails, second viewings or other next actions..."
            onChange={(value) => {
              editor.setField('followUpNotes', value)
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
        onSave={saveFeedback}
        saveLabel="Save feedback"
      />
    </div>
  )
}
