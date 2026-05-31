import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-gray-500 md:flex-row">
        <div>
          © {new Date().getFullYear()} Ranked Golf.
          All rights reserved.
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/privacy"
            className="transition hover:text-black"
          >
            Privacy
          </Link>

          <Link
            href="/terms"
            className="transition hover:text-black"
          >
            Terms
          </Link>

          <Link
            href="/disclaimer"
            className="transition hover:text-black"
          >
            Disclaimer
          </Link>

          <Link
            href="/refund-policy"
            className="transition hover:text-black"
          >
            Refunds
          </Link>
        </div>
      </div>
    </footer>
  );
}