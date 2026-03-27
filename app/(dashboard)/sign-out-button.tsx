"use client";

import { signOut } from "next-auth/react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <SidebarMenuButton
      className="cursor-pointer"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut />
      <span>Sign Out</span>
    </SidebarMenuButton>
  );
}
