import { createFileRoute, Link, redirect } from "@tanstack/react-router";
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
  const role = (session?.user as { role?: string } | undefined)?.role ?? "member";

  const roleCta = (() => {
    if (role === "creator") {
      return { label: "You are a Creator", variant: "secondary" as const };
    }
    if (role === "admin") {
      return { label: "Manage verifications", variant: "outline" as const };
    }
    return { label: "Apply for Creator verification", variant: "primary" as const };
  })();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-(--text-muted)">Profile & account</p>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-(--text-muted)">
            Manage your profile, notifications, and privacy preferences.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm">
              <span className="text-(--text-muted)">Display name</span>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50"
                placeholder="RunCam Operator"
                defaultValue="RunCam Operator"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-(--text-muted)">Email</span>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50"
                placeholder="you@example.com"
                defaultValue="you@example.com"
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

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm text-(--text-muted)">Creator verification</p>
              <p className="text-base font-medium">Visibility & trust</p>
              <p className="text-sm text-(--text-muted)">
                Apply to become a verified creator or manage verification requests.
              </p>
            </div>
            <Link to="/verification">
              <Button variant={roleCta.variant}>{roleCta.label}</Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
