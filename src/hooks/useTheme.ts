import { useEffect, useState } from 'react'
import { applyTheme, loadTheme, saveTheme, type Theme } from '../lib/theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => loadTheme())

  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((current) => {
      if (current === 'light') return 'dark'
    if (current === 'dark') return 'satellite'
    return 'light' 
    } 
  )}

  return { theme, setTheme, toggleTheme }
}
