import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Camera, RefreshCw, ShieldCheck } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { updateUserProfile } from "@/features/users/server";
import { getAuthSession } from "@/lib/auth-actions";
import { getSession } from "@/lib/auth-client";

export const Route = createFileRoute("/settings/")({
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session?.user) {
      throw redirect({ to: "/login", search: { redirect: "/settings" } });
    }
    return { session };
  },
  component: SettingsPage,
});

function SettingsPage() {
  const { session } = Route.useRouteContext();
  const profile = {
    name: session?.user?.name ?? "RunCam Member",
    email: session?.user?.email ?? "user@example.com",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    role: (session?.user as { role?: string } | undefined)?.role ?? "member",
  };

  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-(--text-primary)">Settings</h1>
        <SettingsForm profile={profile} />
      </div>
    </DashboardLayout>
  );
}

type SettingsFormProps = {
  profile: { name: string; email: string; avatar: string; role: string };
};

function SettingsForm({ profile }: SettingsFormProps) {
  const [formState, setFormState] = useState({
    username: profile.name,
    email: profile.email,
    phone: "",
  });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const updateUserProfileFn = useServerFn(updateUserProfile);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setError(null);
    setIsPending(true);
    try {
      const result = await updateUserProfileFn({
        data: {
          username: formState.username,
          email: formState.email,
          phone: formState.phone || undefined,
        },
      });
      if (result?.user) {
        setFormState({
          username: result.user.username,
          email: result.user.email,
          phone: result.user.phone ?? "",
        });
        await getSession();
      }
      setStatus("success");
    } catch (mutationError) {
      setStatus("error");
      if (mutationError instanceof Response) {
        const text = await mutationError.text();
        setError(text || "Unable to update profile");
      } else if (mutationError instanceof Error) {
        setError(mutationError.message);
      } else {
        setError("Unable to update profile");
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleReset = () => {
    setFormState({ username: profile.name, email: profile.email, phone: "" });
    setStatus("idle");
    setError(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="h-16 w-16 rounded-full object-cover border border-slate-200"
          />
          <div className="space-y-1">
            <p className="text-lg font-semibold text-(--text-primary)">{formState.username}</p>
            <p className="text-sm text-(--text-muted)">{formState.email}</p>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs uppercase font-semibold text-(--text-muted)">
              {profile.role}
            </span>
          </div>
        </div>
        <Button variant="outline" className="self-start md:self-auto" type="button">
          <Camera className="h-4 w-4 mr-2" /> Change profile photo
        </Button>
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-(--text-muted) flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-(--accent-strong) mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-(--text-primary)">Keep your selfie current</p>
          <p>
            Update your face photo periodically. Embeddings refresh the next time you run Find Me.
          </p>
          <Button variant="secondary" className="mt-2 px-3 py-1.5 text-sm" type="button">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh face registration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2 text-sm">
          <span className="text-(--text-muted)">Username</span>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50"
            value={formState.username}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, username: event.target.value }))
            }
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-(--text-muted)">Email</span>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50"
            value={formState.email}
            onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2 text-sm">
          <span className="text-(--text-muted)">Phone</span>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50"
            value={formState.phone}
            onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
            placeholder="+62..."
          />
        </label>
        <div className="space-y-2 text-sm">
          <span className="text-(--text-muted)">Security</span>
          <p className="text-(--text-muted)">
            Password updates are handled via the account portal.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Notifications</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4" defaultChecked />
          <span>Email me when new events are published</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4" />
          <span>Push alerts for face matches</span>
        </label>
      </div>

      {status === "success" && (
        <p className="text-sm text-emerald-700">Profile updated successfully.</p>
      )}
      {status === "error" && error && <p className="text-sm text-rose-700">{error}</p>}

      <div className="flex gap-3">
        <Button
          className="bg-(--accent) text-(--surface) hover:bg-(--accent-strong)"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save changes"}
        </Button>
        <Button variant="outline" type="button" onClick={handleReset} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
