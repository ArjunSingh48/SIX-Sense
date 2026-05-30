import { redirect } from "@tanstack/react-router";
import { getCurrentPersona } from "@/lib/personas";
import { canAccess, HOME_FOR_ROLE, type RouteKey } from "@/lib/permissions";

export function requireRoute(route: RouteKey) {
  if (typeof window === "undefined") return;
  const persona = getCurrentPersona();
  if (!persona) throw redirect({ to: "/" });
  if (!canAccess(route, persona.role)) {
    throw redirect({ to: HOME_FOR_ROLE[persona.role] });
  }
}
