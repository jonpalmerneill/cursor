export default async function PasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params?.next || "/";

  return (
    <main style={{ maxWidth: 420, margin: "10vh auto", padding: 24 }}>
      <h1>Enter site password</h1>
      <form method="POST" action={`/api/unlock?next=${encodeURIComponent(next)}`}>
        <input
          name="password"
          type="password"
          placeholder="Password"
          autoFocus
          style={{ width: "100%", padding: 12, margin: "12px 0" }}
        />
        <button style={{ width: "100%", padding: 12 }}>Unlock</button>
      </form>
    </main>
  );
}
