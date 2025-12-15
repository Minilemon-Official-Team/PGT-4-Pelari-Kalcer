import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Calendar, Grid, LogOut, Menu, Settings, User, X } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

type DashboardLayoutProps = {
  children: React.ReactNode;
  onLogout?: () => void;
  session?: { user?: { name?: string | null; email?: string | null; role?: string | null } };
};

export function DashboardLayout({
  children,
  onLogout,
  session: providedSession,
}: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Dashboard", to: "/dashboard", icon: Grid },
      { label: "Events", to: "/events", icon: Calendar },
      { label: "My Account", to: "/account", icon: User },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
    [],
  );

  const { data: liveSession } = useSession();
  const session = liveSession ?? providedSession;
  const displayName = session?.user?.name ?? session?.user?.email ?? "Account";
  const role = (session?.user as { role?: string } | undefined)?.role ?? "member";

  const handleLogout =
    onLogout ??
    (async () => {
      await signOut();
      await navigate({ to: "/" });
    });

  return (
    <div className="min-h-screen bg-muted text-foreground">
      <div className="md:hidden sticky top-0 z-30 bg-background border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="font-semibold">
            RunCam
          </Link>
          <Button
            aria-label="Toggle navigation menu"
            size="icon"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {open && (
          <div className="bg-background border-t border-slate-200 shadow-lg">
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
        <aside className="hidden md:flex flex-col rounded-2xl bg-background border border-slate-200 shadow-sm p-4 sticky top-6 h-[calc(100vh-96px)]">
          <Link to="/dashboard" className="text-lg font-semibold mb-4">
            RunCam
          </Link>
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <NavLink key={item.to} item={item} pathname={pathname} />
            ))}
          </nav>
          <LogoutRow onLogout={handleLogout} />
        </aside>

        <main className="min-h-[70vh] space-y-3">
          <div className="rounded-2xl bg-background border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-3 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Signed in as</span>
              <span className="font-medium text-foreground">{displayName}</span>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
              {role}
            </span>
          </div>

          <div className="rounded-2xl bg-background border border-slate-200 shadow-sm p-6">
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
				${active ? "bg-accent/10 text-foreground border border-accent/40" : "text-muted-foreground hover:bg-slate-100"}
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
    <Button variant="ghost" className="w-full justify-start gap-2" onClick={onLogout}>
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
