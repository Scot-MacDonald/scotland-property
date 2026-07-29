'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import { TextField } from '@/components/DashboardV2/Fields'
import {
  WorkspaceForm,
  WorkspacePanel,
  WorkspaceUploadField,
} from '@/components/DashboardV2/Workspace'

type AgentOverviewFormProps = {
  agent: {
    id: string
    name: string
    jobTitle?: string | null
    email?: string | null
    phone?: string | null
    photo?:
      | string
      | {
          id: string
          filename?: string | null
          url?: string | null
        }
      | null
  }
}

type AgentOverviewValues = {
  name: string
  jobTitle: string
  email: string
  phone: string
  photoId: string
  photoFilename: string
  photoUrl: string
}

type SaveState = 'idle' | 'saving' | 'success' | 'error'

function getPhoto(agent: AgentOverviewFormProps['agent']) {
  if (!agent.photo || typeof agent.photo === 'string') {
    return {
      id: typeof agent.photo === 'string' ? agent.photo : '',
      filename: '',
      url: '',
    }
  }

  return {
    id: agent.photo.id,
    filename: agent.photo.filename || '',
    url: agent.photo.url || '',
  }
}

function getInitialValues(agent: AgentOverviewFormProps['agent']): AgentOverviewValues {
  const photo = getPhoto(agent)

  return {
    name: agent.name,
    jobTitle: agent.jobTitle || '',
    email: agent.email || '',
    phone: agent.phone || '',
    photoId: photo.id,
    photoFilename: photo.filename,
    photoUrl: photo.url,
  }
}

export function AgentOverviewForm({ agent }: AgentOverviewFormProps) {
  const router = useRouter()
  const photoInputRef = useRef<HTMLInputElement>(null)

  const initialValues = getInitialValues(agent)

  const [name, setName] = useState(initialValues.name)
  const [jobTitle, setJobTitle] = useState(initialValues.jobTitle)
  const [email, setEmail] = useState(initialValues.email)
  const [phone, setPhone] = useState(initialValues.phone)

  const [photoId, setPhotoId] = useState(initialValues.photoId)
  const [photoFilename, setPhotoFilename] = useState(initialValues.photoFilename)
  const [photoUrl, setPhotoUrl] = useState(initialValues.photoUrl)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const [savedValues, setSavedValues] = useState<AgentOverviewValues>(initialValues)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const currentValues: AgentOverviewValues = {
    name,
    jobTitle,
    email,
    phone,
    photoId,
    photoFilename,
    photoUrl,
  }

  const hasChanges =
    currentValues.name !== savedValues.name ||
    currentValues.jobTitle !== savedValues.jobTitle ||
    currentValues.email !== savedValues.email ||
    currentValues.phone !== savedValues.phone ||
    currentValues.photoId !== savedValues.photoId ||
    photoFile !== null

  function clearSaveFeedback() {
    setSaveState('idle')
    setErrorMessage('')
  }

  function resetForm() {
    setName(savedValues.name)
    setJobTitle(savedValues.jobTitle)
    setEmail(savedValues.email)
    setPhone(savedValues.phone)
    setPhotoId(savedValues.photoId)
    setPhotoFilename(savedValues.photoFilename)
    setPhotoUrl(savedValues.photoUrl)
    setPhotoFile(null)

    clearSaveFeedback()
  }

  function handlePhotoChange(file: File | null) {
    setPhotoFile(file)

    if (file) {
      setPhotoId('')
      setPhotoFilename(file.name)
    }

    clearSaveFeedback()
  }

  function handlePhotoRemove() {
    setPhotoFile(null)
    setPhotoId('')
    setPhotoFilename('')
    setPhotoUrl('')

    clearSaveFeedback()
  }

  async function handleSave() {
    if (!name.trim()) {
      setSaveState('error')
      setErrorMessage('Agent name is required.')
      return
    }

    setSaveState('saving')
    setErrorMessage('')

    const valuesToSave: AgentOverviewValues = {
      name: name.trim(),
      jobTitle: jobTitle.trim(),
      email: email.trim(),
      phone: phone.trim(),
      photoId,
      photoFilename,
      photoUrl,
    }

    const formData = new FormData()

    formData.set('id', agent.id)
    formData.set('name', valuesToSave.name)
    formData.set('jobTitle', valuesToSave.jobTitle)
    formData.set('email', valuesToSave.email)
    formData.set('phone', valuesToSave.phone)

    formData.set('photoManaged', 'true')
    formData.set('photoId', photoId)

    if (photoFile) {
      formData.set('photo', photoFile)
    }

    try {
      const response = await fetch('/api/update-agent', {
        method: 'POST',
        body: formData,
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
        agent?: {
          name?: string
          jobTitle?: string | null
          email?: string | null
          phone?: string | null
          photo?:
            | string
            | {
                id: string
                filename?: string | null
                url?: string | null
              }
            | null
        }
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Could not update agent.')
      }

      const updatedPhoto = result.agent?.photo

      const nextPhoto =
        updatedPhoto && typeof updatedPhoto === 'object'
          ? {
              id: updatedPhoto.id,
              filename: updatedPhoto.filename || '',
              url: updatedPhoto.url || '',
            }
          : {
              id: typeof updatedPhoto === 'string' ? updatedPhoto : '',
              filename: '',
              url: '',
            }

      const nextSavedValues: AgentOverviewValues = {
        name: result.agent?.name || valuesToSave.name,
        jobTitle: result.agent?.jobTitle || '',
        email: result.agent?.email || '',
        phone: result.agent?.phone || '',
        photoId: nextPhoto.id,
        photoFilename: nextPhoto.filename,
        photoUrl: nextPhoto.url,
      }

      setName(nextSavedValues.name)
      setJobTitle(nextSavedValues.jobTitle)
      setEmail(nextSavedValues.email)
      setPhone(nextSavedValues.phone)
      setPhotoId(nextSavedValues.photoId)
      setPhotoFilename(nextSavedValues.photoFilename)
      setPhotoUrl(nextSavedValues.photoUrl)
      setPhotoFile(null)

      setSavedValues(nextSavedValues)
      setSaveState('success')

      router.refresh()

      window.setTimeout(() => {
        setSaveState('idle')
      }, 2500)
    } catch (error) {
      setSaveState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Could not update agent.')
    }
  }

  return (
    <WorkspaceForm
      hasChanges={hasChanges}
      saving={saveState === 'saving'}
      saved={saveState === 'success'}
      error={saveState === 'error' ? errorMessage : null}
      onSave={handleSave}
      onDiscard={resetForm}
      className="space-y-6"
    >
      <WorkspacePanel
        title="Agent profile"
        description="The primary profile information displayed across the agency dashboard and public website."
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <WorkspaceUploadField
            accept="image/*"
            description="Upload a clear professional portrait. Square or portrait images work best."
            file={photoFile}
            filename={photoFilename}
            inputRef={photoInputRef}
            label="Agent photo"
            previewType="image"
            previewUrl={photoUrl}
            onChoose={() => photoInputRef.current?.click()}
            onDrop={(files) => handlePhotoChange(files[0] || null)}
            onFileChange={handlePhotoChange}
            onRemove={handlePhotoRemove}
          />

          <div className="grid content-start gap-6">
            <TextField
              label="Name"
              name="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                clearSaveFeedback()
              }}
              error={saveState === 'error' && !name.trim() ? 'Agent name is required.' : undefined}
              required
            />

            <TextField
              label="Job title"
              name="jobTitle"
              value={jobTitle}
              onChange={(event) => {
                setJobTitle(event.target.value)
                clearSaveFeedback()
              }}
              placeholder="Senior Property Consultant"
            />
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Contact details"
        description="The contact information used for enquiries and agent profile pages."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              clearSaveFeedback()
            }}
          />

          <TextField
            label="Phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value)
              clearSaveFeedback()
            }}
          />
        </div>
      </WorkspacePanel>
    </WorkspaceForm>
  )
}
