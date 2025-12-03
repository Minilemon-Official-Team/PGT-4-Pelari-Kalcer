import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Eye, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEventById } from "@/features/events/server";

export const Route = createFileRoute("/events/$eventId")({
  component: EventDetailPage,
  loader: async ({ params }) => {
    return await getEventById({ data: params.eventId });
  },
  errorComponent: EventNotFound,
});

function EventNotFound() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold text-white mb-4">Event Not Found</h1>
        <p className="text-gray-400 mb-8">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/events">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
    </div>
  );
}

function EventDetailPage() {
  const event = Route.useLoaderData();

  const formattedDate = event.startsAt
    ? new Date(event.startsAt).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Date TBA";

  const formattedTime = event.startsAt
    ? new Date(event.startsAt).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px] max-h-[500px]">
        {event.image ? (
          <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <span className="text-slate-500">No banner image</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/50 to-transparent" />

        {/* Back button */}
        <div className="absolute top-6 left-6">
          <Link to="/events">
            <Button
              variant="ghost"
              className="bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </section>

      {/* Event Details */}
      <section className="relative -mt-20 px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 shadow-xl">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">{event.name}</h1>

            {/* Meta info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">
                    {formattedDate}
                    {formattedTime && <span className="text-gray-400"> • {formattedTime}</span>}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-gray-300">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Eye className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Visibility</p>
                  <p className="font-medium capitalize">{event.visibility}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-3">About this Event</h2>
                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Photos section placeholder */}
            <div className="border-t border-slate-700/50 pt-8">
              <h2 className="text-lg font-semibold text-white mb-4">Event Photos</h2>
              <div className="bg-slate-700/30 rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  Photos for this event will appear here once uploaded.
                </p>
                <p className="text-gray-600 text-sm mt-2">Coming soon in the next update!</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
