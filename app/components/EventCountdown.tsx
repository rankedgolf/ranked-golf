"use client";

import { useEffect, useState } from "react";

function getTimeLeft(endDate: string) {
  const target = new Date(`${endDate}T23:59:59`).getTime();
  const now = Date.now();
  const difference = Math.max(0, target - now);

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function EventCountdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft> | null>(
    null
  );

  useEffect(() => {
    setTimeLeft(getTimeLeft(endDate));

    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm font-bold uppercase text-green-700">Live Now</p>
        <p className="mt-4 text-sm text-gray-500">Time Remaining</p>
        <p className="mt-2 text-2xl font-extrabold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-green-600" />
        <p className="text-sm font-bold uppercase text-green-700">Live Now</p>
      </div>

      <p className="mt-4 text-sm text-gray-500">Time Remaining</p>

      <div className="mt-2 grid grid-cols-4 gap-2 text-center">
        <div><p className="text-2xl font-extrabold">{timeLeft.days}</p><p className="text-xs text-gray-500">Days</p></div>
        <div><p className="text-2xl font-extrabold">{timeLeft.hours}</p><p className="text-xs text-gray-500">Hrs</p></div>
        <div><p className="text-2xl font-extrabold">{timeLeft.minutes}</p><p className="text-xs text-gray-500">Mins</p></div>
        <div><p className="text-2xl font-extrabold">{timeLeft.seconds}</p><p className="text-xs text-gray-500">Secs</p></div>
      </div>
    </div>
  );
}