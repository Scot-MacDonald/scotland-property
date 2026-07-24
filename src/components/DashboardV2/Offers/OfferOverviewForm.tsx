'use client'

import { SelectField, TextField } from '@/components/DashboardV2/Fields'
import { WorkspacePanel, WorkspaceStatusFooter } from '@/components/DashboardV2/Workspace'
import { useWorkspaceEditor } from '@/hooks/useWorkspaceEditor'

type OfferStatus = 'draft' | 'submitted' | 'negotiating' | 'accepted' | 'rejected' | 'withdrawn'

type OfferConfidence = 'low' | 'medium' | 'high'

type AgentOption = {
  id: string
  name: string
}

type OfferOverviewFormProps = {
  offer: {
    id: string
    amount: number
    status?: string | null
    confidence?: string | null
    agentId?: string | null
    submittedAt?: string | null
    expiresAt?: string | null
  }
  agents: AgentOption[]
}

type OfferOverviewValues = {
  amount: string
  status: OfferStatus
  confidence: OfferConfidence
  agent: string
  submittedAt: string
  expiresAt: string
}

const offerStatusOptions = [
  {
    value: 'draft',
    label: 'Draft',
  },
  {
    value: 'submitted',
    label: 'Submitted',
  },
  {
    value: 'negotiating',
    label: 'Negotiating',
  },
  {
    value: 'accepted',
    label: 'Accepted',
  },
  {
    value: 'rejected',
    label: 'Rejected',
  },
  {
    value: 'withdrawn',
    label: 'Withdrawn',
  },
]

const confidenceOptions = [
  {
    value: 'low',
    label: 'Low',
  },
  {
    value: 'medium',
    label: 'Medium',
  },
  {
    value: 'high',
    label: 'High',
  },
]

function isOfferStatus(value: string | null | undefined): value is OfferStatus {
  return offerStatusOptions.some((option) => option.value === value)
}

function isOfferConfidence(value: string | null | undefined): value is OfferConfidence {
  return confidenceOptions.some((option) => option.value === value)
}

function formatDateTimeLocal(value: string | null | undefined) {
  if (!value) {
    return ''
  }

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

export function OfferOverviewForm({ offer, agents }: OfferOverviewFormProps) {
  const editor = useWorkspaceEditor<OfferOverviewValues>({
    initialValues: {
      amount: String(offer.amount || ''),
      status: isOfferStatus(offer.status) ? offer.status : 'draft',
      confidence: isOfferConfidence(offer.confidence) ? offer.confidence : 'medium',
      agent: offer.agentId || '',
      submittedAt: formatDateTimeLocal(offer.submittedAt),
      expiresAt: formatDateTimeLocal(offer.expiresAt),
    },
  })

  async function saveOffer() {
    if (!editor.isDirty || editor.isSaving) {
      return
    }

    const amount = Number(editor.values.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      editor.failSave(new Error('Enter a valid offer amount.'), 'Enter a valid offer amount.')
      return
    }

    const nextValues: OfferOverviewValues = {
      ...editor.values,
      amount: String(amount),
    }

    editor.beginSave()

    try {
      const submittedAt =
        nextValues.submittedAt ||
        (nextValues.status === 'submitted' || nextValues.status === 'negotiating'
          ? undefined
          : null)

      const response = await fetch('/api/update-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: offer.id,
          amount,
          status: nextValues.status,
          confidence: nextValues.confidence,
          agent: nextValues.agent || null,
          submittedAt,
          expiresAt: nextValues.expiresAt || null,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok) {
        throw new Error(result.error || 'Could not update the offer.')
      }

      editor.commitValues(nextValues)
      editor.finishSave('Offer saved successfully.')
    } catch (saveError) {
      editor.failSave(saveError, 'Could not update the offer.')
    }
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Offer overview"
        description="Manage the offer amount, status, confidence and assigned agent."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <TextField
            label="Offer amount"
            name="amount"
            required
            type="number"
            min="0"
            step="1000"
            value={editor.values.amount}
            onChange={(event) => {
              editor.setField('amount', event.target.value)
            }}
          />

          <SelectField
            label="Status"
            name="status"
            required
            value={editor.values.status}
            options={offerStatusOptions}
            onChange={(event) => {
              editor.setField('status', event.target.value as OfferStatus)
            }}
          />

          <SelectField
            label="Confidence"
            name="confidence"
            required
            value={editor.values.confidence}
            options={confidenceOptions}
            onChange={(event) => {
              editor.setField('confidence', event.target.value as OfferConfidence)
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
                label: agent.name,
              })),
            ]}
            onChange={(event) => {
              editor.setField('agent', event.target.value)
            }}
          />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Offer dates"
        description="Record when the offer was submitted and when it expires."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <TextField
            label="Submitted"
            name="submittedAt"
            type="datetime-local"
            value={editor.values.submittedAt}
            onChange={(event) => {
              editor.setField('submittedAt', event.target.value)
            }}
          />

          <TextField
            label="Expires"
            name="expiresAt"
            type="datetime-local"
            value={editor.values.expiresAt}
            onChange={(event) => {
              editor.setField('expiresAt', event.target.value)
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
        onSave={saveOffer}
        saveLabel="Save offer"
      />
    </div>
  )
}
