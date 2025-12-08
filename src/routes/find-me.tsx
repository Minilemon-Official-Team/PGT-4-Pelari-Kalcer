import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/find-me")({
  component: RouteComponent,
});

export function RouteComponent() {
  return (
    <div className="p-8 text-gray-800 bg-gray-200 h-screen  w-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-1">Find Me</h1>
      <p className="text-gray-500 mb-8">Search for users, locations, or any data you need.</p>

      {/* Search Box */}
      <div className="w-2/3 mb-10">
        <div className="flex items-center border rounded-lg shadow-sm bg-white overflow-hidden">
          <input
            type="text"
            placeholder="Type something to search..."
            className="flex-1 px-4 py-3 outline-none"
          />
          <button className="px-5 py-3 bg-blue-600 text-white hover:bg-blue-700 transition">
            Search
          </button>
        </div>
      </div>

      {/* Recent Searches */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-3">Recent Searches</h3>
        <div className="flex gap-3 flex-wrap">
          <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm cursor-pointer hover:bg-gray-300 transition">
            John Doe
          </span>
          <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm cursor-pointer hover:bg-gray-300 transition">
            Events
          </span>
          <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm cursor-pointer hover:bg-gray-300 transition">
            Location A12
          </span>
        </div>
      </div>

      {/* Results Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Search Results</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border rounded-xl shadow p-5 hover:shadow-lg transition">
            <h4 className="text-lg font-bold">John Doe</h4>
            <p className="text-gray-500 text-sm mt-1">User • Active</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              View Profile
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white border rounded-xl shadow p-5 hover:shadow-lg transition">
            <h4 className="text-lg font-bold">Main Office</h4>
            <p className="text-gray-500 text-sm mt-1">Location • Building A</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              View Map
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white border rounded-xl shadow p-5 hover:shadow-lg transition">
            <h4 className="text-lg font-bold">Event Meeting</h4>
            <p className="text-gray-500 text-sm mt-1">Schedule • 10:00 AM</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
