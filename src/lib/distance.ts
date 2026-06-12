const EARTH_RADIUS_METERS = 6371000

function toRad(value: number) {
  return (value * Math.PI) / 180
}

export function getDistanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const latDelta = toRad(b.lat - a.lat)
  const lngDelta = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const haversine =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2)

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

