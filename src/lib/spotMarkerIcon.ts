import L from 'leaflet'
import type { Theme } from './theme'

const MARKER_WIDTH = 36
const MARKER_HEIGHT = 44

function accentColor(theme: Theme, selected: boolean): string {
  if (selected) return theme === 'dark' ? '#74c69d' : '#1b4332'
  return theme === 'dark' ? '#52b788' : '#2d6a4f'
}

function markerHtml(theme: Theme, selected: boolean): string {
  const accent = accentColor(theme, selected)
  const scale = selected ? 1.12 : 1
  const border = selected ? 3 : 2

  return `
    <div class="spot-marker-pin" style="transform:scale(${scale})">
      <div class="spot-marker-circle" style="border:${border}px solid ${accent}">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" d="M5 7h14M7 7v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7M8 10v7M16 10v7"/>
        </svg>
      </div>
      <div class="spot-marker-tail" style="border-top-color:${accent}"></div>
    </div>
  `
}

export function createSpotIcon(theme: Theme, selected = false): L.DivIcon {
  return L.divIcon({
    className: 'spot-marker-icon',
    html: markerHtml(theme, selected),
    iconSize: [MARKER_WIDTH, MARKER_HEIGHT],
    iconAnchor: [MARKER_WIDTH / 2, MARKER_HEIGHT],
  })
}
