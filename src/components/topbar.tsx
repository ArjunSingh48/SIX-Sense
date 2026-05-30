import { Search, Bell, ChevronDown, LogOut, RefreshCw } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABEL, setCurrentPersona, useCurrentPersona } from "@/lib/personas";

export function Topbar() {
  const persona = useCurrentPersona();
  const navigate = useNavigate();

  const name = persona?.name ?? "Guest";
  const roleLabel = persona ? ROLE_LABEL[persona.role] : "Guest";
  const initials = persona?.initials ?? "G";

  const switchPersona = () => {
    setCurrentPersona(null);
    navigate({ to: "/" });
  };

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
          {roleLabel}
        </Badge>
        <button className="relative size-9 grid place-items-center rounded-md hover:bg-accent transition-colors">
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 border-l h-8 hover:opacity-80 transition-opacity">
              <Avatar className="size-7">
                <AvatarFallback className={`text-xs ${persona?.avatarColor ?? "bg-gradient-hero"} text-white`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col leading-tight pr-1 text-left">
                <span className="text-xs font-medium">{name}</span>
                <span className="text-[10px] text-muted-foreground">SIX Group</span>
              </div>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span>{name}</span>
              <span className="text-xs font-normal text-muted-foreground">{persona?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={switchPersona}>
              <RefreshCw className="size-4 mr-2" />
              Switch persona
            </DropdownMenuItem>
            <DropdownMenuItem onClick={switchPersona}>
              <LogOut className="size-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
