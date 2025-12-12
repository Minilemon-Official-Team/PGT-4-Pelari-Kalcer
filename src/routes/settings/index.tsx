import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Camera, RefreshCw, ShieldCheck } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { UserProfile } from "@/contracts/users.contract";
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

  const profile: SettingsProfile = {
    username: session?.user?.name ?? "RunCam Member",
    email: session?.user?.email ?? "user@example.com",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    role: (session?.user?.role as UserProfile["role"]) ?? "member",
    phone: null,
  };

  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <SettingsForm profile={profile} />
      </div>
    </DashboardLayout>
  );
}

type SettingsProfile = Pick<UserProfile, "username" | "email" | "role"> & {
  avatar?: string;
  phone?: string | null;
};

type SettingsFormProps = {
  profile: SettingsProfile;
};

function SettingsForm({ profile }: SettingsFormProps) {
  const [formState, setFormState] = useState({
    username: profile.username,
    email: profile.email,
    phone: profile.phone ?? "",
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
            <p className="text-lg font-semibold text-foreground">{formState.username}</p>
            <p className="text-sm text-muted-foreground">{formState.email}</p>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs uppercase font-semibold text-muted-foreground">
              {profile.role}
            </span>
          </div>
        </div>
        <Button variant="outline" className="self-start md:self-auto" type="button">
          <Camera className="h-4 w-4 mr-2" /> Change profile photo
        </Button>
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-muted-foreground flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">Keep your face data current</p>
          <p>
            Update your face photo periodically to ensure accurate matching. Embeddings refresh the
            next time you run Find Me.
          </p>
          <Button variant="outline" className="mt-2 px-3 py-1.5 text-sm" type="button">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Update Face Data</span>
            <span className="sm:hidden">Update Face</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2 text-sm" htmlFor="username">
          <span className="text-muted-foreground">Username</span>
          <Input
            id="username"
            value={formState.username}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, username: event.target.value }))
            }
          />
        </label>
        <label className="space-y-2 text-sm" htmlFor="email">
          <span className="text-muted-foreground">Email</span>
          <Input
            id="email"
            value={formState.email}
            onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2 text-sm" htmlFor="phone">
          <span className="text-muted-foreground">Phone</span>
          <Input
            id="phone"
            value={formState.phone}
            onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
            placeholder="+62..."
          />
        </label>
        <div className="space-y-2 text-sm">
          <span className="text-muted-foreground">Security</span>
          <p className="text-muted-foreground">
            To change your password, please visit the account security page.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Notifications</p>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="notify-email" defaultChecked />
          <label htmlFor="notify-email">Email me when new events are published</label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="notify-push" />
          <label htmlFor="notify-push">Push alerts for face matches</label>
        </div>
      </div>

      {status === "success" && (
        <p className="text-sm text-emerald-700">Profile updated successfully.</p>
      )}
      {status === "error" && error && <p className="text-sm text-rose-700">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="ghost" type="button" disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
