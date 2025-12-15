import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowUpRight, CalendarClock, EyeOff, MapPin, PlusCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import type { EventRecord } from "@/contracts/events.contract";
import { getEvents } from "@/features/events/server";
import { getAuthSession } from "@/lib/auth-actions";

export const Route = createFileRoute("/events/")({
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session?.user) {
      throw redirect({ to: "/login", search: { redirect: "/events" } });
    }
    return { session };
  },
  loader: async () => {
    const session = await getAuthSession();
    const isAdmin = session?.user?.role === "admin";

    return await getEvents({
      data: isAdmin ? { limit: 20 } : { visibility: "public", limit: 20 },
    });
  },
  component: EventsPage,
});

function EventsPage() {
  const { session } = Route.useRouteContext();
  const events = Route.useLoaderData();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "member";

  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Events</h1>
          </div>
          {role === "admin" && (
            <Link to="/admin/events/new">
              <Button variant="default">
                <PlusCircle className="h-4 w-4 mr-2" /> Create event
              </Button>
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-(--text-muted) text-lg">No events available yet.</p>
            <p className="text-(--text-muted) text-sm mt-2">Check back soon for upcoming events!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function EventCard({ event }: { event: EventRecord }) {
  const formattedDate = event.startsAt
    ? new Date(event.startsAt).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Date TBA";

  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group flex flex-col cursor-pointer rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-(--accent)/40"
      aria-label={`Open ${event.name} details`}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
        {event.image ? (
          <img src={event.image} alt={event.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-slate-100 flex items-center justify-center">
            <span className="text-(--text-muted) text-sm">No image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
          <span className="rounded-full bg-white/15 px-2 py-1 backdrop-blur">
            {event.visibility === "public" ? "Public" : "Unlisted"}
          </span>
          {/* Unlisted badge for admin visibility */}
          {event.visibility === "unlisted" && (
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 backdrop-blur">
              <EyeOff className="h-3 w-3" /> Admin only
            </span>
          )}
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-semibold text-(--text-primary) line-clamp-1">{event.name}</p>
          <ArrowUpRight className="h-4 w-4 text-primary" />
        </div>
        <div className="flex items-center gap-2 text-sm text-(--text-muted)">
          <CalendarClock className="h-4 w-4" /> {formattedDate}
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-(--text-muted)">
            <MapPin className="h-4 w-4" /> <span className="line-clamp-1">{event.location}</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground text-center">
          Click to see the full event page and public photo gallery.
        </p>
      </div>
    </Link>
  );
}
