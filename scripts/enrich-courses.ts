import fs from "fs";

const API_KEY = process.env.GOLFCOURSE_API_KEY;

if (!API_KEY) {
  throw new Error("Missing GOLFCOURSE_API_KEY in .env.local");
}

type InputCourse = {
  facilityName: string;
  courseName: string;
  city: string;
  state: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function csvEscape(value: any) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

async function golfApi(path: string) {
  const res = await fetch(`https://api.golfcourseapi.com${path}`, {
    headers: {
      Authorization: `Key ${API_KEY}`,
    },
  });

  if (!res.ok) {
    console.error("API error:", res.status, await res.text());
    return null;
  }

  return res.json();
}

function pickBestTee(course: any) {
  const tees = [
    ...(course?.tees?.male || []),
    ...(course?.tees?.female || []),
  ];

  const eighteenHoleTees = tees.filter(
    (tee: any) => Number(tee.number_of_holes) === 18
  );

  const candidates = eighteenHoleTees.length ? eighteenHoleTees : tees;

  return (
    candidates.find((tee: any) =>
      String(tee.tee_name || "").toLowerCase().includes("white")
    ) ||
    candidates.find((tee: any) =>
      String(tee.tee_name || "").toLowerCase().includes("blue")
    ) ||
    candidates[0] ||
    null
  );
}

async function enrichCourse(input: InputCourse) {
  const searchQuery = encodeURIComponent(input.facilityName);

  const searchData = await golfApi(`/v1/search?search_query=${searchQuery}`);

  const matches = searchData?.courses || [];

const match = matches.find(
  (course: any) =>
    course?.location?.state?.toLowerCase() === input.state.toLowerCase()
);

  if (!match?.id) {
    return {
      ...input,
      apiId: "",
      par: "",
      courseRating: "",
      slopeRating: "",
      matchedName: "",
      status: "no_match",
    };
  }

  await sleep(3000);

  const fullCourseResponse = await golfApi(`/v1/courses/${match.id}`);
const fullCourse = fullCourseResponse?.course;

  const tee = pickBestTee(fullCourse);

  return {
    ...input,
    apiId: match.id,
    par: tee?.par_total ?? "",
    courseRating: tee?.course_rating ?? "",
    slopeRating: tee?.slope_rating ?? "",
    matchedName: `${fullCourse?.club_name || ""} ${fullCourse?.course_name || ""}`.trim(),
    status: tee ? "matched" : "matched_no_tee",
  };
}

async function main() {
  const inputPath = "scripts/ma-courses.json";

  const raw = fs.readFileSync(inputPath, "utf8");
  const courses: InputCourse[] = JSON.parse(raw);

  const outputRows = [
    [
      "facility_name",
      "course_name",
      "city",
      "state",
      "api_id",
      "matched_name",
      "par",
      "course_rating",
      "slope_rating",
      "status",
    ],
  ];

  for (const course of courses) {
    console.log(`Enriching: ${course.courseName}`);

    const result = await enrichCourse(course);

    outputRows.push([
      result.facilityName,
      result.courseName,
      result.city,
      result.state,
      result.apiId,
      result.matchedName,
      result.par,
      result.courseRating,
      result.slopeRating,
      result.status,
    ]);

    await sleep(5000);
  }

  const csv = outputRows
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  fs.writeFileSync("scripts/enriched-ma-courses.csv", csv);

  console.log("Done: scripts/enriched-ma-courses.csv");
}

main();