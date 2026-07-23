'use client'

import { SelectField, TextField } from '@/components/DashboardV2/Fields'
import { WorkspacePanel, WorkspaceStatusFooter } from '@/components/DashboardV2/Workspace'
import { useWorkspaceEditor } from '@/hooks/useWorkspaceEditor'

type LeadStatus = 'new' | 'contacted' | 'valuation-booked' | 'instruction-won' | 'lost'

type PropertyType = 'house' | 'flat' | 'estate' | 'land' | 'commercial' | 'other' | ''

type LeadOverviewFormProps = {
  lead: {
    id: string
    name: string
    email: string
    phone?: string | null
    postcode: string
    propertyType?: PropertyType | null
    estimatedValue?: number | null
    status?: LeadStatus | null
    message?: string | null
  }
}

type LeadOverviewValues = {
  name: string
  email: string
  phone: string
  postcode: string
  propertyType: PropertyType
  estimatedValue: string
  status: LeadStatus
  message: string
}

export function LeadOverviewForm({ lead }: LeadOverviewFormProps) {
  const editor = useWorkspaceEditor<LeadOverviewValues>({
    initialValues: {
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      postcode: lead.postcode || '',
      propertyType: lead.propertyType || '',
      estimatedValue: typeof lead.estimatedValue === 'number' ? String(lead.estimatedValue) : '',
      status: lead.status || 'new',
      message: lead.message || '',
    },
  })

  async function saveLead() {
    editor.beginSave()

    try {
      const response = await fetch('/api/update-valuation-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead.id,
          name: editor.values.name,
          email: editor.values.email,
          phone: editor.values.phone,
          postcode: editor.values.postcode,
          propertyType: editor.values.propertyType,
          estimatedValue: editor.values.estimatedValue,
          status: editor.values.status,
          message: editor.values.message,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok) {
        throw new Error(result.error || 'Could not update lead.')
      }

      editor.commitValues()
      editor.finishSave('Lead saved successfully.')
    } catch (saveError) {
      editor.failSave(saveError, 'Could not update lead.')
    }
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Contact details"
        description="Seller contact information supplied with the valuation request."
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

          <TextField
            label="Postcode"
            name="postcode"
            required
            value={editor.values.postcode}
            onChange={(event) => {
              editor.setField('postcode', event.target.value)
            }}
          />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Property details"
        description="Information about the property supplied by the seller."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <SelectField
            label="Property type"
            name="propertyType"
            value={editor.values.propertyType}
            options={[
              {
                label: 'Not specified',
                value: '',
              },
              {
                label: 'House',
                value: 'house',
              },
              {
                label: 'Flat / Apartment',
                value: 'flat',
              },
              {
                label: 'Estate',
                value: 'estate',
              },
              {
                label: 'Land',
                value: 'land',
              },
              {
                label: 'Commercial',
                value: 'commercial',
              },
              {
                label: 'Other',
                value: 'other',
              },
            ]}
            onChange={(event) => {
              editor.setField('propertyType', event.target.value as PropertyType)
            }}
          />

          <TextField
            label="Estimated value"
            name="estimatedValue"
            min="0"
            step="1"
            type="number"
            value={editor.values.estimatedValue}
            onChange={(event) => {
              editor.setField('estimatedValue', event.target.value)
            }}
          />

          <div className="md:col-span-2">
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
                  label: 'Valuation Booked',
                  value: 'valuation-booked',
                },
                {
                  label: 'Instruction Won',
                  value: 'instruction-won',
                },
                {
                  label: 'Lost',
                  value: 'lost',
                },
              ]}
              onChange={(event) => {
                editor.setField('status', event.target.value as LeadStatus)
              }}
            />
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Seller message"
        description="The message submitted with the valuation request."
      >
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-neutral-900">
            Message
          </label>

          <textarea
            id="message"
            name="message"
            className="mt-2 min-h-40 w-full resize-y border border-neutral-300 bg-white px-3 py-3 text-sm leading-6 text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
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
        onSave={saveLead}
        saveLabel="Save lead"
      />
    </div>
  )
}
