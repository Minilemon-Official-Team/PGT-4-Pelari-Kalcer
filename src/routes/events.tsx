import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/events")({
  component: RouteComponent,
});

export function RouteComponent() {
  return (
    <div className="p-8 text-gray-800 bg-gray-200 h-screen">
      <h1>THIS IS EVENTS PAGE</h1>
    </div>
  );
}
