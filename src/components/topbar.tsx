import { Search, Bell, ChevronDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Topbar({ role = "Compliance Officer", user = "Elena Vogel" }: { role?: string; user?: string }) {
  return (
    <header className="h-14 border-b bg-card/80 backdrop-blur sticky top-0 z-30 flex items-center gap-3 px-4">
      <SidebarTrigger />
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search knowledge cards, SMEs, decisions…"
          className="pl-8 h-9 bg-background"
        />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Badge variant="secondary" className="hidden sm:inline-flex font-normal">
          {role}
        </Badge>
        <button className="relative size-9 grid place-items-center rounded-md hover:bg-accent transition-colors">
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l h-8">
          <Avatar className="size-7">
            <AvatarFallback className="text-xs bg-gradient-hero text-primary-foreground">
              {user.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col leading-tight pr-1">
            <span className="text-xs font-medium">{user}</span>
            <span className="text-[10px] text-muted-foreground">SIX Group</span>
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
