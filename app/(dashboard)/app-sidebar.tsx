"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Clock,
  Code2,
  FolderKanban,
  MessageSquare,
  Moon,
  Settings,
  Sparkles,
  Sun,
  TestTube2,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "./sign-out-button";

const navItems = [
  { title: "AI Chat", href: "/chat", icon: MessageSquare },
  { title: "Sessions", href: "/sessions", icon: Sparkles },
  { title: "Test Cases", href: "/test-cases", icon: TestTube2 },
  { title: "Schedules", href: "/schedules", icon: Clock },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Skill", href: "/skill", icon: Wand2 },
  { title: "Editor", href: "/editor-test", icon: Code2 },
];

function getInitials(name?: string | null): string {
  if (!name?.trim()) return "U";
  return name.trim()
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AppSidebar(props: {
  readonly user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar className="bg-sidebar/80 backdrop-blur-xl">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/chat" className="flex items-center gap-2 group">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">RestFlowAI</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 uppercase tracking-wider text-[11px]">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    render={<Link href={item.href} />}
                    className="transition-all duration-200"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-1.5">
              <Avatar className="size-8 ring-1 ring-border/50">
                <AvatarImage
                  src={props.user.image ?? undefined}
                  alt={props.user.name ?? "User"}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(props.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium">
                  {props.user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {props.user.email}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1">
              <SidebarMenuButton
                render={<Link href="/settings" />}
                isActive={pathname.startsWith("/settings")}
                className="flex-1"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </SidebarMenuButton>
              <Toggle
                variant="outline"
                size="sm"
                className="w-8 h-8 px-0"
                pressed={theme === "dark"}
                onPressedChange={(pressed) => setTheme(pressed ? "dark" : "light")}
                aria-label="Toggle dark mode"
              >
                <Moon className="hidden dark:block h-4 w-4" />
                <Sun className="dark:hidden h-4 w-4" />
              </Toggle>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SignOutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
