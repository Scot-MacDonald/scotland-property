'use client'

import { TextField, ToggleField } from '@/components/DashboardV2/Fields'
import { WorkspacePanel, WorkspaceStatusFooter } from '@/components/DashboardV2/Workspace'
import { useWorkspaceEditor } from '@/hooks/useWorkspaceEditor'

type BuyerOverviewFormProps = {
  buyer: {
    id: string
    name?: string | null
    email: string
    alertsEnabled?: boolean | null
  }
}

type BuyerOverviewValues = {
  name: string
  email: string
  alertsEnabled: boolean
}

export function BuyerOverviewForm({ buyer }: BuyerOverviewFormProps) {
  const editor = useWorkspaceEditor<BuyerOverviewValues>({
    initialValues: {
      name: buyer.name || '',
      email: buyer.email || '',
      alertsEnabled: buyer.alertsEnabled ?? true,
    },
  })

  async function saveBuyer() {
    editor.beginSave()

    try {
      const response = await fetch('/api/update-buyer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerId: buyer.id,
          name: editor.values.name,
          email: editor.values.email,
          alertsEnabled: editor.values.alertsEnabled,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok) {
        throw new Error(result.error || 'Could not update buyer.')
      }

      editor.commitValues()
      editor.finishSave('Buyer saved successfully.')
    } catch (saveError) {
      editor.failSave(saveError, 'Could not update buyer.')
    }
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Buyer profile"
        description="Manage the buyer’s account information and property alert preferences."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <TextField
            label="Name"
            name="name"
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
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Property alerts"
        description="Control whether this buyer receives alerts for saved searches."
      >
        <ToggleField
          checked={editor.values.alertsEnabled}
          description="Send matching-property notifications for the buyer’s saved searches."
          label="Alerts enabled"
          name="alertsEnabled"
          onChange={(checked) => {
            editor.setField('alertsEnabled', checked)
          }}
        />
      </WorkspacePanel>

      <WorkspaceStatusFooter
        error={editor.error}
        isDirty={editor.isDirty}
        isSaving={editor.isSaving}
        message={editor.message}
        onDiscard={editor.discardChanges}
        onSave={saveBuyer}
        saveLabel="Save buyer"
      />
    </div>
  )
}
