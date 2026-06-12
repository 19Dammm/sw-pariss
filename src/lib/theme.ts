export type Theme = 'light' | 'dark'

const THEME_KEY = 'sw-paris:theme:v1'

export function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
  } catch {
    // ignore
  }

  return 'light' // ← toujours clair par défaut
}

export function saveTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme)
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}
