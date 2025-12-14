import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createEvent } from "@/features/events/server";
import { getAuthSession } from "@/lib/auth-actions";
import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Calendar, ImageIcon, MapPin, Save, Type } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/events/new")({
  component: NewEventPage,
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session?.user || session.user.role !== "admin") {
      throw redirect({ to: "/login", search: { redirect: "/admin/events/new" } });
    }
    return { user: session.user };
  },
});

function NewEventPage() {
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
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <section className="relative py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/events"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Create New{" "}
            <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Event
            </span>
          </h1>
          <p className="text-gray-400">Fill in the details below to create a new event.</p>
        </div>
      </section>

      {/* Form */}
      <section className="px-6 pb-16">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
                {error}
              </div>
            )}

            {/* Event Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                <Type className="w-4 h-4 inline mr-2 text-cyan-500" />
                Event Name <span className="text-red-400">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Bali Marathon 2025"
                required
                maxLength={160}
              />
              <p className="text-xs text-gray-500">{formData.name.length}/160 characters</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event..."
                rows={4}
                maxLength={2000}
                className="flex w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white shadow-sm transition focus:border-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 resize-none"
              />
              <p className="text-xs text-gray-500">{formData.description.length}/2000 characters</p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-300">
                <MapPin className="w-4 h-4 inline mr-2 text-cyan-500" />
                Location
              </label>
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
              <label htmlFor="image" className="block text-sm font-medium text-gray-300">
                <ImageIcon className="w-4 h-4 inline mr-2 text-cyan-500" />
                Banner Image URL
              </label>
              <Input
                id="image"
                name="image"
                type="url"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
              />
              <p className="text-xs text-gray-500">
                Paste an image URL (e.g., from Unsplash). Photo upload coming soon!
              </p>
              {formData.image && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-700">
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
              <label htmlFor="startsAt" className="block text-sm font-medium text-gray-300">
                <Calendar className="w-4 h-4 inline mr-2 text-cyan-500" />
                Event Date & Time
              </label>
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
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-300">
                Visibility
              </label>
              <select
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white shadow-sm transition focus:border-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
              >
                <option value="public">Public - Visible to everyone</option>
                <option value="unlisted">Unlisted - Only accessible via direct link</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name}
                className="flex-1"
              >
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
      </section>
    </div>
  );
}
