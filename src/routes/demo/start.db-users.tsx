import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { USER_DEFAULT_AGE, type UserCreateInput } from "@/contracts/users.contract";
import { createUser, deleteUser, listUsers, updateUser } from "@/features/demo/users/server";

export const Route = createFileRoute("/demo/start/db-users")({
  loader: () => listUsers(),
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const users = Route.useLoaderData();

  const [form, setForm] = useState<{
    name: UserCreateInput["name"];
    email: UserCreateInput["email"];
    age: string;
  }>(() => ({
    name: "",
    email: "",
    age: String(USER_DEFAULT_AGE),
  }));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const isSubmitDisabled = useMemo(() => {
    return (
      form.name.trim().length === 0 ||
      form.email.trim().length === 0 ||
      Number.isNaN(Number(form.age))
    );
  }, [form.age, form.email, form.name]);

  const resetForm = useCallback(() => {
    setForm({ name: "", email: "", age: String(USER_DEFAULT_AGE) });
    setEditingId(null);
    setStatus(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setStatus(null);

    const ageValue = Number(form.age);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        age: ageValue,
      } satisfies UserCreateInput;

      if (editingId) {
        const updated = await updateUser({ data: { id: editingId, ...payload } });
        if (!updated) {
          setError("User no longer exists");
          return;
        }
        setStatus("User updated");
      } else {
        const created = await createUser({ data: payload });

        if (!created) {
          setError("Email already exists. Try another address.");
          return;
        }

        setStatus("User added");
      }

      resetForm();
      await router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  }, [editingId, form.age, form.email, form.name, resetForm, router]);

  const startEditing = useCallback(
    (user: { id: number; name: string; email: string; age: number }) => {
      setForm({ name: user.name, email: user.email, age: String(user.age) });
      setEditingId(user.id);
      setError(null);
      setStatus(null);
    },
    [],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      setError(null);
      setStatus(null);
      try {
        await deleteUser({ data: { id } });
        if (editingId === id) {
          resetForm();
        }
        await router.invalidate();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete user");
      }
    },
    [editingId, resetForm, router],
  );

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
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-5 text-center text-slate-400" colSpan={4}>
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
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            type="button"
                            onClick={() => startEditing(user)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            type="button"
                            onClick={() => handleDelete(user.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
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
            <label className="flex flex-col gap-2" htmlFor="demo-user-name">
              <span className="text-sm uppercase tracking-wide text-slate-400">Name</span>
              <Input
                id="demo-user-name"
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-2" htmlFor="demo-user-email">
              <span className="text-sm uppercase tracking-wide text-slate-400">Email</span>
              <Input
                id="demo-user-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-2" htmlFor="demo-user-age">
              <span className="text-sm uppercase tracking-wide text-slate-400">Age</span>
              <Input
                id="demo-user-age"
                type="number"
                value={form.age}
                min={0}
                onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
              />
            </label>
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {status ? <p className="text-sm text-emerald-400">{status}</p> : null}
          <div className="flex justify-end">
            {editingId ? (
              <Button variant="ghost" type="button" className="mr-2" onClick={resetForm}>
                Cancel
              </Button>
            ) : null}
            <Button type="button" onClick={handleSubmit} disabled={isSubmitDisabled}>
              {editingId ? "Update user" : "Add user"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
