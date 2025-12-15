import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Eye, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { getEventById } from "@/features/events/server";
import { getAuthSession } from "@/lib/auth-actions";

export const Route = createFileRoute("/events/$eventId")({
  component: EventDetailPage,
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session?.user) {
      throw redirect({ to: "/login" });
    }
    return { session };
  },
  loader: async ({ params }) => {
    return await getEventById({ data: params.eventId });
  },
  errorComponent: EventNotFound,
});

function EventNotFound() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/events">
            <Button variant="default">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

function EventDetailPage() {
  const { session } = Route.useRouteContext();
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
    <DashboardLayout session={session}>
      <div className="space-y-6">
        {/* Back Button */}
        <div>
          <Link
            to="/events"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </div>

        {/* Event Banner */}
        <div className="relative">
          {event.image && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border">
              <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Event Details Card */}
          <div
            className={`bg-card rounded-xl p-6 border border-slate-200 mx-4 md:mx-8 ${event.image ? "-mt-20 relative z-10" : ""}`}
          >
            {/* Title */}
            <h1 className="text-3xl font-bold text-foreground mb-6">{event.name}</h1>

            {/* Meta info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium text-foreground">
                    {formattedDate}
                    {formattedTime && (
                      <span className="text-muted-foreground"> • {formattedTime}</span>
                    )}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{event.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Visibility</p>
                  <p className="font-medium text-foreground capitalize">{event.visibility}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">About this Event</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Photos section placeholder */}
            <div className="border-t pt-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Event Photos</h2>
              <div className="bg-muted rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  Photos for this event will appear here once uploaded.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Coming soon in the next update!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
