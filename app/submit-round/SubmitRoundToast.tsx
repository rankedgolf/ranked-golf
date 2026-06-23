"use client";

import { useEffect, useState } from "react";

export default function SubmitRoundToast({
  success,
  error,
  achievements,
  points,
  xp,
  course,
  score,
  diff,
}: {
  success?: string;
  error?: string;
  achievements?: string;
  points?: string;
  xp?: string;
  course?: string;
  score?: string;
  diff?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (success || error) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 6500);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (!show) return null;

  const errorMessages: Record<string, string> = {
    duplicate_round: "This round appears to have already been submitted. Contact us at rankedgolf@gmail.com if this is not a duplicate",
    submit_failed: "Something went wrong submitting your round. Please try again.",
    missing_course: "Please select a course before submitting your round.",
    missing_course_details:
      "Please enter tee box, par, course rating, and slope rating.",
    missing_round_details: "Please enter score, holes played, and date played.",
    not_registered:
      "You must register for this event before submitting an event round.",
    outside_event_window: "This round is outside the event date window.",
    event_round_exists: "You have already submitted a round for this event.",
    event_not_started: "This event has not started yet.",
    event_ended: "This event has ended and is no longer accepting submissions.",
    partner_required: "This event requires a playing partner for verification.",
    proof_required: "This event requires proof submission.",
  };

  const isSuccess = success === "true";

  return (
    <div className="fixed left-1/2 top-6 z-50 w-[92%] max-w-md -translate-x-1/2">
      <div
        className={`rounded-2xl border p-5 shadow-xl ${
          isSuccess
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="w-full">
            <p className="text-lg font-extrabold">
              {isSuccess ? "🏌️ Round Submitted!" : "Submission Notice"}
            </p>

            {isSuccess ? (
              <div className="mt-3 space-y-2 text-sm">
                {course && (
                  <p>
                    ⛳ <strong>{course}</strong>
                  </p>
                )}

                <p>
                  Score: <strong>{score || "--"}</strong>
                  {diff && <> · Diff: <strong>{diff}</strong></>}
                </p>

                <p>
                  ⭐ <strong>+{points || 0}</strong> Ranking Points
                </p>

                <p>
                  ⚡ <strong>+{xp || 0}</strong> XP Earned
                </p>

                {Number(achievements || 0) > 0 && (
                  <p>
                    🏆 <strong>{achievements}</strong> Achievement
                    {Number(achievements) === 1 ? "" : "s"} Unlocked
                  </p>
                )}

                <p className="pt-1 font-semibold">
                  Your world ranking has been updated.
                </p>
              </div>
            ) : (
              <p className="mt-1 text-sm">
                {errorMessages[error || ""] ||
                  "Something needs your attention."}
              </p>
            )}
          </div>

          <button
            onClick={() => setShow(false)}
            className="text-lg font-bold leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}