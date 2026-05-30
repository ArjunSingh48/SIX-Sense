import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: () => (
    <div className="min-h-screen w-full bg-background">
      <Outlet />
    </div>
  ),
});
