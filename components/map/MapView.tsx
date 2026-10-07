// Mappa crema con pin a goccia — Leaflet, solo client (next/dynamic, no SSR).
'use client';

import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  label: string;
}

interface MapViewProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: number | string;
  highlightedId?: string | null;
  /** Tap su un pin */
  onSelect?: (id: string) => void;
  /** Cambia valore per forzare map.invalidateSize() — utile quando il container
   *  passa da display:none a visibile (mobile overlay). */
  forceResize?: boolean;
}

const MapViewInner = dynamic(
  async () => {
    const L = (await import('leaflet')).default;
    const { MapContainer, TileLayer, Marker, useMap } = await import('react-leaflet');
    const { useEffect } = await import('react');

    // Goccia = quadrato con un angolo vivo, ruotato di -45° → la punta guarda in basso.
    function makePin(highlighted: boolean) {
      const size = highlighted ? 40 : 30;
      const border = highlighted ? 3 : 2.5;
      const dot = highlighted ? 12 : 8;
      const tipY = size / 2 + size / Math.SQRT2; // punta = centro + semidiagonale
      return L.divIcon({
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, tipY],
        html: `<div style="position:relative;width:${size}px;height:${size}px">${
          highlighted
            ? `<div style="position:absolute;left:50%;top:${tipY - 5}px;width:26px;height:10px;margin-left:-13px;border-radius:50%;background:rgba(255,102,0,.3)"></div>`
            : ''
        }<div style="position:absolute;inset:0;box-sizing:border-box;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${
          highlighted ? '#FF6600' : '#FF7A1F'
        };border:${border}px solid #fff;box-shadow:-2px 4px 10px -2px rgba(21,34,56,.4)"></div><div style="position:absolute;left:50%;top:50%;width:${dot}px;height:${dot}px;margin:-${dot / 2}px 0 0 -${dot / 2}px;border-radius:50%;background:${
          highlighted ? '#152238' : '#fff'
        }"></div></div>`,
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
      onSelect,
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
              title={marker.label}
              eventHandlers={{ click: () => onSelect?.(marker.id) }}
            />
          ))}
        </MapContainer>
      );
    }

    return MapViewLeaflet;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[300px] w-full items-center justify-center bg-[#F3EDE3] text-sm text-ink-mute">
        Caricamento mappa…
      </div>
    ),
  }
);

export default function MapView(props: MapViewProps) {
  return <MapViewInner {...props} />;
}
