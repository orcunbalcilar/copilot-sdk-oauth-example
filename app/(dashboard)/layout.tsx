import { auth } from "@/auth"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProjectProvider } from "@/lib/project-context"
import { redirect } from "next/navigation"
import { AppSidebar } from "./app-sidebar"
import { SessionProvider } from "next-auth/react"

export default async function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/signin")
  }

  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <ProjectProvider>
          <div className="flex h-screen w-full">
            <AppSidebar user={session.user} />
            <SidebarInset className="flex-1 overflow-hidden">
              {children}
            </SidebarInset>
          </div>
        </ProjectProvider>
      </SidebarProvider>
    </SessionProvider>
  )
}
