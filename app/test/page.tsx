import { createClient } from "@/lib/supabase/server";

export default async function TestPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Supabase Connected</h1>

      <pre className="mt-4">
        {JSON.stringify(
          {
            authenticated: !!user,
            user,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}