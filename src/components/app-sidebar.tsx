import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MessageSquareText,
  Upload,
  BookOpenText,
  Users,
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  Settings,
  Hash,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useCurrentPersona } from "@/lib/personas";
import { canAccess, type RouteKey } from "@/lib/permissions";

type Item = { title: string; url: RouteKey; icon: typeof Hash };

const groups: { label: string; items: Item[] }[] = [
  {
    label: "Workspace",
    items: [
      { title: "Channels", url: "/workspace", icon: Hash },
      { title: "Executive Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Ask SIX Sense", url: "/ask", icon: MessageSquareText },
      { title: "Knowledge Capture", url: "/capture", icon: Upload },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { title: "Knowledge Library", url: "/knowledge", icon: BookOpenText },
      { title: "Digital Twins", url: "/twin", icon: Users },
      { title: "Onboarding Center", url: "/onboarding", icon: GraduationCap },
    ],
  },
  {
    label: "Governance",
    items: [
      { title: "Audit Center", url: "/audit", icon: ShieldCheck },
      { title: "Continuity Risk", url: "/risk", icon: AlertTriangle },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const persona = useCurrentPersona();
  const isActive = (path: string) =>
    path === "/dashboard" ? currentPath.startsWith("/dashboard") : currentPath.startsWith(path);

  const visibleGroups = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => (persona ? canAccess(i.url, persona.role) : true)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-3">
          <div className="size-8 rounded-lg bg-gradient-hero grid place-items-center shadow-elevated">
            <span className="text-primary-foreground font-bold text-sm tracking-tight">S6</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">SIX Sense</span>
              <span className="text-[11px] text-muted-foreground">Knowledge Continuity</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

