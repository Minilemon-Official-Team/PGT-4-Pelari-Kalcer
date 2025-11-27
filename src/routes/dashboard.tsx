import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Dashboard (Belom jadi)</h1>
      </div>
    </div>
  );
}
