import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const currentUser = user || session?.user;

  if (!currentUser) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(50);

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", currentUser.id)
    .eq("is_read", false);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>

            <p className="mt-2 text-gray-600">
              Props, comments, and activity from the Ranked Golf community.
            </p>
          </div>

          <Link href="/feed" className="rounded border px-4 py-2 font-semibold">
            View Feed
          </Link>
        </div>

        <div className="space-y-3">
          {notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-4 ${
                notification.is_read ? "bg-white" : "bg-green-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {notification.type === "props"
                    ? "👏"
                    : notification.type === "comment"
                    ? "💬"
                    : "🔔"}
                </div>

                <div>
                  <p className="font-semibold">{notification.message}</p>

                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {!notifications?.length && (
            <div className="rounded-xl border p-6 text-center text-gray-600">
              No notifications yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}