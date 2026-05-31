import type { Role } from "./personas";

export type RouteKey =
  | "/workspace"
  | "/ask"
  | "/capture"
  | "/onboarding"
  | "/knowledge"
  | "/twin"
  | "/audit"
  | "/risk"
  | "/dashboard"
  | "/settings";

const MATRIX: Record<RouteKey, Role[]> = {
  "/workspace": ["employee", "compliance_officer", "manager"],
  "/ask": ["employee", "compliance_officer", "manager"],
  "/capture": ["employee", "compliance_officer", "manager"],
  "/onboarding": ["employee", "compliance_officer", "manager"],
  "/knowledge": ["employee", "compliance_officer", "manager"],
  "/twin": ["employee", "compliance_officer", "manager"],
  "/audit": ["compliance_officer", "manager"],
  "/risk": ["compliance_officer", "manager"],
  "/dashboard": ["manager"],
  "/settings": ["employee", "compliance_officer", "manager"],
};

export function canAccess(route: RouteKey, role: Role): boolean {
  return MATRIX[route]?.includes(role) ?? false;
}

export const HOME_FOR_ROLE: Record<Role, RouteKey> = {
  employee: "/workspace",
  compliance_officer: "/workspace",
  manager: "/workspace",
};

export function allowedRoutes(role: Role): RouteKey[] {
  return (Object.keys(MATRIX) as RouteKey[]).filter((r) => canAccess(r, role));
}
