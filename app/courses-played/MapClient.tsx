"use client";

import dynamic from "next/dynamic";

const CoursesPlayedMap = dynamic(() => import("./CoursesPlayedMap"), {
  ssr: false,
});

export default function MapClient({
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
  return <CoursesPlayedMap locations={locations} />;
}