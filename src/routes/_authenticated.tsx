import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getCurrentPersona } from "@/lib/personas";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getCurrentPersona()) {
      throw redirect({ to: "/" });
    }
  },
  component: () => (
    <div className="min-h-screen w-full bg-background">
      <Outlet />
    </div>
  ),
});
