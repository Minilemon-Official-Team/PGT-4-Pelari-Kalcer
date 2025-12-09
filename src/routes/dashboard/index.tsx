import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Calendar, Compass, Settings, User } from "lucide-react";
import type React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getAuthSession } from "@/lib/auth-actions";

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session?.user) {
      throw redirect({ to: "/login", search: { redirect: "/dashboard" } });
    }
    return { session };
  },
  component: DashboardPage,
});

function StatCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 text-(--accent-strong)">
        <Icon className="h-5 w-5" />
        <h3 className="text-lg font-semibold text-(--text-primary)">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-(--text-muted)">{description}</p>
    </div>
  );
}

function DashboardPage() {
  const { session } = Route.useRouteContext();
  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-(--text-muted)">Welcome back</p>
          <h1 className="text-2xl font-semibold">Your hub for events and matches</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Events" description="Manage upcoming and past events." icon={Calendar} />
          <StatCard
            title="Find Me"
            description="Run face search to find your shots."
            icon={Compass}
          />
          <StatCard title="Account" description="Keep your profile up to date." icon={User} />
          <StatCard
            title="Settings"
            description="Adjust preferences and security."
            icon={Settings}
          />
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-(--text-muted)">
          Need to upload an album? Head to the Events section to tag uploads to an event and keep
          everything organized.
          <div className="mt-3">
            <Link to="/events" className="text-(--accent-strong) font-medium">
              Go to Events →
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
