import type { Position } from '@/types/Position'
import L, { Map, Marker, type LatLngExpression } from 'leaflet'

export const initializeMap = (center: LatLngExpression, zoom: number): Map => {
  const map: Map = L.map('map', { attributionControl: false }).setView(center, zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  return map
}

export const getDriversPosition = (map: Map, positions: Position[]): Marker[] => {
  const markers: Marker[] = positions.map((position) => {
    return L.marker([position.lat, position.lng]).addTo(map).bindPopup(position.title).openPopup()
  })

  return markers
}

export const updateDriversPosition = (
  map: Map,
  markers: Marker[],
  positions: Position[]
): Marker[] => {
  positions.forEach((position, index) => {
    if (markers[index]) {
      markers[index].setLatLng([position.lat, position.lng]).getPopup()?.setContent(position.title)
    } else {
      const marker = L.marker([position.lat, position.lng])
        .addTo(map)
        .bindPopup(position.title)
        .openPopup()
      markers.push(marker)
    }
  })

  while (markers.length > positions.length) {
    const marker = markers.pop()
    if (marker) {
      map.removeLayer(marker)
    }
  }

  return markers
}
