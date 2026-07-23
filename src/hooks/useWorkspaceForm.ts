'use client'

import { useCallback, useRef, useState } from 'react'

type UseWorkspaceFormOptions = {
  successDuration?: number
}

export function useWorkspaceForm({ successDuration = 3000 }: UseWorkspaceFormOptions = {}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const clearSuccessTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const clearMessages = useCallback(() => {
    clearSuccessTimeout()
    setMessage('')
    setError('')
  }, [clearSuccessTimeout])

  const beginSave = useCallback(() => {
    clearMessages()
    setIsSaving(true)
  }, [clearMessages])

  const finishSave = useCallback(
    (successMessage: string) => {
      clearSuccessTimeout()

      setIsSaving(false)
      setError('')
      setMessage(successMessage)

      timeoutRef.current = setTimeout(() => {
        setMessage('')
        timeoutRef.current = null
      }, successDuration)
    },
    [clearSuccessTimeout, successDuration],
  )

  const failSave = useCallback(
    (saveError: unknown, fallbackMessage: string) => {
      clearSuccessTimeout()

      setIsSaving(false)
      setMessage('')
      setError(saveError instanceof Error ? saveError.message : fallbackMessage)
    },
    [clearSuccessTimeout],
  )

  const endSave = useCallback(() => {
    setIsSaving(false)
  }, [])

  return {
    isSaving,
    message,
    error,
    beginSave,
    finishSave,
    failSave,
    endSave,
    clearMessages,
  }
}
