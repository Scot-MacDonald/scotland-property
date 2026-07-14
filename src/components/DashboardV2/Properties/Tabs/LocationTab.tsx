'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  RelationSelectField,
  TextField,
  type RelationOption,
} from '@/components/DashboardV2/Fields'
import { WorkspacePanel } from '@/components/DashboardV2/Workspace'

type LocationTabProps = {
  propertyId: string
  title: string
  region: string
  town: string
  propertyType: string
  agent: string
  latitude?: number | null
  longitude?: number | null
  regions: RelationOption[]
  towns: RelationOption[]
  propertyTypes: RelationOption[]
  agents: RelationOption[]
}

type SaveState = 'idle' | 'saving' | 'success' | 'error'

export function LocationTab({
  propertyId,
  title,
  region: initialRegion,
  town: initialTown,
  propertyType: initialPropertyType,
  agent: initialAgent,
  latitude: initialLatitude,
  longitude: initialLongitude,
  regions,
  towns,
  propertyTypes,
  agents,
}: LocationTabProps) {
  const router = useRouter()

  const initialValues = {
    region: initialRegion,
    town: initialTown,
    propertyType: initialPropertyType,
    agent: initialAgent,
    latitude: initialLatitude?.toString() || '',
    longitude: initialLongitude?.toString() || '',
  }

  const [region, setRegion] = useState(initialValues.region)
  const [town, setTown] = useState(initialValues.town)
  const [propertyType, setPropertyType] = useState(initialValues.propertyType)
  const [agent, setAgent] = useState(initialValues.agent)
  const [latitude, setLatitude] = useState(initialValues.latitude)
  const [longitude, setLongitude] = useState(initialValues.longitude)

  const [savedValues, setSavedValues] = useState(initialValues)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const hasChanges =
    region !== savedValues.region ||
    town !== savedValues.town ||
    propertyType !== savedValues.propertyType ||
    agent !== savedValues.agent ||
    latitude !== savedValues.latitude ||
    longitude !== savedValues.longitude

  function resetForm() {
    setRegion(savedValues.region)
    setTown(savedValues.town)
    setPropertyType(savedValues.propertyType)
    setAgent(savedValues.agent)
    setLatitude(savedValues.latitude)
    setLongitude(savedValues.longitude)
    setSaveState('idle')
    setErrorMessage('')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSaveState('saving')
    setErrorMessage('')

    const formData = new FormData()

    formData.set('id', propertyId)
    formData.set('title', title)
    formData.set('region', region)
    formData.set('town', town)
    formData.set('propertyType', propertyType)
    formData.set('agent', agent)
    formData.set('latitude', latitude)
    formData.set('longitude', longitude)

    try {
      const response = await fetch('/api/update-property', {
        method: 'POST',
        body: formData,
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Could not update property location.')
      }

      const nextSavedValues = {
        region,
        town,
        propertyType,
        agent,
        latitude,
        longitude,
      }

      setSavedValues(nextSavedValues)
      setSaveState('success')

      router.refresh()

      window.setTimeout(() => {
        setSaveState('idle')
      }, 2500)
    } catch (error) {
      setSaveState('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not update property location.',
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <WorkspacePanel
        title="Location and assignment"
        description="Manage where the property is located and who is responsible for the listing."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <RelationSelectField
            label="Region"
            name="region"
            value={region}
            options={regions}
            onChange={(value) => {
              setRegion(value)
              setSaveState('idle')
            }}
          />

          <RelationSelectField
            label="Town"
            name="town"
            value={town}
            options={towns}
            onChange={(value) => {
              setTown(value)
              setSaveState('idle')
            }}
          />

          <RelationSelectField
            label="Property type"
            name="propertyType"
            value={propertyType}
            options={propertyTypes}
            onChange={(value) => {
              setPropertyType(value)
              setSaveState('idle')
            }}
          />

          <RelationSelectField
            label="Assigned agent"
            name="agent"
            value={agent}
            options={agents}
            onChange={(value) => {
              setAgent(value)
              setSaveState('idle')
            }}
          />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Map coordinates"
        description="Coordinates are used to display the property on public maps."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label="Latitude"
            name="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(event) => {
              setLatitude(event.target.value)
              setSaveState('idle')
            }}
          />

          <TextField
            label="Longitude"
            name="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(event) => {
              setLongitude(event.target.value)
              setSaveState('idle')
            }}
          />
        </div>
      </WorkspacePanel>

      {saveState === 'error' && errorMessage ? (
        <div
          role="alert"
          className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {errorMessage}
        </div>
      ) : null}

      {saveState === 'success' ? (
        <div
          role="status"
          className="border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          Location saved successfully.
        </div>
      ) : null}

      {hasChanges ? (
        <div className="sticky bottom-4 z-20 flex flex-col gap-3 border border-neutral-300 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-neutral-900">
            {saveState === 'saving' ? 'Saving changes…' : 'You have unsaved changes.'}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetForm}
              disabled={saveState === 'saving'}
              className="inline-flex min-h-10 items-center justify-center border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 hover:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Discard
            </button>

            <button
              type="submit"
              disabled={saveState === 'saving'}
              className="inline-flex min-h-10 items-center justify-center bg-neutral-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveState === 'saving' ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  )
}
