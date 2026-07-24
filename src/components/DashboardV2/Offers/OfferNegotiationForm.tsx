'use client'

import { WorkspacePanel, WorkspaceStatusFooter } from '@/components/DashboardV2/Workspace'
import { useWorkspaceEditor } from '@/hooks/useWorkspaceEditor'

type OfferNegotiationFormProps = {
  offer: {
    id: string
    conditions?: string | null
    vendorResponse?: string | null
    buyerResponse?: string | null
    internalNotes?: string | null
  }
}

type OfferNegotiationValues = {
  conditions: string
  vendorResponse: string
  buyerResponse: string
  internalNotes: string
}

type TextAreaFieldProps = {
  label: string
  name: string
  value: string
  description?: string
  rows?: number
  onChange: (value: string) => void
}

function TextAreaField({
  label,
  name,
  value,
  description,
  rows = 6,
  onChange,
}: TextAreaFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-neutral-900">{label}</span>

      {description ? (
        <span className="mt-1 block text-sm leading-6 text-neutral-500">{description}</span>
      ) : null}

      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        className="mt-3 block w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
      />
    </label>
  )
}

export function OfferNegotiationForm({ offer }: OfferNegotiationFormProps) {
  const editor = useWorkspaceEditor<OfferNegotiationValues>({
    initialValues: {
      conditions: offer.conditions || '',
      vendorResponse: offer.vendorResponse || '',
      buyerResponse: offer.buyerResponse || '',
      internalNotes: offer.internalNotes || '',
    },
  })

  async function saveNegotiation() {
    if (!editor.isDirty || editor.isSaving) {
      return
    }

    const nextValues: OfferNegotiationValues = {
      conditions: editor.values.conditions.trim(),
      vendorResponse: editor.values.vendorResponse.trim(),
      buyerResponse: editor.values.buyerResponse.trim(),
      internalNotes: editor.values.internalNotes.trim(),
    }

    editor.beginSave()

    try {
      const response = await fetch('/api/update-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: offer.id,
          conditions: nextValues.conditions || null,
          vendorResponse: nextValues.vendorResponse || null,
          buyerResponse: nextValues.buyerResponse || null,
          internalNotes: nextValues.internalNotes || null,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok) {
        throw new Error(result.error || 'Could not update the negotiation.')
      }

      editor.commitValues(nextValues)
      editor.finishSave('Negotiation saved successfully.')
    } catch (saveError) {
      editor.failSave(saveError, 'Could not update the negotiation.')
    }
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Offer conditions"
        description="Record any conditions attached to the offer, including finance, survey or settlement requirements."
      >
        <TextAreaField
          label="Conditions"
          name="conditions"
          rows={7}
          value={editor.values.conditions}
          onChange={(value) => {
            editor.setField('conditions', value)
          }}
        />
      </WorkspacePanel>

      <WorkspacePanel
        title="Negotiation responses"
        description="Keep the buyer and vendor positions clear during the negotiation."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <TextAreaField
            label="Vendor response"
            name="vendorResponse"
            description="Record feedback, counteroffers or conditions from the vendor."
            value={editor.values.vendorResponse}
            onChange={(value) => {
              editor.setField('vendorResponse', value)
            }}
          />

          <TextAreaField
            label="Buyer response"
            name="buyerResponse"
            description="Record the buyer’s response, revised position or next step."
            value={editor.values.buyerResponse}
            onChange={(value) => {
              editor.setField('buyerResponse', value)
            }}
          />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Internal notes"
        description="Private notes visible only to your agency."
      >
        <TextAreaField
          label="Internal negotiation notes"
          name="internalNotes"
          rows={8}
          value={editor.values.internalNotes}
          onChange={(value) => {
            editor.setField('internalNotes', value)
          }}
        />
      </WorkspacePanel>

      <WorkspaceStatusFooter
        error={editor.error}
        isDirty={editor.isDirty}
        isSaving={editor.isSaving}
        message={editor.message}
        onDiscard={editor.discardChanges}
        onSave={saveNegotiation}
        saveLabel="Save negotiation"
      />
    </div>
  )
}
