import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowUpRight, CalendarClock, MapPin, PlusCircle, Users } from "lucide-react";
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
  const role = (session?.user as { role?: string } | undefined)?.role ?? "member";

  const events = [
    {
      id: "ev-1",
      name: "Jakarta Night Run",
      date: "2025-12-18",
      location: "Gelora Bung Karno",
      status: "Open",
      banner:
        "https://images.unsplash.com/photo-1432753759888-b30b2bdac995?auto=format&fit=crop&w=900&q=80",
      photos: 1820,
    },
    {
      id: "ev-2",
      name: "Monas 10K",
      date: "2025-11-28",
      location: "Monas, Jakarta",
      status: "Processing",
      banner:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
      photos: 940,
    },
    {
      id: "ev-3",
      name: "BSD Sprint Finals",
      date: "2025-11-05",
      location: "BSD City",
      status: "Published",
      banner:
        "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=900&q=80",
      photos: 1340,
    },
  ];

  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Events</h1>
          </div>
          {role === "admin" && (
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <PlusCircle className="h-4 w-4 mr-2" /> Create event
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <button
              key={event.id}
              type="button"
              className="group flex flex-col cursor-pointer rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label={`Open ${event.name} details`}
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
                <img src={event.banner} alt={event.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="rounded-full bg-white/15 px-2 py-1 backdrop-blur">
                    {event.status}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {event.photos.toLocaleString()} photos
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-semibold text-foreground">{event.name}</p>
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4" /> {event.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {event.location}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to see the full event page and public photo gallery.
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
