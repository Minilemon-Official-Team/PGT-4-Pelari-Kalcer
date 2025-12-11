import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <div className="min-h-screen bg-muted text-foreground">
      <PublicNav />
      <header className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold mt-3">Find your race photos fast</h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Upload a selfie, see your shots, and keep events tidy for runners and creators.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link to="/dashboard">
              <Button>
                Try Find Me
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 min-w-60 flex justify-center">
          <div className="w-full max-w-md rounded-2xl bg-background shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 font-semibold">
              <Camera className="h-5 w-5" />
              Live event coverage
            </div>
            <div className="mt-4 rounded-xl bg-linear-to-br from-primary/30 to-background p-4 leading-relaxed">
              Register your face, link albums, and let runners claim photos securely. Powered by
              TanStack Start, Better Auth, and Drizzle.
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
