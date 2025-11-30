import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  CreditCard,
  User,
  Search,
  Settings,
  GoalIcon,
  LogOutIcon
} from "lucide-react";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const activePath = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <>
      {/* Hamburger Button (mobile only) */}
      <button
        className="md:hidden p-3 text-xl m-2"
        onClick={() => setOpen(true)}
      >
        ☰
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer Menu */}
      <aside
        className={`
        fixed top-0 left-0 
        h-full w-1/3 
        bg-gradient-to-b from-blue-900 to-blue-400
        z-50
        transform 
        transition-transform 
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <button
          className="text-white mb-4 text-xl m-5"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-white px-3 py-4 text-3xl font-semibold mb-6">
          Dashboard
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {/* Home */}
          <Link
            to="/"
            className={`
            text-white flex items-center gap-3 px-3 py-2 rounded-md text-xl transition
            ${activePath === "/" ? "bg-black/20" : "hover:bg-white/10"}
          `}
          >
            <Home size={18} />
            Home
          </Link>

          {/* Transaction */}
          <Link
            to="/transaction"
            className={`
            text-white flex items-center gap-3 px-3 py-2 rounded-md text-xl mt-5 transition
            ${
              activePath === "/transaction"
                ? "bg-black/20"
                : "hover:bg-white/10"
            }
          `}
          >
            <GoalIcon size={18} />
            Events
          </Link>

          {/* My Account */}
          <Link
            to="/myaccount"
            className={`
            text-white flex items-center gap-3 px-3 py-2 rounded-md text-xl mt-5 transition
            ${activePath === "/myaccount" ? "bg-black/20" : "hover:bg-white/10"}
          `}
          >
            <User size={18} />
            My Account
          </Link>

          {/* Find Me */}
          <Link
            to="/findme"
            className={`
            text-white flex items-center gap-3 px-3 py-2 rounded-md text-xl mt-5 transition
            ${activePath === "/findme" ? "bg-black/20" : "hover:bg-white/10"}
          `}
          >
            <Search size={18} />
            Find Me
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className={`
            text-white flex items-center gap-3 px-3 py-2 rounded-md text-xl mt-5 transition
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
            text-white
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
    </>
  );
}
