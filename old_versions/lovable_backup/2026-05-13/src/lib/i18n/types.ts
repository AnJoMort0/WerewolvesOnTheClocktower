import type { RoleId } from "@/lib/roles";

export type Language = "pt" | "fr";

export const SUPPORTED_LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export interface ScriptLine {
  text: string;
  requires?: RoleId[];
  conditionKey?: string;
}

export interface Translation {
  roleLabels: Record<RoleId, string>;
  scripts: {
    firstNight: ScriptLine[];
    secondNight: ScriptLine[];
    normalNight: ScriptLine[];
  };
  ui: Record<string, string>;
}
