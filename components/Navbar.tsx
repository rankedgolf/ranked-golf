"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function Dropdown({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string }[];
}) {
  return (
    <div className="group relative">
      <button className="transition hover:text-green-700">
        {label} ▾
      </button>

      <div className="invisible absolute left-0 top-full z-50 min-w-48 rounded-xl border bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 hover:text-green-700"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoadingUser(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoadingUser(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const rankingsItems = [
    { href: "/leaderboard", label: "Ranked Golf World Leaderboard" },
    { href: "/ranking-system", label: "Ranking System" },
    { href: "/xp-leaderboard", label: "XP Rankings" },
    { href: "/xp-rules", label: "XP Rules" },
  ];

  const playItems = [
    { href: "/submit-round", label: "Submit Round" },
    { href: "/submit-practice", label: "Submit Practice" },
    { href: "/verify-rounds", label: "Verify Rounds" },
    { href: "/courses", label: "Courses" },
    { href: "/courses-played", label: "Golf Map" },
  ];

  const communityItems = [
    { href: "/players", label: "Players" },
    { href: "/events", label: "Events" },
    { href: "/feed", label: "Activity Feed" },
  ];

  const campaignItems = [
    { href: "/campaign", label: "Challenge Pass" },
    { href: "/achievements", label: "Achievements" },
    { href: "/practice", label: "Practice Log" },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-extrabold leading-tight">
          Ranked
          <br />
          Golf
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="cursor-pointer rounded border px-3 py-1 text-sm md:hidden"
        >
          Menu
        </button>

        <div className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/dashboard" className="transition hover:text-green-700">
            Dashboard
          </Link>

          <Dropdown label="Rankings" items={rankingsItems} />
          <Dropdown label="Play" items={playItems} />
          <Dropdown label="Community" items={communityItems} />
          <Dropdown label="Campaign" items={campaignItems} />

          <Link href="/pricing" className="transition hover:text-green-700">
            Membership
          </Link>

          {!loadingUser && user && (
            <Link
              href="/submit-round"
              className="rounded-xl bg-green-700 px-4 py-2 font-semibold text-white transition hover:bg-green-600"
            >
              Submit Round
            </Link>
          )}

          {!loadingUser && user ? (
            <Dropdown
              label="Account"
              items={[
                { href: "/dashboard", label: "My Dashboard" },
                { href: "/pricing", label: "Membership" },
                { href: "/logout", label: "Log Out" },
              ]}
            />
          ) : !loadingUser ? (
            <>
              <Link href="/login" className="transition hover:text-green-700">
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-xl bg-black px-4 py-2 font-semibold text-white transition hover:bg-green-700"
              >
                Sign Up
              </Link>
            </>
          ) : null}
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t bg-white px-6 py-4 text-sm md:hidden">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="hover:text-green-700"
          >
            Dashboard
          </Link>

          <div className="border-t pt-3 font-semibold">Rankings</div>
          {rankingsItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="pl-3 hover:text-green-700"
            >
              {item.label}
            </Link>
          ))}

          <div className="border-t pt-3 font-semibold">Play</div>
          {playItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="pl-3 hover:text-green-700"
            >
              {item.label}
            </Link>
          ))}

          <div className="border-t pt-3 font-semibold">Community</div>
          {communityItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="pl-3 hover:text-green-700"
            >
              {item.label}
            </Link>
          ))}

          <div className="border-t pt-3 font-semibold">Campaign</div>
          {campaignItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="pl-3 hover:text-green-700"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="border-t pt-3 hover:text-green-700"
          >
            Membership
          </Link>

          {!loadingUser && user && (
            <Link
              href="/submit-round"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-green-700 px-4 py-2 text-center font-semibold text-white"
            >
              Submit Round
            </Link>
          )}

          {!loadingUser && user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="hover:text-green-700"
              >
                My Dashboard
              </Link>

              <Link
                href="/logout"
                onClick={() => setOpen(false)}
                className="rounded-xl border px-4 py-2 text-center font-semibold"
              >
                Log Out
              </Link>
            </>
          ) : !loadingUser ? (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="hover:text-green-700"
              >
                Login
              </Link>

              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-black px-4 py-2 text-center font-semibold text-white"
              >
                Sign Up
              </Link>
            </>
          ) : null}
        </div>
      )}
    </nav>
  );
}