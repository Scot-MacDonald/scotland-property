'use client'

import React, { createContext, use, useCallback, useState } from 'react'

import type { Theme, ThemeContextType } from './types'

import canUseDOM from '@/utilities/canUseDOM'
import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from './shared'
import { themeIsValid } from './types'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

function getInitialTheme(): Theme | undefined {
  if (!canUseDOM) return undefined

  const stored = window.localStorage.getItem(themeLocalStorageKey)

  if (themeIsValid(stored)) {
    document.documentElement.setAttribute('data-theme', stored)
    return stored
  }

  const implicitPreference = getImplicitPreference()

  if (implicitPreference) {
    document.documentElement.setAttribute('data-theme', implicitPreference)
    return implicitPreference
  }

  document.documentElement.setAttribute('data-theme', defaultTheme)
  return defaultTheme
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(getInitialTheme)

  const setTheme = useCallback((themeToSet: Theme | null) => {
    if (themeToSet === null) {
      window.localStorage.removeItem(themeLocalStorageKey)

      const implicitPreference = getImplicitPreference()

      document.documentElement.setAttribute('data-theme', implicitPreference || '')
      setThemeState(implicitPreference ?? undefined)

      return
    }

    window.localStorage.setItem(themeLocalStorageKey, themeToSet)
    document.documentElement.setAttribute('data-theme', themeToSet)
    setThemeState(themeToSet)
  }, [])

  return <ThemeContext value={{ setTheme, theme }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
