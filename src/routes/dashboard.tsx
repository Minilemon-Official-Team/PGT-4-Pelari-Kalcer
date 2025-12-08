import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

export function RouteComponent() {
  return (
    <div className="h-screen bg-gray-200 p-10  w-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Welcome Back User ! 👋</h1>
        <p className="text-gray-500">Here’s a quick overview of your dashboard.</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        {/* Card 1 */}
        <div className="p-6 bg-white shadow-md rounded-xl border hover:shadow-lg transition">
          <h3 className="text-xl font-semibold">Events</h3>
          <p className="text-gray-500 mt-2">View and manage upcoming events.</p>
        </div>

        {/* Card 2 */}
        <div className="p-6 bg-white shadow-md rounded-xl border hover:shadow-lg transition">
          <h3 className="text-xl font-semibold">My Account</h3>
          <p className="text-gray-500 mt-2">Check your profile & account settings.</p>
        </div>

        {/* Card 3 */}
        <div className="p-6 bg-white shadow-md rounded-xl border hover:shadow-lg transition">
          <h3 className="text-xl font-semibold">Find Me</h3>
          <p className="text-gray-500 mt-2">Discover your connected features.</p>
        </div>

        {/* Card 4 */}
        <div className="p-6 bg-white shadow-md rounded-xl border hover:shadow-lg transition">
          <h3 className="text-xl font-semibold">Settings</h3>
          <p className="text-gray-500 mt-2">Customize app preferences.</p>
        </div>
      </div>
    </div>
  );
}
