import type { Position } from '@/types/Position'
import L, { Map, Marker, type LatLngExpression } from 'leaflet'
import mapPlaceholder from '@/assets/images/placeholder.png'
import { driverStatus } from './common'

const icon = L.icon({
  iconUrl: mapPlaceholder,
  iconSize: [38, 42],
  iconAnchor: [19, 42],
  popupAnchor: [0, -40]
})

export const initializeMap = (center: LatLngExpression, zoom: number): Map => {
  const map: Map = L.map('map', { attributionControl: false }).setView(center, zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  return map
}

export const getDriversPosition = (map: Map, positions: Position[]): Marker[] => {
  const markers: Marker[] = positions.map((position) => {
    return L.marker([Number(position.lat), Number(position.lng)], { icon: icon })
      .addTo(map)
      .bindPopup(`${position.title}<br>${driverStatus(position.status)}`)
      .openPopup()
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
      markers[index]
        .setLatLng([Number(position.lat), Number(position.lng)])
        .getPopup()
        ?.setContent(position.title)
    } else {
      const marker = L.marker([Number(position.lat), Number(position.lng)], { icon: icon })
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
