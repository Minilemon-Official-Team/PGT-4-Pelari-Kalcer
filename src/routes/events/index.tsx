import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { type EventRecord } from "@/contracts/events.contract";
import { getEvents } from "@/features/events/server";
import { getAuthSession } from "@/lib/auth-actions";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Calendar, EyeOff, MapPin } from "lucide-react";

export const Route = createFileRoute("/events/")({
  component: EventsPage,
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  loader: async () => {
    const session = await getAuthSession();
    const isAdmin = session?.user?.role === "admin";
    
    return await getEvents({ 
      data: isAdmin ? { limit: 20 } : { visibility: "public", limit: 20 } 
    });
  },
});

function EventsPage() {
  const events = Route.useLoaderData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-2">
            Find photos from running events across Indonesia
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No events available yet.</p>
            <p className="text-muted-foreground text-sm mt-2">Check back soon for upcoming events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date TBA";

  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group block bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-300"
    >
      {/* Banner Image */}
      <div className="aspect-video relative overflow-hidden bg-muted">
        {event.image ? (
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No images</span>
          </div>
        )}
        {/* Unlisted badge */}
        {event.visibility === "unlisted" && (
          <div className="absolute top-2 right-2 bg-background/90 border px-2 py-1 rounded text-xs flex items-center gap-1">
            <EyeOff size={12} />
            <span>Unlisted</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3 group-hover:text-accent transition-colors line-clamp-2">
          {event.name}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="mt-3 text-muted-foreground text-sm line-clamp-2">{event.description}</p>
        )}
      </div>
    </Link>
  );
}
