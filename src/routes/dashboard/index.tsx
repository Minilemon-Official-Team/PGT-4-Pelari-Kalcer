import { createFileRoute, redirect } from "@tanstack/react-router";
import { Camera, ChevronDown, EyeOff, Filter, Search, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { getAuthSession } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

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

function DashboardPage() {
  const { session } = Route.useRouteContext();
  const [hasRunMatch, setHasRunMatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [accuracy, setAccuracy] = useState([60]);

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    setIsPopoverOpen(false);
  };

  const results = useMemo(
    () => [
      {
        id: "ph-1",
        event: "Jakarta Night Run",
        similarity: 0.87,
        capturedAt: "2025-11-28 21:14",
        photographer: "Anya Lens",
        contact: "wa.me/628123456789",
        thumb:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "ph-2",
        event: "Jakarta Night Run",
        similarity: 0.82,
        capturedAt: "2025-11-28 21:09",
        photographer: "Lens Lab",
        contact: "lenslab@example.com",
        thumb:
          "https://images.unsplash.com/photo-1437915160021-fd77193fcf33?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "ph-3",
        event: "Monas 10K",
        similarity: 0.78,
        capturedAt: "2025-11-10 07:32",
        photographer: "RunShot",
        contact: "runshot@example.com",
        thumb:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
      },
    ],
    [],
  );

  const handleMatch = async () => {
    setLoading(true);
    // placeholder for server call to match user_embedding against photo_embedding
    setTimeout(() => {
      setHasRunMatch(true);
      setLoading(false);
    }, 600);
  };
  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Find Me</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFiltersOpen((v) => !v)}>
              <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>
            <Button onClick={handleMatch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" /> {loading ? "Searching..." : "Start Search"}
            </Button>
          </div>
        </div>

        {filtersOpen && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="event-filter">Event</Label>
                <Input id="event-filter" placeholder="All events" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="date-filter">Date</Label>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date-filter"
                      className={cn(
                        "w-full justify-between font-normal",
                        !date && "text-muted-foreground",
                      )}
                    >
                      {date ? date.toLocaleDateString("en-GB") : "Select date"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto rounded-xl border border-slate-200 bg-white p-0 shadow-sm"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      captionLayout="dropdown"
                      onSelect={handleDateSelect}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label>Accuracy threshold</Label>
                  <span className="text-sm text-muted-foreground">{accuracy}%</span>
                </div>
                <Slider
                  value={accuracy}
                  onValueChange={setAccuracy}
                  min={40}
                  max={95}
                  step={5}
                  className="w-full py-4"
                />
                <p className="text-xs text-muted-foreground">Higher = stricter match</p>
              </div>
            </div>
          </div>
        )}

        {hasRunMatch ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((photo) => (
              <div key={photo.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="aspect-video w-full overflow-hidden rounded-t-xl">
                  <img src={photo.thumb} alt={photo.event} className="h-full w-full object-cover" />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{photo.event}</span>
                    <span className="font-semibold text-primary">
                      {(photo.similarity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{photo.capturedAt}</p>
                  <p className="text-sm text-muted-foreground">By {photo.photographer}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4" /> Contact: {photo.contact}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="secondary" className="flex-1" size="sm">
                      Claim
                    </Button>
                    <Button variant="outline" className="flex-1" size="sm">
                      <EyeOff className="h-4 w-4 mr-1" /> Hide
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-muted-foreground">
            <div className="flex items-center gap-3 text-foreground">
              <Camera className="h-5 w-5 text-primary" />
              No matches found yet
            </div>
            <p className="mt-3">Tap “Start Search” to scan for your photos across all events.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
