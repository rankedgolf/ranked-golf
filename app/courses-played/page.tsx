import Link from "next/link";
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

  if (!apiKey) {
    console.error("Missing LOCATIONIQ_ACCESS_TOKEN");
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_tier")
    .eq("user_id", currentUser.id)
    .single();

  const hasMapAccess =
    profile?.membership_tier === "pro" ||
    profile?.membership_tier === "competitive";

  if (!hasMapAccess) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-8 text-center">
          <p className="text-5xl">⛳</p>

          <h1 className="mt-4 text-3xl font-bold">
            Golf Map Tracker
          </h1>

          <p className="mt-3 text-gray-600">
            Unlock your personal golf map to track every course, city, and state
            you&apos;ve played through Ranked Golf.
          </p>

          <div className="mt-6 rounded-xl border border-dashed bg-gray-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Pro Feature
            </p>

            <p className="mt-2 text-lg font-bold">
              Build your golf footprint.
            </p>

            <p className="mt-2 text-sm text-gray-600">
              Pro members can automatically map played cities, view state
              progress, and build a career golf travel profile.
            </p>
          </div>

          <Link
            href="/pricing"
            className="mt-6 inline-flex rounded-lg bg-black px-5 py-2 font-semibold text-white"
          >
            Upgrade to Pro
          </Link>
        </div>
      </main>
    );
  }

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

              <section className="mt-8 rounded-xl border bg-gray-50 p-5">
  <h2 className="text-xl font-bold">
    Played courses before joining Ranked Golf?
  </h2>

  <p className="mt-2 text-sm text-gray-600">
    Pro members can send us a list of courses they&apos;ve played in the past, and
    we can manually add those locations to their Golf Map. Perfect for tracking
    past golf trips, bucket-list courses, and other courses you played before
    joining Ranked Golf.
  </p>

  <Link
    href="/contact"
    className="mt-4 inline-flex rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
  >
    Request Past Course Additions
  </Link>
</section>

        <section className="mt-8 rounded-xl border p-5">
          <h2 className="text-xl font-bold">Courses Played</h2>

          <div className="mt-4 space-y-3">
            {rounds?.map((round: any) => {
              const course = Array.isArray(round.courses)
                ? round.courses[0]
                : round.courses;

              return (
                <div key={round.id} className="rounded border p-3">
                  <p className="font-semibold">
                    {course?.name || round.course_name}
                  </p>

                  <p className="text-sm text-gray-600">
                    {[course?.city, course?.state]
                      .filter(Boolean)
                      .join(", ") || "Location unavailable"}
                    {" · "}
                    {round.played_at}
                  </p>
                </div>
              );
            })}

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