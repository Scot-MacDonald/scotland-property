'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { EditableList, type EditableListItem } from '@/components/DashboardV2/Shared'
import { WorkspaceForm, WorkspacePanel } from '@/components/DashboardV2/Workspace'

type TaskChecklistItem = {
  id?: string | null
  label: string
  completed?: boolean | null
}

type TaskChecklistFormProps = {
  taskId: string
  checklist: TaskChecklistItem[]
}

type SaveState = 'idle' | 'saving' | 'success' | 'error'

function createClientId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `checklist-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getInitialItems(checklist: TaskChecklistItem[]): EditableListItem[] {
  return checklist.map((item) => ({
    id: item.id || createClientId(),
    label: item.label,
    complete: Boolean(item.completed),
  }))
}

function normaliseItems(items: EditableListItem[]) {
  return items
    .map((item) => ({
      ...item,
      label: item.label.trim(),
    }))
    .filter((item) => item.label.length > 0)
}

function itemsAreEqual(firstItems: EditableListItem[], secondItems: EditableListItem[]) {
  if (firstItems.length !== secondItems.length) {
    return false
  }

  return firstItems.every((item, index) => {
    const comparisonItem = secondItems[index]

    return (
      item.id === comparisonItem.id &&
      item.label === comparisonItem.label &&
      Boolean(item.complete) === Boolean(comparisonItem.complete)
    )
  })
}

export function TaskChecklistForm({ taskId, checklist }: TaskChecklistFormProps) {
  const router = useRouter()

  const initialItems = getInitialItems(checklist)

  const [items, setItems] = useState<EditableListItem[]>(initialItems)
  const [savedItems, setSavedItems] = useState<EditableListItem[]>(initialItems)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const hasChanges = !itemsAreEqual(items, savedItems)

  function handleItemsChange(nextItems: EditableListItem[]) {
    setItems(nextItems)
    setSaveState('idle')
    setErrorMessage('')
  }

  function handleDiscard() {
    setItems(savedItems)
    setSaveState('idle')
    setErrorMessage('')
  }

  async function handleSave() {
    setSaveState('saving')
    setErrorMessage('')

    const itemsToSave = normaliseItems(items)

    try {
      const response = await fetch('/api/update-task-checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          checklist: itemsToSave.map((item) => ({
            id: item.id,
            label: item.label,
            completed: Boolean(item.complete),
          })),
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
        checklist?: TaskChecklistItem[]
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Could not update the checklist.')
      }

      const savedChecklist = result.checklist ? getInitialItems(result.checklist) : itemsToSave

      setItems(savedChecklist)
      setSavedItems(savedChecklist)
      setSaveState('success')

      router.refresh()

      window.setTimeout(() => {
        setSaveState('idle')
      }, 2500)
    } catch (error) {
      setSaveState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Could not update the checklist.')
    }
  }

  return (
    <WorkspaceForm
      hasChanges={hasChanges}
      saving={saveState === 'saving'}
      saved={saveState === 'success'}
      error={saveState === 'error' ? errorMessage : null}
      onSave={handleSave}
      onDiscard={handleDiscard}
    >
      <WorkspacePanel
        title="Checklist"
        description="Track the individual actions required to complete this task."
      >
        <EditableList
          items={items}
          onChange={handleItemsChange}
          allowCompletion
          allowDelete
          allowAdd
          placeholder="Checklist item"
          emptyLabel="No checklist items have been added."
          addLabel="Add checklist item"
          disabled={saveState === 'saving'}
        />
      </WorkspacePanel>
    </WorkspaceForm>
  )
}
