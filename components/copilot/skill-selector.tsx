"use client";

import { useCallback, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronDown, Zap } from "lucide-react";
import type { SkillConfig } from "@/lib/chat-settings";

export function SkillSelector(props: {
  readonly skills?: SkillConfig[];
  readonly onSkillsChange?: (skills: SkillConfig[]) => void;
  readonly disabled?: boolean;
}) {
  const [internal, setInternal] = useState<SkillConfig[]>([]);
  const skills = props.skills ?? internal;
  const setSkills = props.onSkillsChange ?? setInternal;
  const enabledCount = skills.filter((s) => s.enabled).length;

  const handleToggle = useCallback(
    (id: string, enabled: boolean) => {
      setSkills(skills.map((s) => (s.id === id ? { ...s, enabled } : s)));
    },
    [skills, setSkills],
  );

  if (skills.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors cursor-pointer" disabled={props.disabled}>
        <Zap className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Skills</span>
        {enabledCount > 0 && <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px]">{enabledCount}</Badge>}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm">Skills</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <SkillList skills={skills} onToggle={handleToggle} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SkillList(props: {
  readonly skills: SkillConfig[];
  readonly onToggle: (id: string, enabled: boolean) => void;
}) {
  return (
    <DropdownMenuGroup>
      <p className="px-2 py-1.5 text-xs text-muted-foreground">
        Skills provide specialized knowledge to the agent.
      </p>
      {props.skills.map((skill) => (
        <DropdownMenuItem key={skill.id} className="flex items-center gap-3 py-2.5" onSelect={(e) => e.preventDefault()}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{skill.name}</span>
              {skill.enabled && <Badge variant="outline" className="text-[10px] px-1 h-4 text-primary border-primary/30">Active</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{skill.description}</p>
          </div>
          <Switch checked={skill.enabled} onCheckedChange={(v) => props.onToggle(skill.id, v)} aria-label={`Toggle ${skill.name}`} />
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
  );
}
