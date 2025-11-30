import { createFileRoute } from "@tanstack/react-router";
// import { Route as RouteIcon, Server, Shield, Sparkles, Waves, Zap } from "lucide-react";
import { DashboardLayout } from "./dashboard.layout";

export const Route = createFileRoute("/")({ component: App });

export function App() {
  return (
    <DashboardLayout/>
  )
}
