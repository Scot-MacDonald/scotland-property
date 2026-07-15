'use client'

import { useCallback, useState } from 'react'

import { useWorkspaceForm } from '@/hooks/useWorkspaceForm'

type WorkspaceValues = Record<string, unknown>

type UseWorkspaceEditorOptions<TValues extends WorkspaceValues> = {
  initialValues: TValues
  successDuration?: number
}

export function useWorkspaceEditor<TValues extends WorkspaceValues>({
  initialValues,
  successDuration,
}: UseWorkspaceEditorOptions<TValues>) {
  const [savedValues, setSavedValues] = useState<TValues>(initialValues)
  const [values, setValues] = useState<TValues>(initialValues)

  const workspaceForm = useWorkspaceForm({
    successDuration,
  })

  const isDirty = JSON.stringify(values) !== JSON.stringify(savedValues)

  const setField = useCallback(
    <TKey extends keyof TValues>(key: TKey, value: TValues[TKey]) => {
      workspaceForm.clearMessages()

      setValues((current) => ({
        ...current,
        [key]: value,
      }))
    },
    [workspaceForm],
  )

  const discardChanges = useCallback(() => {
    setValues(savedValues)
    workspaceForm.clearMessages()
  }, [savedValues, workspaceForm])

  const commitValues = useCallback(
    (nextValues?: TValues) => {
      const committedValues = nextValues || values

      setValues(committedValues)
      setSavedValues(committedValues)
    },
    [values],
  )

  return {
    ...workspaceForm,
    values,
    savedValues,
    isDirty,
    setField,
    setValues,
    discardChanges,
    commitValues,
  }
}
