import { useEffect, useState } from 'react'

type Position = {
  lat: number
  lng: number
}

type GeoState = {
  position: Position | null
  loading: boolean
  denied: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    position: null,
    loading: true,
    denied: false,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ position: null, loading: false, denied: true })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (coords) => {
        setState({
          position: {
            lat: coords.coords.latitude,
            lng: coords.coords.longitude,
          },
          loading: false,
          denied: false,
        })
      },
      () => {
        setState({ position: null, loading: false, denied: true })
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }, [])

  return state
}

