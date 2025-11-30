import { MobileMenu } from "@/components/layout/mobile-menu";
import { Sidebar } from "@/components/layout/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/layout")({
  component: DashboardLayout,
});

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="w-1/8">
        <Sidebar />
      </div>
      <div className="fixed top-0 left-0">
        <MobileMenu />
      </div>
      <div className="w-7/8">
        <Outlet />
      </div>
    </div>
  );
}
