import MapClient from "./MapClient";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getOrCreateCoordinates(
  supabase: any,
  city: string,
  state: string
) {
  const normalizedCity = city.trim();
  const normalizedState = state.trim();

  const { data: existing } = await supabase
    .from("location_coordinates")
    .select("*")
    .ilike("city", normalizedCity)
    .ilike("state", normalizedState)
    .maybeSingle();

  if (existing) return existing;

  const apiKey = process.env.LOCATIONIQ_ACCESS_TOKEN;

  console.log("Geocoding missing location:", normalizedCity, normalizedState);
console.log("LocationIQ token exists:", !!apiKey);

  if (!apiKey) {
    console.error("Missing LOCATIONIQ_API_KEY");
    return null;
  }

  const query = encodeURIComponent(
    `${normalizedCity}, ${normalizedState}, USA`
  );

  const res = await fetch(
    `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${query}&format=json&limit=1`
  );

  if (!res.ok) {
    console.error("LocationIQ error:", await res.text());
    return null;
  }

  const results = await res.json();

  console.log("LocationIQ results:", results);

  if (!results?.length) return null;

  const latitude = Number(results[0].lat);
  const longitude = Number(results[0].lon);

  const { data: inserted, error: insertError } = await supabase
    .from("location_coordinates")
    .insert({
      city: normalizedCity,
      state: normalizedState,
      country: "USA",
      latitude,
      longitude,
      source: "locationiq",
    })
    .select()
    .single();

  if (insertError) {
    console.error("Coordinate insert error:", insertError);
    return null;
  }

  return inserted;
}

export default async function CoursesPlayedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const currentUser = user || session?.user;

  if (!currentUser) redirect("/login");

  const { data: rounds } = await supabase
    .from("rounds")
    .select(`
      id,
      course_name,
      course_id,
      played_at,
      courses (
        name,
        city,
        state
      )
    `)
    .eq("user_id", currentUser.id)
    .order("played_at", { ascending: false });

  const { data: savedLocations } = await supabase
    .from("location_coordinates")
    .select("*");

  const locationMap = new Map(
    savedLocations?.map((loc) => [
      `${loc.city?.toLowerCase()},${loc.state?.toLowerCase()}`,
      loc,
    ]) || []
  );

  const grouped = new Map<string, any>();

  for (const round of rounds || []) {
    const course = Array.isArray(round.courses)
  ? round.courses[0]
  : round.courses;

const city = course?.city;
const state = course?.state;
const courseName = course?.name || round.course_name;

    if (!city || !state) continue;

    const key = `${city}, ${state}`;
    const coordKey = `${city.toLowerCase()},${state.toLowerCase()}`;

    let coords = locationMap.get(coordKey);

    if (!coords) {
      coords = await getOrCreateCoordinates(supabase, city, state);

      if (coords) {
        locationMap.set(coordKey, coords);
      }
    }

    if (!coords) continue;

    const existing = grouped.get(key) || {
      city,
      state,
      latitude: Number(coords.latitude),
      longitude: Number(coords.longitude),
      courses: new Set<string>(),
      rounds: 0,
    };

    existing.courses.add(courseName);
    existing.rounds += 1;

    grouped.set(key, existing);
  }

  const locations = Array.from(grouped.values()).map((item) => ({
    ...item,
    courses: Array.from(item.courses),
  }));

  const uniqueCourses = new Set(
    rounds?.map((round: any) => round.course_id || round.course_name)
  );

 const uniqueStates = new Set(
  rounds
    ?.map((round: any) => {
      const course = Array.isArray(round.courses)
        ? round.courses[0]
        : round.courses;

      return course?.state;
    })
    .filter(Boolean)
);

 const missingLocations =
  rounds
    ?.filter((round: any) => {
      const course = Array.isArray(round.courses)
        ? round.courses[0]
        : round.courses;

      const city = course?.city;
      const state = course?.state;

      if (!city || !state) return false;

      return !locationMap.has(
        `${city.toLowerCase()},${state.toLowerCase()}`
      );
    })
    .map((round: any) => {
      const course = Array.isArray(round.courses)
        ? round.courses[0]
        : round.courses;

      return `${course.city}, ${course.state}`;
    }) || [];

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">My Golf Map</h1>

        <p className="mt-2 text-gray-600">
          Track the courses, cities, and states you&apos;ve played through Ranked
          Golf.
        </p>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-5">
            <p className="text-sm text-gray-500">Courses Played</p>
            <p className="mt-2 text-3xl font-bold">{uniqueCourses.size}</p>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-gray-500">Cities Mapped</p>
            <p className="mt-2 text-3xl font-bold">{locations.length}</p>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-gray-500">States Played</p>
            <p className="mt-2 text-3xl font-bold">{uniqueStates.size}</p>
          </div>
        </section>

        <section className="mt-8">
          <MapClient locations={locations} />
        </section>

        {!!missingLocations.length && (
          <div className="mt-6 rounded-xl border bg-yellow-50 p-4 text-sm text-yellow-800">
            Some played cities do not have map coordinates yet:{" "}
            {[...new Set(missingLocations)].join(", ")}
          </div>
        )}

        <section className="mt-8 rounded-xl border p-5">
          <h2 className="text-xl font-bold">Courses Played</h2>

          <div className="mt-4 space-y-3">
            {rounds?.map((round: any) => (
              <div key={round.id} className="rounded border p-3">
                <p className="font-semibold">
                  {round.courses?.name || round.course_name}
                </p>

                <p className="text-sm text-gray-600">
                  {[round.courses?.city, round.courses?.state]
                    .filter(Boolean)
                    .join(", ") || "Location unavailable"}
                  {" · "}
                  {round.played_at}
                </p>
              </div>
            ))}

            {!rounds?.length && (
              <p className="text-gray-600">
                Submit your first round to start building your golf map.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}