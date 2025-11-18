import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { createUser, listUsers } from "@/data/users.server";

export const Route = createFileRoute("/demo/start/db-users")({
  loader: () => listUsers(),
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const users = Route.useLoaderData();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("25");
  const [error, setError] = useState<string | null>(null);

  const isSubmitDisabled = useMemo(() => {
    return name.trim().length === 0 || email.trim().length === 0 || Number.isNaN(Number(age));
  }, [age, email, name]);

  const handleSubmit = useCallback(async () => {
    setError(null);

    const ageValue = Number(age);
    try {
      const created = await createUser({
        data: {
          name,
          email,
          age: ageValue,
        },
      });

      if (!created) {
        setError("Email already exists. Try another address.");
        return;
      }

      setName("");
      setEmail("");
      setAge("25");
      await router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  }, [age, email, name, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6 text-white">
      <div className="w-full max-w-4xl space-y-6 rounded-xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Database-backed Users Demo</h1>
          <p className="text-slate-300">
            Shows how to use TanStack server functions with Drizzle ORM. Seed the database, load
            this page, and try adding a new user below.
          </p>
        </header>

        <section>
          <h2 className="text-xl font-semibold mb-3">Seeded Users</h2>
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-800/60 text-slate-300">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Age</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-5 text-center text-slate-400" colSpan={3}>
                      No users found. Run{" "}
                      <code className="rounded bg-slate-800 px-2 py-1">bun run db:seed</code>.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-t border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3">{user.name}</td>
                      <td className="px-4 py-3 text-slate-300">{user.email}</td>
                      <td className="px-4 py-3">{user.age}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Add a user</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm uppercase tracking-wide text-slate-400">Name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm uppercase tracking-wide text-slate-400">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm uppercase tracking-wide text-slate-400">Age</span>
              <input
                type="number"
                value={age}
                min={0}
                onChange={(event) => setAge(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
              />
            </label>
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/40"
            >
              Add user
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
