import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  getStoredAutoExplain,
  getStoredMode,
  getStoredTheme,
  setStoredAutoExplain,
  setStoredMode,
  setStoredTheme,
} from './storage'

const AppContext = createContext(null)

function prefersDark() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

export function AppProvider({ children }) {
  // theme: 'light' | 'dark' | null (follow system)
  const [theme, setTheme] = useState(() => getStoredTheme())
  const [mode, setMode] = useState(() => getStoredMode())
  // Whether the explanation + tip reveals automatically after an answer.
  const [autoExplain, setAutoExplain] = useState(() => getStoredAutoExplain())
  // Transient quiz session — intentionally not persisted across reloads.
  const [quiz, setQuiz] = useState(null)

  const isDark = theme ? theme === 'dark' : prefersDark()

  useEffect(() => {
    const root = document.documentElement
    if (theme) root.setAttribute('data-theme', theme)
    else root.removeAttribute('data-theme')
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((cur) => {
      const dark = cur ? cur === 'dark' : prefersDark()
      const next = dark ? 'light' : 'dark'
      setStoredTheme(next)
      return next
    })
  }, [])

  const changeMode = useCallback((m) => {
    setMode(m)
    setStoredMode(m)
  }, [])

  const toggleAutoExplain = useCallback(() => {
    setAutoExplain((v) => {
      const next = !v
      setStoredAutoExplain(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      theme,
      isDark,
      toggleTheme,
      mode,
      setMode: changeMode,
      autoExplain,
      toggleAutoExplain,
      quiz,
      setQuiz,
    }),
    [theme, isDark, toggleTheme, mode, changeMode, autoExplain, toggleAutoExplain, quiz]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
