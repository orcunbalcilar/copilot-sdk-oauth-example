"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "./sign-out-button";

function getInitials(name?: string | null): string {
  if (!name?.trim()) return "U";
  return name
    .trim()
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SidebarFooterContent(props: {
  readonly user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}) {
  const pathname = usePathname();

  return (
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
          <ThemeToggle className="w-8 h-8 px-0" />
        </div>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SignOutButton />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
