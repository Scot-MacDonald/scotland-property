'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

interface Props {
  external?: boolean
  newTab?: boolean
  scroll?: boolean
}

function useClickableCard<T extends HTMLElement>({
  external = false,
  newTab = false,
  scroll = true,
}: Props) {
  const router = useRouter()

  const cardRef = useRef<T>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const timeDownRef = useRef(0)
  const hasActiveParentRef = useRef(false)
  const pressedButtonRef = useRef(0)

  const handleMouseDown = useCallback((event: MouseEvent) => {
    const target = event.target

    if (!(target instanceof Element)) return

    pressedButtonRef.current = event.button

    const parentLink = target.closest('a')

    if (parentLink) {
      hasActiveParentRef.current = true
      return
    }

    hasActiveParentRef.current = false
    timeDownRef.current = Date.now()
  }, [])

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      const href = linkRef.current?.href

      if (!href) return

      const elapsedTime = Date.now() - timeDownRef.current
      const isPrimaryClick = pressedButtonRef.current === 0
      const isModifiedClick = event.ctrlKey || event.metaKey || event.shiftKey || event.altKey

      if (hasActiveParentRef.current || elapsedTime > 250 || !isPrimaryClick || isModifiedClick) {
        return
      }

      if (external) {
        window.open(href, newTab ? '_blank' : '_self')
        return
      }

      router.push(href, { scroll })
    },
    [external, newTab, router, scroll],
  )

  useEffect(() => {
    const cardNode = cardRef.current

    if (!cardNode) return

    const abortController = new AbortController()

    cardNode.addEventListener('mousedown', handleMouseDown, {
      signal: abortController.signal,
    })

    cardNode.addEventListener('mouseup', handleMouseUp, {
      signal: abortController.signal,
    })

    return () => {
      abortController.abort()
    }
  }, [handleMouseDown, handleMouseUp])

  return {
    cardRef,
    linkRef,
  }
}

export default useClickableCard
