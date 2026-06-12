const FAVORITES_KEY = 'sw-paris:favorites:v1'

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) {
      return new Set<string>()
    }

    const values = JSON.parse(raw)
    if (!Array.isArray(values)) {
      return new Set<string>()
    }

    return new Set<string>(values)
  } catch {
    return new Set<string>()
  }
}

export function saveFavorites(favorites: Set<string>) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]))
}

