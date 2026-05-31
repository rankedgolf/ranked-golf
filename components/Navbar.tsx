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

  const rankingsItems = [
  { href: "/leaderboard", label: "Ranked Golf World Leaderboard" },
  { href: "/ranking-system", label: "Ranking System" },
  { href: "/xp-leaderboard", label: "XP Rankings" },
  { href: "/xp-rules", label: "XP Rules" },
];

  const playItems = [
    { href: "/submit-round", label: "Submit Round" },
    { href: "/verify-rounds", label: "Verify Rounds" },
    { href: "/courses", label: "Courses" },
  ];

  const communityItems = [
    { href: "/players", label: "Players" },
    { href: "/events", label: "Events" },
    { href: "/feed", label: "Activity Feed" },
  ];

  const campaignItems = [
    { href: "/campaign", label: "Challenge Pass" },
    { href: "/achievements", label: "Achievements" },
    { href: "/xp-leaderboard", label: "XP Rankings" },
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

          {user && (
            <Link
              href="/submit-round"
              className="rounded-xl bg-green-700 px-4 py-2 font-semibold text-white transition hover:bg-green-600"
            >
              Submit Round
            </Link>
          )}

          {user ? (
            <Dropdown
              label="Account"
              items={[
                { href: "/dashboard", label: "My Dashboard" },
                { href: "/pricing", label: "Membership" },
                { href: "/logout", label: "Log Out" },
              ]}
            />
          ) : (
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
          )}
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t bg-white px-6 py-4 text-sm md:hidden">
          <Link href="/dashboard" className="hover:text-green-700">
            Dashboard
          </Link>

          <div className="border-t pt-3 font-semibold">Rankings</div>
          {rankingsItems.map((item) => (
            <Link key={item.href} href={item.href} className="pl-3 hover:text-green-700">
              {item.label}
            </Link>
          ))}

          <div className="border-t pt-3 font-semibold">Play</div>
          {playItems.map((item) => (
            <Link key={item.href} href={item.href} className="pl-3 hover:text-green-700">
              {item.label}
            </Link>
          ))}

          <div className="border-t pt-3 font-semibold">Community</div>
          {communityItems.map((item) => (
            <Link key={item.href} href={item.href} className="pl-3 hover:text-green-700">
              {item.label}
            </Link>
          ))}

          <div className="border-t pt-3 font-semibold">Campaign</div>
          {campaignItems.map((item) => (
            <Link key={item.href} href={item.href} className="pl-3 hover:text-green-700">
              {item.label}
            </Link>
          ))}

          <Link href="/pricing" className="border-t pt-3 hover:text-green-700">
            Membership
          </Link>

          {user && (
            <Link
              href="/submit-round"
              className="rounded-xl bg-green-700 px-4 py-2 text-center font-semibold text-white"
            >
              Submit Round
            </Link>
          )}

          {user ? (
            <Link
              href="/logout"
              className="rounded-xl border px-4 py-2 text-center font-semibold"
            >
              Log Out
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-green-700">
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-xl bg-black px-4 py-2 text-center font-semibold text-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}