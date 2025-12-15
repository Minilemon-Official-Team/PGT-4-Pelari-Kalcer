import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Calendar, ImageIcon, MapPin, Save, Type } from "lucide-react";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEvent } from "@/features/events/server";
import { getAuthSession } from "@/lib/auth-actions";

export const Route = createFileRoute("/admin/events/new")({
  component: NewEventPage,
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session?.user || session.user.role !== "admin") {
      throw redirect({ to: "/login", search: { redirect: "/admin/events/new" } });
    }
    return { user: session.user, session };
  },
});

function NewEventPage() {
  const { session } = Route.useRouteContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    image: "",
    startsAt: "",
    visibility: "public" as "public" | "unlisted",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createEvent({
        data: {
          name: formData.name,
          description: formData.description || null,
          location: formData.location || null,
          image: formData.image || null,
          startsAt: formData.startsAt ? new Date(formData.startsAt) : null,
          visibility: formData.visibility,
        },
      });

      // Redirect to the created event
      router.navigate({ to: "/events/$eventId", params: { eventId: result.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <Link
              to="/events"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Link>
            <h1 className="text-2xl font-semibold text-foreground">Create New Event</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Fill in the details below to create a new event.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              <Type className="w-4 h-4" />
              Event Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Bali Marathon 2025"
              required
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">{formData.name.length}/160 characters</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event..."
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/2000 characters
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Bali, Indonesia"
              maxLength={500}
            />
          </div>

          {/* Banner Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image">
              <ImageIcon className="w-4 h-4" />
              Banner Image URL
            </Label>
            <Input
              id="image"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
            />
            <p className="text-xs text-muted-foreground">
              Paste an image URL (e.g., from Unsplash). Photo upload coming soon!
            </p>
            {formData.image && (
              <div className="mt-2 rounded-lg overflow-hidden border">
                <img
                  src={formData.image}
                  alt="Banner preview"
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <Label htmlFor="startsAt">
              <Calendar className="w-4 h-4" />
              Event Date & Time
            </Label>
            <Input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              value={formData.startsAt}
              onChange={handleChange}
            />
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="public">Public - Visible to everyone</option>
              <option value="unlisted">Unlisted - Only accessible via direct link</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting || !formData.name} className="flex-1">
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Event
                </>
              )}
            </Button>
            <Link to="/events">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
