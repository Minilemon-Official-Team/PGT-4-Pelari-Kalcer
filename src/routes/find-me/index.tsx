import { createFileRoute, redirect } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth-actions";

export const Route = createFileRoute("/find-me/")({
  beforeLoad: async () => {
    const session = await getAuthSession();
    if (!session?.user) {
      throw redirect({ to: "/login", search: { redirect: "/find-me" } });
    }
    return { session };
  },
  component: FindMePage,
});

function FindMePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-(--text-muted)">Face search</p>
          <h1 className="text-2xl font-semibold">Find your photos</h1>
          <p className="text-(--text-muted)">
            Upload or snap a selfie to start matching against event albums.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-5 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
              <Search className="h-4 w-4 text-(--accent-strong)" />
              <input
                type="text"
                placeholder="Paste a selfie URL or describe the outfit you wore..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <Button className="bg-(--accent) text-(--surface) hover:bg-(--accent-strong)">
              Search
            </Button>
          </div>
          <p className="text-xs text-(--text-muted) mt-2">
            For best results, use a clear selfie with good lighting.
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-(--text-muted)">
          Results will appear here once matching is wired to the backend. We’ll show the top photos
          with similarity scores.
        </div>
      </div>
    </DashboardLayout>
  );
}
