"use client";

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
  Sparkles,
  TestTube2,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProjectSelector } from "@/components/project-selector";
import { SidebarFooterContent } from "./sidebar-footer";

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

export function AppSidebar(props: {
  readonly user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}) {
  const pathname = usePathname();

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
            Project
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <ProjectSelector />
          </SidebarGroupContent>
        </SidebarGroup>
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
        <SidebarFooterContent user={props.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
