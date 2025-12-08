import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

export function RouteComponent() {
  return (
    <div className="p-8 text-gray-800 bg-gray-200 h-screen w-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-1">Settings</h1>
      <p className="text-gray-500 mb-8">Manage your account preferences and system settings.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-screen">
        {/* Account Settings */}
        <div className="bg-white border rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>

          <div className="space-y-5">
            {/* Change Name */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Display Name</label>
              <input
                type="text"
                placeholder="Your name..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Change Email */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                placeholder="Your email..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Password Change */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <input
                type="password"
                placeholder="********"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
