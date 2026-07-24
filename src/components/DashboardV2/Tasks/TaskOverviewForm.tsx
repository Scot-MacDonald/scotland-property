'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { TextField } from '@/components/DashboardV2/Fields'
import { WorkspaceForm, WorkspacePanel } from '@/components/DashboardV2/Workspace'

type TaskStatus = 'todo' | 'in-progress' | 'waiting' | 'completed' | 'cancelled'
type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'

type AgentOption = {
  id: string
  name: string
}

type TaskOverviewValues = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueAt: string
  reminderAt: string
  assignedAgent: string
}

type TaskOverviewFormProps = {
  task: {
    id: string
    title: string
    description?: string | null
    status?: TaskStatus | null
    priority?: TaskPriority | null
    dueAt?: string | null
    reminderAt?: string | null
    assignedAgentId?: string | null
  }
  agents: AgentOption[]
}

type SaveState = 'idle' | 'saving' | 'success' | 'error'

const statusOptions: Array<{
  value: TaskStatus
  label: string
}> = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const priorityOptions: Array<{
  value: TaskPriority
  label: string
}> = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

function formatDateTimeInput(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60_000)

  return localDate.toISOString().slice(0, 16)
}

function toISOString(value: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString()
}

function getInitialValues(task: TaskOverviewFormProps['task']): TaskOverviewValues {
  return {
    title: task.title,
    description: task.description || '',
    status: task.status || 'todo',
    priority: task.priority || 'normal',
    dueAt: formatDateTimeInput(task.dueAt),
    reminderAt: formatDateTimeInput(task.reminderAt),
    assignedAgent: task.assignedAgentId || '',
  }
}

function valuesAreEqual(first: TaskOverviewValues, second: TaskOverviewValues) {
  return (
    first.title === second.title &&
    first.description === second.description &&
    first.status === second.status &&
    first.priority === second.priority &&
    first.dueAt === second.dueAt &&
    first.reminderAt === second.reminderAt &&
    first.assignedAgent === second.assignedAgent
  )
}

export function TaskOverviewForm({ task, agents }: TaskOverviewFormProps) {
  const router = useRouter()

  const initialValues = getInitialValues(task)

  const [values, setValues] = useState<TaskOverviewValues>(initialValues)
  const [savedValues, setSavedValues] = useState<TaskOverviewValues>(initialValues)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const hasChanges = !valuesAreEqual(values, savedValues)

  function updateValue<Key extends keyof TaskOverviewValues>(
    key: Key,
    value: TaskOverviewValues[Key],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }))

    setSaveState('idle')
    setErrorMessage('')
  }

  function resetForm() {
    setValues(savedValues)
    setSaveState('idle')
    setErrorMessage('')
  }

  async function handleSave() {
    const trimmedTitle = values.title.trim()

    if (!trimmedTitle) {
      setSaveState('error')
      setErrorMessage('Task title is required.')
      return
    }

    if (
      values.dueAt &&
      values.reminderAt &&
      new Date(values.reminderAt).getTime() > new Date(values.dueAt).getTime()
    ) {
      setSaveState('error')
      setErrorMessage('The reminder must be scheduled before the task due date.')
      return
    }

    setSaveState('saving')
    setErrorMessage('')

    const valuesToSave: TaskOverviewValues = {
      ...values,
      title: trimmedTitle,
      description: values.description.trim(),
    }

    const formData = new FormData()

    formData.set('id', task.id)
    formData.set('title', valuesToSave.title)
    formData.set('description', valuesToSave.description)
    formData.set('status', valuesToSave.status)
    formData.set('priority', valuesToSave.priority)
    formData.set('dueAt', toISOString(valuesToSave.dueAt))
    formData.set('reminderAt', toISOString(valuesToSave.reminderAt))
    formData.set('assignedAgent', valuesToSave.assignedAgent)

    try {
      const response = await fetch('/api/update-task', {
        method: 'POST',
        body: formData,
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Could not update task.')
      }

      setValues(valuesToSave)
      setSavedValues(valuesToSave)
      setSaveState('success')

      router.refresh()

      window.setTimeout(() => {
        setSaveState('idle')
      }, 2500)
    } catch (error) {
      setSaveState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Could not update task.')
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
        title="Task overview"
        description="Core task information, status and priority."
      >
        <div className="grid gap-6">
          <TextField
            label="Title"
            name="title"
            value={values.title}
            onChange={(event) => {
              updateValue('title', event.target.value)
            }}
            error={
              saveState === 'error' && !values.title.trim() ? 'Task title is required.' : undefined
            }
            required
          />

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-900">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={6}
              value={values.description}
              onChange={(event) => {
                updateValue('description', event.target.value)
              }}
              className="mt-2 w-full resize-y border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-neutral-900">
                Status
              </label>

              <select
                id="status"
                name="status"
                value={values.status}
                onChange={(event) => {
                  updateValue('status', event.target.value as TaskStatus)
                }}
                className="mt-2 h-11 w-full border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-neutral-900">
                Priority
              </label>

              <select
                id="priority"
                name="priority"
                value={values.priority}
                onChange={(event) => {
                  updateValue('priority', event.target.value as TaskPriority)
                }}
                className="mt-2 h-11 w-full border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Scheduling"
        description="Set the task deadline and an optional reminder."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label="Due date"
            name="dueAt"
            type="datetime-local"
            value={values.dueAt}
            onChange={(event) => {
              updateValue('dueAt', event.target.value)
            }}
          />

          <TextField
            label="Reminder"
            name="reminderAt"
            type="datetime-local"
            value={values.reminderAt}
            onChange={(event) => {
              updateValue('reminderAt', event.target.value)
            }}
            description="The reminder should occur before the due date."
          />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Assignment"
        description="Choose the agent responsible for completing this task."
      >
        <div>
          <label htmlFor="assignedAgent" className="block text-sm font-medium text-neutral-900">
            Assigned agent
          </label>

          <select
            id="assignedAgent"
            name="assignedAgent"
            value={values.assignedAgent}
            onChange={(event) => {
              updateValue('assignedAgent', event.target.value)
            }}
            className="mt-2 h-11 w-full border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition focus:border-neutral-950"
          >
            <option value="">Unassigned</option>

            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
      </WorkspacePanel>
    </WorkspaceForm>
  )
}
