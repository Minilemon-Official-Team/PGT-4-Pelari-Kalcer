import { Link, useRouterState } from "@tanstack/react-router";
import { CreditCard, GoalIcon, Home, LogOutIcon, Search, Settings, User } from "lucide-react";

export function Sidebar() {
  const activePath = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <aside
      className="
        hidden md:flex flex-col
        w-1/8 h-screen
        fixed left-0 top-0
        bg-gradient-to-b from-blue-900 to-blue-400
        text-white
        p-4
      "
    >
      {/* Header */}
      <div className="px-3 py-4 text-3xl font-semibold mb-6">Dashboard</div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {/* Home */}
        <Link
          to="/dashboard"
          className={`
            flex items-center gap-3 px-3 py-2 rounded-md text-xl transition
            ${activePath === "/" ? "bg-black/20" : "hover:bg-white/10"}
          `}
        >
          <Home size={18} />
          Home
        </Link>

        {/* Transaction */}
        <Link
          to="/events"
          className={`
            flex items-center gap-3 px-3 py-2 rounded-md text-xl mt-5 transition
            ${activePath === "/events" ? "bg-black/20" : "hover:bg-white/10"}
          `}
        >
          <GoalIcon size={18} />
          Events
        </Link>

        {/* My Account */}
        <Link
          to="/my-account"
          className={`
            flex items-center gap-3 px-3 py-2 rounded-md text-xl mt-5 transition
            ${activePath === "/my-account" ? "bg-black/20" : "hover:bg-white/10"}
          `}
        >
          <User size={18} />
          My Account
        </Link>

        {/* Find Me */}
        <Link
          to="/find-me"
          className={`
            flex items-center gap-3 px-3 py-2 rounded-md text-xl mt-5 transition
            ${activePath === "/find-me" ? "bg-black/20" : "hover:bg-white/10"}
          `}
        >
          <Search size={18} />
          Find Me
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          className={`
            flex items-center gap-3 px-3 py-2 rounded-md text-xl mt-5 transition
            ${activePath === "/settings" ? "bg-black/20" : "hover:bg-white/10"}
          `}
        >
          <Settings size={18} />
          Settings
        </Link>
      </nav>
      {/* LOGOUT BUTTON - Fixed at the bottom */}
      <div className="fixed bottom-0 left-0 right-0">
        <button
          onClick={() => console.log("logout clicked")}
          className="
            flex items-center gap-3 px-3 py-2 w-full
            rounded-md text-xl
            hover:bg-white/10 transition
          "
        >
          <LogOutIcon size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
