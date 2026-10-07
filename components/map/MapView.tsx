// Mappa risultati stile Doctolib — Leaflet, solo client (next/dynamic, no SSR).
'use client';

import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  label: string;
  sublabel?: string;
  href?: string;
}

interface MapViewProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: number | string;
  highlightedId?: string | null;
  /** Cambia valore per forzare map.invalidateSize() — utile quando il container
   *  passa da display:none a visibile (mobile overlay). */
  forceResize?: boolean;
}

const MapViewInner = dynamic(
  async () => {
    const L = (await import('leaflet')).default;
    const { MapContainer, TileLayer, Marker, Popup, useMap } = await import('react-leaflet');
    const { useEffect } = await import('react');

    function makePin(highlighted: boolean) {
      const bg = highlighted ? '#FF6600' : '#152238';
      const size = highlighted ? 38 : 32;
      return L.divIcon({
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
        html: `<div style="width:${size}px;height:${size}px;position:relative;">
          <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${bg}" stroke="white" stroke-width="1">
            <path d="M12 0C7 0 3 4 3 9c0 6.5 9 15 9 15s9-8.5 9-15c0-5-4-9-9-9z"/>
            <circle cx="12" cy="9" r="3.4" fill="white"/>
          </svg>
        </div>`,
      });
    }

    /** Chiama invalidateSize() quando il container diventa visibile (es. overlay mobile) */
    function ResizeWatcher({ trigger }: { trigger?: boolean }) {
      const map = useMap();
      useEffect(() => {
        const id = setTimeout(() => map.invalidateSize(), 150);
        return () => clearTimeout(id);
      }, [map, trigger]);
      return null;
    }

    /** Adatta i bounds quando cambiano i marker */
    function FitBounds({ markers }: { markers: MapMarker[] }) {
      const map = useMap();
      useEffect(() => {
        if (markers.length === 0) return;
        if (markers.length === 1) {
          map.setView([markers[0].lat, markers[0].lon], 14);
          return;
        }
        const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lon] as [number, number]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }, [map, markers]);
      return null;
    }

    function MapViewLeaflet({
      markers = [],
      center = [45.4654, 9.1866],
      zoom = 12,
      height = '100%',
      highlightedId = null,
      forceResize,
    }: MapViewProps) {
      return (
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height, width: '100%' }}
          scrollWheelZoom={true}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ResizeWatcher trigger={forceResize} />
          <FitBounds markers={markers} />
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lon]}
              icon={makePin(marker.id === highlightedId)}
              zIndexOffset={marker.id === highlightedId ? 1000 : 0}
            >
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 160 }}>
                  <strong style={{ display: 'block', marginBottom: 2 }}>{marker.label}</strong>
                  {marker.sublabel && (
                    <span style={{ color: '#6B7280', fontSize: 12, display: 'block', marginBottom: 6 }}>
                      {marker.sublabel}
                    </span>
                  )}
                  {marker.href && (
                    <a
                      href={marker.href}
                      style={{ color: '#1A3557', fontWeight: 600, fontSize: 13 }}
                    >
                      Vedi profilo →
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      );
    }

    return MapViewLeaflet;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[300px] w-full items-center justify-center bg-gray-100 text-sm text-ink-mute">
        Caricamento mappa…
      </div>
    ),
  }
);

export default function MapView(props: MapViewProps) {
  return <MapViewInner {...props} />;
}
