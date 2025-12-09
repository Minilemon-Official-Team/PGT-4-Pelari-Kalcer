import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Calendar, Grid, LogOut, Menu, Search, Settings, X } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

type DashboardLayoutProps = {
  children: React.ReactNode;
  onLogout?: () => void;
};

export function DashboardLayout({ children, onLogout }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Dashboard", to: "/dashboard", icon: Grid },
      { label: "Events", to: "/events", icon: Calendar },
      { label: "Find Me", to: "/find-me", icon: Search },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
    [],
  );

  const handleLogout =
    onLogout ??
    (async () => {
      await signOut();
      await navigate({ to: "/login" });
    });

  return (
    <div className="min-h-screen bg-(--muted) text-(--text-primary)">
      <div className="md:hidden sticky top-0 z-30 bg-(--surface) border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-semibold">RunCam</div>
          <Button
            aria-label="Toggle navigation menu"
            className="px-3 py-2 bg-(--accent) text-(--surface) hover:bg-(--accent-strong) border border-(--accent) shadow-sm"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {open && (
          <div className="bg-(--surface) border-t border-slate-200 shadow-lg">
            <nav className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  item={item}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />
              ))}
              <LogoutRow onLogout={handleLogout} />
            </nav>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 px-4 md:px-6 py-8">
        <aside className="hidden md:flex flex-col rounded-2xl bg-(--surface) border border-slate-200 shadow-sm p-4 sticky top-6 h-[calc(100vh-96px)]">
          <div className="text-lg font-semibold mb-4">RunCam</div>
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <NavLink key={item.to} item={item} pathname={pathname} />
            ))}
          </nav>
          <LogoutRow onLogout={handleLogout} />
        </aside>

        <main className="min-h-[70vh]">
          <div className="rounded-2xl bg-(--surface) border border-slate-200 shadow-sm p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = pathname === item.to;
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={`
				flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm font-medium
				${active ? "bg-(--accent)/10 text-(--text-primary) border border-(--accent)/40" : "text-(--text-muted) hover:bg-slate-100"}
			`}
      onClick={onNavigate}
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  );
}

function LogoutRow({ onLogout }: { onLogout?: () => void }) {
  return (
    <Button
      variant="secondary"
      className="w-full justify-start gap-2 bg-slate-100 text-(--text-primary) hover:bg-slate-200"
      onClick={onLogout}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
