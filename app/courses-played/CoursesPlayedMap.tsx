"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

const icon = L.divIcon({
  html: "⛳",
  className: "golf-marker",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function FitBounds({
  locations,
}: {
  locations: {
    latitude: number;
    longitude: number;
  }[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!locations.length) return;

    const bounds = L.latLngBounds(
      locations.map((location) => [
        location.latitude,
        location.longitude,
      ])
    );

    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 10,
    });
  }, [locations, map]);

  return null;
}

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
      <MapContainer
        center={center}
        zoom={locations.length ? 8 : 4}
        className="h-full w-full"
      >
        <FitBounds locations={locations} />

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