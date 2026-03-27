"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Brain, Check, ChevronDown, Cpu } from "lucide-react";
import type { ProviderConfig } from "@/lib/chat-settings";

export function TriggerContent(props: {
  readonly currentModelName: string;
  readonly enableReasoning: boolean;
}) {
  return (
    <>
      <Cpu className="h-3.5 w-3.5" />
      <span className="hidden md:inline max-w-30 truncate">
        {props.currentModelName}
      </span>
      {props.enableReasoning && (
        <Brain className="h-3 w-3 text-purple-500" />
      )}
      <ChevronDown className="h-3 w-3 opacity-50" />
    </>
  );
}

export function ProviderSection(props: {
  readonly providers: ProviderConfig[];
  readonly selected: string;
  readonly onChange: (id: string) => void;
}) {
  if (props.providers.length <= 1) return null;
  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Provider
        </DropdownMenuLabel>
        {props.providers.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onClick={() => props.onChange(p.id)}
            className="flex items-center gap-2 py-1.5"
          >
            <span className="text-sm">{p.name}</span>
            {props.selected === p.id && (
              <Check className="h-3.5 w-3.5 ml-auto text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
    </>
  );
}

export function ModelSection(props: {
  readonly models: { id: string; name: string; supportsReasoning: boolean }[];
  readonly selected: string;
  readonly onChange: (id: string) => void;
}) {
  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
        Model
      </DropdownMenuLabel>
      {props.models.map((m) => (
        <DropdownMenuItem
          key={m.id}
          onClick={() => props.onChange(m.id)}
          className="flex items-center gap-2 py-1.5"
        >
          <span className="text-sm">{m.name}</span>
          {m.supportsReasoning && (
            <Badge variant="outline" className="text-[10px] px-1 h-4 ml-1">
              reasoning
            </Badge>
          )}
          {props.selected === m.id && (
            <Check className="h-3.5 w-3.5 ml-auto text-primary" />
          )}
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
  );
}

export function TemperatureControl(props: {
  readonly value: number;
  readonly onChange: (v: number) => void;
}) {
  return (
    <div className="px-2 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <Label className="text-xs text-muted-foreground">Temperature</Label>
        <span className="text-xs font-mono text-muted-foreground">
          {props.value.toFixed(1)}
        </span>
      </div>
      <Slider
        min={0}
        max={2}
        step={0.1}
        value={[props.value]}
        onValueChange={(v) =>
          props.onChange(Array.isArray(v) ? v[0] : v)
        }
        className="w-full"
      />
    </div>
  );
}

export function ReasoningToggle(props: {
  readonly enabled: boolean;
  readonly supported: boolean;
  readonly onChange: (v: boolean) => void;
}) {
  return (
    <div className="px-2 py-2 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-purple-500" />
          <Label className="text-xs cursor-pointer">Reasoning</Label>
        </div>
        <Switch
          checked={props.enabled}
          onCheckedChange={props.onChange}
        />
      </div>
      {!props.supported && (
        <p className="text-[10px] text-muted-foreground">
          Current provider doesn&apos;t support reasoning
        </p>
      )}
    </div>
  );
}
