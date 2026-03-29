"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useProject } from "@/lib/project-context"
import { Check, ChevronsUpDown, FolderKanban, Loader2 } from "lucide-react"

export function ProjectSelector() {
  const { projects, selectedProject, selectProject, isLoading } = useProject()

  if (isLoading) {
    return (
      <div className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span className="truncate">Loading projects…</span>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground">
        <FolderKanban className="size-4" />
        <span className="truncate">No projects yet</span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors cursor-pointer"
      >
        <FolderKanban className="size-4 text-primary shrink-0" />
        <span className="truncate font-medium flex-1 text-left">
          {selectedProject?.name ?? "Select project"}
        </span>
        <ChevronsUpDown className="size-3.5 opacity-50 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" className="w-56">
        {projects.map((p) => (
          <DropdownMenuItem
            key={p.name}
            onClick={() => selectProject(p)}
            className="flex items-center gap-2"
          >
            <FolderKanban className="size-3.5 text-muted-foreground" />
            <span className="truncate">{p.name}</span>
            {selectedProject?.name === p.name && (
              <Check className="ml-auto size-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
