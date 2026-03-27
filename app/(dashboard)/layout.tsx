import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar user={session.user} />
        <SidebarInset className="flex-1 overflow-hidden">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
