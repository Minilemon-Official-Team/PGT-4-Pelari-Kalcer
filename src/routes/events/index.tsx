import { createFileRoute, redirect } from "@tanstack/react-router";
import { CalendarClock, Upload } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth-actions";

export const Route = createFileRoute("/events/")({
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session?.user) {
      throw redirect({ to: "/login", search: { redirect: "/events" } });
    }
    return { session };
  },
  component: EventsPage,
});

function EventsPage() {
  const { session } = Route.useRouteContext();
  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm text-(--text-muted)">Events</p>
            <h1 className="text-2xl font-semibold">Manage event albums</h1>
            <p className="text-(--text-muted) mt-1">Upload albums and link them to events.</p>
          </div>
          <Button className="bg-(--accent) text-(--surface) hover:bg-(--accent-strong)">
            <Upload className="h-4 w-4 mr-2" /> Upload album
          </Button>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-(--text-muted)">
          <div className="flex items-center gap-3 text-(--text-primary)">
            <CalendarClock className="h-5 w-5 text-(--accent-strong)" />
            Upcoming events will appear here.
          </div>
          <p className="mt-3">
            Create or sync events, then attach uploads so runners find shots fast.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
