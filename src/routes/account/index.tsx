import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Image as ImageIcon, Upload } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth-actions";

export const Route = createFileRoute("/account/")({
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session?.user) {
      throw redirect({ to: "/login", search: { redirect: "/account" } });
    }
    return { session };
  },
  component: AccountPage,
});

const mockGallery = [
  {
    id: "upl-1",
    title: "Night Run Batch",
    event: "Jakarta Night Run",
    status: "Processing",
    uploadedAt: "2025-11-28",
    thumb:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "upl-2",
    title: "Monas 10K",
    event: "Monas 10K",
    status: "Ready",
    uploadedAt: "2025-11-10",
    thumb:
      "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "upl-3",
    title: "Sprint Finals",
    event: "BSD Sprint Finals",
    status: "Processing",
    uploadedAt: "2025-11-02",
    thumb:
      "https://images.unsplash.com/photo-1460407906190-789fb04c163e?auto=format&fit=crop&w=600&q=80",
  },
];

function AccountPage() {
  const { session } = Route.useRouteContext();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "member";
  const isCreatorOrAdmin = role === "creator" || role === "admin";
  const roleCta = (() => {
    if (role === "creator") {
      return {
        label: "Creator badge active",
        variant: "outline" as const,
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700",
      };
    }
    if (role === "admin") {
      return {
        label: "Review requests",
        variant: "outline" as const,
        className:
          "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:text-primary",
      };
    }
    return { label: "Creator verification", variant: "default" as const };
  })();

  return (
    <DashboardLayout session={session}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-foreground">My Account</h1>
          <div className="flex gap-2">
            <Link to="/verification">
              <Button variant={roleCta.variant} className={roleCta.className}>
                {roleCta.label}
              </Button>
            </Link>
            {isCreatorOrAdmin && (
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Upload photos</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Photo management</p>
            <p className="text-base font-semibold">Your uploaded batches</p>
            <p className="text-sm text-muted-foreground">
              Scroll to explore all albums. Large batches load as you browse.
            </p>
          </div>
          {isCreatorOrAdmin ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockGallery.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 shadow-sm overflow-hidden"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img src={item.thumb} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{item.title}</span>
                      <span className="text-xs rounded-full border border-slate-200 bg-white px-2 py-1 text-muted-foreground">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{item.event}</p>
                    <p className="text-muted-foreground">Uploaded {item.uploadedAt}</p>
                    <div className="flex gap-2 pt-2">
                      <Button variant="secondary" size="sm" className="flex-1">
                        Manage
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <ImageIcon className="h-4 w-4 mr-1" /> Gallery
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-muted-foreground">
              <p className="text-sm font-medium text-foreground">No uploads yet</p>
              <p className="text-sm">
                Verify as a creator to upload albums and see your photo batches here.
              </p>
              <div className="pt-3">
                <Link to="/verification" className="text-primary font-semibold">
                  Request verification →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
