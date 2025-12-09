import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <div className="min-h-screen bg-(--muted) text-(--text-primary)">
      <header className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-(--text-muted)">RunCam</p>
          <h1 className="text-4xl md:text-5xl font-semibold mt-3">
            Find your race photos instantly
          </h1>
          <p className="mt-3 text-lg text-(--text-muted) max-w-2xl">
            Upload selfies, discover your shots, and connect with creators. Built for runners,
            creators, and admins to keep events organized.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link to="/login">
              <Button className="bg-(--accent) text-(--surface) hover:bg-(--accent-strong)">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/find-me">
              <Button variant="secondary">Try Find Me</Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 min-w-60 flex justify-center">
          <div className="w-full max-w-md rounded-2xl bg-(--surface) shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 text-(--accent-strong) font-semibold">
              <Camera className="h-5 w-5" />
              Live event coverage
            </div>
            <div className="mt-4 rounded-xl bg-linear-to-br from-orange-100 to-white p-4 text-(--text-muted) leading-relaxed">
              Register your face, upload event albums, and let runners claim their photos securely.
              Built with TanStack Start, Better Auth, and Drizzle.
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
