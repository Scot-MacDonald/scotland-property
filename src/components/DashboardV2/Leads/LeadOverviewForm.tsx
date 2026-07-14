'use client'

import { useState } from 'react'

import { SelectField, TextField } from '@/components/DashboardV2/Fields'
import { WorkspacePanel, WorkspaceStatusFooter } from '@/components/DashboardV2/Workspace'
import { useWorkspaceForm } from '@/hooks/useWorkspaceForm'

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

export function LeadOverviewForm({ lead }: LeadOverviewFormProps) {
  const [savedName, setSavedName] = useState(lead.name || '')
  const [savedEmail, setSavedEmail] = useState(lead.email || '')
  const [savedPhone, setSavedPhone] = useState(lead.phone || '')
  const [savedPostcode, setSavedPostcode] = useState(lead.postcode || '')
  const [savedPropertyType, setSavedPropertyType] = useState<PropertyType>(lead.propertyType || '')
  const [savedEstimatedValue, setSavedEstimatedValue] = useState(
    lead.estimatedValue ? String(lead.estimatedValue) : '',
  )
  const [savedStatus, setSavedStatus] = useState<LeadStatus>(lead.status || 'new')
  const [savedMessage, setSavedMessage] = useState(lead.message || '')

  const [name, setName] = useState(savedName)
  const [email, setEmail] = useState(savedEmail)
  const [phone, setPhone] = useState(savedPhone)
  const [postcode, setPostcode] = useState(savedPostcode)
  const [propertyType, setPropertyType] = useState<PropertyType>(savedPropertyType)
  const [estimatedValue, setEstimatedValue] = useState(savedEstimatedValue)
  const [status, setStatus] = useState<LeadStatus>(savedStatus)
  const [messageText, setMessageText] = useState(savedMessage)

  const { isSaving, message, error, beginSave, finishSave, failSave, clearMessages } =
    useWorkspaceForm()

  const isDirty =
    name !== savedName ||
    email !== savedEmail ||
    phone !== savedPhone ||
    postcode !== savedPostcode ||
    propertyType !== savedPropertyType ||
    estimatedValue !== savedEstimatedValue ||
    status !== savedStatus ||
    messageText !== savedMessage

  function beginEdit() {
    clearMessages()
  }

  function discardChanges() {
    setName(savedName)
    setEmail(savedEmail)
    setPhone(savedPhone)
    setPostcode(savedPostcode)
    setPropertyType(savedPropertyType)
    setEstimatedValue(savedEstimatedValue)
    setStatus(savedStatus)
    setMessageText(savedMessage)
    clearMessages()
  }

  async function saveLead() {
    beginSave()

    try {
      const response = await fetch('/api/update-valuation-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead.id,
          name,
          email,
          phone,
          postcode,
          propertyType,
          estimatedValue,
          status,
          message: messageText,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok) {
        throw new Error(result.error || 'Could not update lead.')
      }

      setSavedName(name)
      setSavedEmail(email)
      setSavedPhone(phone)
      setSavedPostcode(postcode)
      setSavedPropertyType(propertyType)
      setSavedEstimatedValue(estimatedValue)
      setSavedStatus(status)
      setSavedMessage(messageText)

      finishSave('Lead saved successfully.')
    } catch (saveError) {
      failSave(saveError, 'Could not update lead.')
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
            value={name}
            onChange={(event) => {
              beginEdit()
              setName(event.target.value)
            }}
          />

          <TextField
            label="Email"
            name="email"
            required
            type="email"
            value={email}
            onChange={(event) => {
              beginEdit()
              setEmail(event.target.value)
            }}
          />

          <TextField
            label="Phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(event) => {
              beginEdit()
              setPhone(event.target.value)
            }}
          />

          <TextField
            label="Postcode"
            name="postcode"
            required
            value={postcode}
            onChange={(event) => {
              beginEdit()
              setPostcode(event.target.value)
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
            value={propertyType}
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
              beginEdit()
              setPropertyType(event.target.value as PropertyType)
            }}
          />

          <TextField
            label="Estimated value"
            name="estimatedValue"
            min="0"
            step="1"
            type="number"
            value={estimatedValue}
            onChange={(event) => {
              beginEdit()
              setEstimatedValue(event.target.value)
            }}
          />

          <div className="md:col-span-2">
            <SelectField
              label="Status"
              name="status"
              value={status}
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
                beginEdit()
                setStatus(event.target.value as LeadStatus)
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
            value={messageText}
            onChange={(event) => {
              beginEdit()
              setMessageText(event.target.value)
            }}
          />
        </div>
      </WorkspacePanel>

      <WorkspaceStatusFooter
        error={error}
        isDirty={isDirty}
        isSaving={isSaving}
        message={message}
        onDiscard={discardChanges}
        onSave={saveLead}
        saveLabel="Save lead"
      />
    </div>
  )
}
