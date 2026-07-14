import LoginForm from "./components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    password?: string;
    next?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <LoginForm
          passwordUpdated={params.password === "updated"}
          next={params.next || "/dashboard"}
        />
      </div>
    </main>
  );
}