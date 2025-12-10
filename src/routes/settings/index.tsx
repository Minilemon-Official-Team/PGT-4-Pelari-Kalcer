import { createFileRoute, redirect } from "@tanstack/react-router";
import { Camera, RefreshCw, ShieldCheck } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth-actions";

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
  };

  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-(--text-primary)">Settings</h1>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-16 w-16 rounded-full object-cover border border-slate-200"
              />
              <div className="space-y-1">
                <p className="text-lg font-semibold text-(--text-primary)">{profile.name}</p>
                <p className="text-sm text-(--text-muted)">{profile.email}</p>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs uppercase font-semibold text-(--text-muted)">
                  {(session?.user as { role?: string } | undefined)?.role ?? "member"}
                </span>
              </div>
            </div>
            <Button variant="outline" className="self-start md:self-auto">
              <Camera className="h-4 w-4 mr-2" /> Change profile photo
            </Button>
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-(--text-muted) flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-(--accent-strong) mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-(--text-primary)">Keep your selfie current</p>
              <p>
                Update your face photo periodically. Embeddings refresh the next time you run Find
                Me.
              </p>
              <Button variant="secondary" size="sm" className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh face registration
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm">
              <span className="text-(--text-muted)">Username</span>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50"
                defaultValue={profile.name}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-(--text-muted)">Email</span>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50"
                defaultValue={profile.email}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm">
              <span className="text-(--text-muted)">New password</span>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50"
                placeholder="••••••••"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-(--text-muted)">Confirm password</span>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50"
                placeholder="••••••••"
              />
            </label>
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

          <div className="flex gap-3">
            <Button className="bg-(--accent) text-(--surface) hover:bg-(--accent-strong)">
              Save changes
            </Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
