import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, MapPin } from "lucide-react";
import { getEvents } from "@/features/events/server";

export const Route = createFileRoute("/events/")({
  component: EventsPage,
  loader: async () => {
    return await getEvents({ data: { visibility: "public", limit: 20 } });
  },
});

function EventsPage() {
  const events = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <section className="relative py-16 px-6 text-center">
        <div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover{" "}
            <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Events
            </span>
          </h1>
          <p className="text-lg text-gray-400">Find photos from running events across Indonesia</p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          {events.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No events available yet.</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for upcoming events!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

type Event = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  image: string | null;
  startsAt: Date | null;
  visibility: "public" | "unlisted";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

function EventCard({ event }: { event: Event }) {
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
      className="group block bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
    >
      {/* Banner Image */}
      <div className="aspect-video relative overflow-hidden bg-slate-700">
        {event.image ? (
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-slate-500 text-sm">No images</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
          {event.name}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Calendar className="w-4 h-4 text-cyan-500" />
            <span>{formattedDate}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4 text-cyan-500" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="mt-3 text-gray-500 text-sm line-clamp-2">{event.description}</p>
        )}
      </div>
    </Link>
  );
}
