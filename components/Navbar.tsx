"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    loadUser();
  }, []);

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold">
          Ranked Golf
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="rounded border px-3 py-1 text-sm md:hidden"
        >
          Menu
        </button>

        <div className="hidden items-center gap-5 text-sm md:flex">
          <Link href="/pricing" className="hover:underline">
  Membership
</Link>

<Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>

          <Link href="/leaderboard" className="hover:underline">
            Leaderboard
          </Link>

          <Link href="/events" className="hover:underline">
            Events
          </Link>

          <Link href="/courses" className="hover:underline">
            Courses
          </Link>

          <Link href="/players" className="hover:underline">
  Players
</Link>

          <Link href="/feed" className="hover:underline">
            Activity
          </Link>

          <Link href="/ranking-system" className="hover:underline">
            Ranking System
          </Link>

          {user && (
            <>
              <Link href="/submit-round" className="hover:underline">
                Submit Round
              </Link>

              <Link href="/verify-rounds" className="hover:underline">
                Verify Rounds
              </Link>
            </>
          )}

          {user ? (
            <>

              <Link
                href="/logout"
                className="rounded border px-3 py-1 font-semibold"
              >
                Log Out
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded bg-black px-3 py-1 font-semibold text-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t px-6 py-4 text-sm md:hidden">
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/events">Events</Link>
          <Link href="/courses">Courses</Link>
          <Link href="/players">Players</Link>
          <Link href="/feed">Activity</Link>
          <Link href="/ranking-system">Ranking System</Link>

          {user && (
            <>
              <Link href="/submit-round">Submit Round</Link>
              <Link href="/verify-rounds">Verify Rounds</Link>
            </>
          )}

          {user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/logout">Log Out</Link>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}