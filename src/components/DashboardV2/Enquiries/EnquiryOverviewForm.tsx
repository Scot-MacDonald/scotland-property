'use client'

import { SelectField, TextField } from '@/components/DashboardV2/Fields'
import { WorkspacePanel, WorkspaceStatusFooter } from '@/components/DashboardV2/Workspace'
import { useWorkspaceEditor } from '@/hooks/useWorkspaceEditor'

type EnquiryStatus =
  | 'new'
  | 'contacted'
  | 'viewing-booked'
  | 'offer-made'
  | 'sale-agreed'
  | 'completed'
  | 'lost'

type EnquiryOverviewFormProps = {
  enquiry: {
    id: string
    name: string
    email: string
    phone?: string | null
    message: string
    status?: EnquiryStatus | null
  }
}

type EnquiryOverviewValues = {
  name: string
  email: string
  phone: string
  message: string
  status: EnquiryStatus
}

export function EnquiryOverviewForm({ enquiry }: EnquiryOverviewFormProps) {
  const editor = useWorkspaceEditor<EnquiryOverviewValues>({
    initialValues: {
      name: enquiry.name || '',
      email: enquiry.email || '',
      phone: enquiry.phone || '',
      message: enquiry.message || '',
      status: enquiry.status || 'new',
    },
  })

  async function saveEnquiry() {
    editor.beginSave()

    try {
      const response = await fetch('/api/update-enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enquiryId: enquiry.id,
          name: editor.values.name,
          email: editor.values.email,
          phone: editor.values.phone,
          message: editor.values.message,
          status: editor.values.status,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok) {
        throw new Error(result.error || 'Could not update enquiry.')
      }

      editor.commitValues()
      editor.finishSave('Enquiry saved successfully.')
    } catch (saveError) {
      editor.failSave(saveError, 'Could not update enquiry.')
    }
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Contact details"
        description="Buyer contact information submitted with the property enquiry."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <TextField
            label="Name"
            name="name"
            required
            value={editor.values.name}
            onChange={(event) => {
              editor.setField('name', event.target.value)
            }}
          />

          <TextField
            label="Email"
            name="email"
            required
            type="email"
            value={editor.values.email}
            onChange={(event) => {
              editor.setField('email', event.target.value)
            }}
          />

          <TextField
            label="Phone"
            name="phone"
            type="tel"
            value={editor.values.phone}
            onChange={(event) => {
              editor.setField('phone', event.target.value)
            }}
          />

          <SelectField
            label="Status"
            name="status"
            value={editor.values.status}
            options={[
              {
                label: 'New',
                value: 'new',
              },
              {
                label: 'Contacted',
                value: 'contacted',
              },
              {
                label: 'Viewing Booked',
                value: 'viewing-booked',
              },
              {
                label: 'Offer Made',
                value: 'offer-made',
              },
              {
                label: 'Sale Agreed',
                value: 'sale-agreed',
              },
              {
                label: 'Completed',
                value: 'completed',
              },
              {
                label: 'Lost',
                value: 'lost',
              },
            ]}
            onChange={(event) => {
              editor.setField('status', event.target.value as EnquiryStatus)
            }}
          />
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="Buyer message" description="The message submitted by the buyer.">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-neutral-900">
            Message
          </label>

          <textarea
            id="message"
            name="message"
            required
            className="mt-2 min-h-48 w-full resize-y border border-neutral-300 bg-white px-3 py-3 text-sm leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
            value={editor.values.message}
            onChange={(event) => {
              editor.setField('message', event.target.value)
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
        onSave={saveEnquiry}
        saveLabel="Save enquiry"
      />
    </div>
  )
}
