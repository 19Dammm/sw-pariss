import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const raw = readFileSync(resolve(root, 'osm-spots.json'), 'utf8').replace(/^\uFEFF/, '')
const data = JSON.parse(raw)

const STREET_EQUIPMENT = new Set([
  'parallel_bars',
  'pull_up',
  'rings',
  'monkey_bars',
  'horizontal_bar',
  'horizontal_ladder',
  'wall_bars',
  'balance_beam',
  'climbing_wall',
  'hyperextension',
])

function dist(a, b) {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

function getPoint(el) {
  if (el.lat != null && el.lon != null) return { lat: el.lat, lon: el.lon }
  if (el.center) return { lat: el.center.lat, lon: el.center.lon }
  return null
}

function arrondissementFromLatLng(lat, lng) {
  // Approximate Paris arrondissement lookup via postal code zones - simplified bounding boxes
  const zones = [
    [48.853, 48.858, 2.339, 2.352, '1er'],
    [48.865, 48.872, 2.335, 2.355, '2e'],
    [48.862, 48.869, 2.352, 2.372, '3e'],
    [48.848, 48.858, 2.352, 2.372, '4e'],
    [48.842, 48.852, 2.339, 2.355, '5e'],
    [48.838, 48.855, 2.318, 2.342, '6e'],
    [48.848, 48.862, 2.305, 2.330, '7e'],
    [48.868, 48.878, 2.295, 2.325, '8e'],
    [48.868, 48.878, 2.325, 2.345, '9e'],
    [48.868, 48.878, 2.345, 2.375, '10e'],
    [48.848, 48.868, 2.365, 2.395, '11e'],
    [48.828, 48.848, 2.365, 2.405, '12e'],
    [48.818, 48.838, 2.335, 2.375, '13e'],
    [48.828, 48.848, 2.275, 2.325, '14e'],
    [48.828, 48.852, 2.275, 2.315, '15e'],
    [48.848, 48.868, 2.245, 2.285, '16e'],
    [48.868, 48.898, 2.275, 2.325, '17e'],
    [48.878, 48.898, 2.325, 2.365, '18e'],
    [48.878, 48.902, 2.365, 2.410, '19e'],
    [48.848, 48.878, 2.385, 2.420, '20e'],
  ]
  for (const [minLat, maxLat, minLng, maxLng, arr] of zones) {
    if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) return arr
  }
  return 'Paris'
}

function isStreetWorkoutRelevant(tags) {
  if (!tags) return false
  if (tags.sport === 'calisthenics') return true
  if (tags.fitness_station && STREET_EQUIPMENT.has(tags.fitness_station)) return true
  if (tags.name && /street workout|calisthenics|traction|dips|agrès|barre|workout/i.test(tags.name))
    return true
  if (tags.description && /street workout|calisthenics|traction|dips/i.test(tags.description)) return true
  return false
}

function equipmentFromTags(items) {
  const eq = new Set()
  for (const item of items) {
    const t = item.tags
    if (t.fitness_station) {
      const map = {
        parallel_bars: 'Barres parallèles',
        pull_up: 'Barres de traction',
        rings: 'Anneaux',
        monkey_bars: 'Barres à sauter',
        horizontal_bar: 'Barre horizontale',
        horizontal_ladder: 'Échelle horizontale',
        wall_bars: 'Espalier',
        balance_beam: 'Poutre d équilibre',
        climbing_wall: 'Mur d escalade',
        hyperextension: 'Hyperextension',
      }
      eq.add(map[t.fitness_station] ?? t.fitness_station)
    }
    if (t.name && /traction|dips|anneaux|parallèle|barre|espalier|corde/i.test(t.name)) eq.add(t.name)
  }
  if (eq.size === 0) eq.add('Barres de traction', 'Barres parallèles')
  return [...eq]
}

const points = []
for (const el of data.elements) {
  const p = getPoint(el)
  if (!p) continue
  const tags = el.tags ?? {}
  if (el.type === 'way' && tags.leisure === 'fitness_station') {
    points.push({ ...p, tags, id: el.id, type: el.type })
    continue
  }
  if (el.type === 'node' && isStreetWorkoutRelevant(tags)) {
    points.push({ ...p, tags, id: el.id, type: el.type })
  }
}

const clusters = []
for (const p of points) {
  let cluster = clusters.find((c) => dist(c, p) < 100)
  if (!cluster) {
    cluster = { lat: p.lat, lon: p.lon, count: 0, items: [], names: new Set() }
    clusters.push(cluster)
  }
  cluster.lat = (cluster.lat * cluster.count + p.lat) / (cluster.count + 1)
  cluster.lon = (cluster.lon * cluster.count + p.lon) / (cluster.count + 1)
  cluster.count += 1
  cluster.items.push(p)
  if (p.tags.name) cluster.names.add(p.tags.name)
}

clusters.sort((a, b) => b.count - a.count)
console.log(JSON.stringify(clusters.map((c) => ({
  lat: +c.lat.toFixed(5),
  lng: +c.lon.toFixed(5),
  count: c.count,
  names: [...c.names],
  arr: arrondissementFromLatLng(c.lat, c.lon),
})), null, 2))
