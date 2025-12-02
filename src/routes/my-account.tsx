import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/my-account")({
  component: RouteComponent,
});

export function RouteComponent() {
  return (
    <div className="p-8 text-gray-800 bg-gray-200 h-screen  w-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-1">My Account</h1>
      <p className="text-gray-500 mb-8">
        Manage your personal profile information.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Profile Card */}
        <div className="bg-white border shadow-md rounded-xl p-6 flex flex-col items-center text-center">
          <img
            src="https://ui-avatars.com/api/?name=User&background=1d4ed8&color=fff&size=200"
            className="w-32 h-32 rounded-full shadow mb-4"
            alt="profile"
          />

          <h2 className="text-xl font-semibold">John Doe</h2>
          <p className="text-gray-500">johndoe@example.com</p>

          <span className="mt-3 px-4 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
            Member
          </span>

          <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            Edit Profile
          </button>
        </div>

        {/* Right Info Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info Card */}
          <div className="bg-white border shadow-md rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Account Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-sm">Full Name</p>
                <p className="font-semibold">John Doe</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Email Address</p>
                <p className="font-semibold">johndoe@example.com</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Phone Number</p>
                <p className="font-semibold">+62 812 3456 7890</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Member Since</p>
                <p className="font-semibold">January 2023</p>
              </div>
            </div>
          </div>

          {/* Update Form Display (no functionality, just UI) */}
          <div className="bg-white border shadow-md rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Update Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-600 text-sm">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full mt-1 p-2 border rounded-lg outline-blue-400"
                />
              </div>

              <div>
                <label className="text-gray-600 text-sm">Email Address</label>
                <input
                  type="email"
                  placeholder="johndoe@example.com"
                  className="w-full mt-1 p-2 border rounded-lg outline-blue-400"
                />
              </div>

              <div>
                <label className="text-gray-600 text-sm">Phone Number</label>
                <input
                  type="text"
                  placeholder="+62 812 3456 7890"
                  className="w-full mt-1 p-2 border rounded-lg outline-blue-400"
                />
              </div>

              <div>
                <label className="text-gray-600 text-sm">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full mt-1 p-2 border rounded-lg outline-blue-400"
                />
              </div>
            </div>

            <button className="mt-6 px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
