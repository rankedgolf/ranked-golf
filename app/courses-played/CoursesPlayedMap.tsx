"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function CoursesPlayedMap({
  locations,
}: {
  locations: {
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    courses: string[];
    rounds: number;
  }[];
}) {
  const center: [number, number] =
    locations.length > 0
      ? [locations[0].latitude, locations[0].longitude]
      : [39.8283, -98.5795];

  return (
    <div className="h-[500px] overflow-hidden rounded-2xl border">
      <MapContainer center={center} zoom={locations.length ? 8 : 4} className="h-full w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location) => (
          <Marker
            key={`${location.city}-${location.state}`}
            position={[location.latitude, location.longitude]}
            icon={icon}
          >
            <Popup>
              <strong>
                {location.city}, {location.state}
              </strong>
              <br />
              {location.rounds} round{location.rounds === 1 ? "" : "s"}
              <br />
              {location.courses.join(", ")}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}