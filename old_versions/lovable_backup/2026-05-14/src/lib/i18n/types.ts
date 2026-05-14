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

/** Static translatable UI strings (grouped by area for maintenance). */
export interface UIStrings {
  // App / lobby
  appTitle: string;
  appTagline: string;
  createRoom: string;
  orJoin: string;
  roomCode: string;
  language: string;
  loading: string;
  players: string;
  // Phases
  night: string;
  day: string;
  tribunal: string;
  nightFalls: string;
  scriptOfNight: string; // "Script da Noite"
  endNight: string;      // "Terminar Noite"
  nextNight: string;
  startTribunal: string;
  // Sections
  firstNight: string;
  secondNightStart: string;
  // Player view
  yourRole: string;
  keepSecret: string;
  showRole: string;
  hideRole: string;
  sessionEnded: string;
  sessionEndedDesc: string;
  backHome: string;
  waitingGame: string;
  gmAssigning: string;
  // Day/tribunal
  diedTonight: string;
  diedTonightPlural: string;
  votesNeeded: string;
  alivePlayers: string;
  dayTimerEnded: string;
  tribunalTimerEnded: string;
  timeUp: string;
  // Reveal modals
  revealLVTitle: string;
  revealLVSubtitle: string;
  revealMeninaTitle: string;
  revealMeninaSubtitle: string;
  revealFaroleiroTitle: string;
  revealFaroleiroSubtitle: string;
  revealManual: string;
  unknown: string;
  execution: string;
}

/** Dynamic narrator lines (bear/crow/rabbit/empregada variants and werewolves-asleep). */
export interface ScriptDynamicStrings {
  bearGrowl: string;          // "O {Urso} rosna."
  bearSilent: string;         // "O {Urso} não rosna."
  bearConfused: string;       // "O {Urso} está confuso."
  crowReveal: string;         // contains "{n}" placeholder
  crowConfused: string;
  rabbitHeard: string;
  rabbitNothing: string;      // wrap result with "~~..~~" to strikethrough
  rabbitConfused: string;
  werewolvesAsleep: string;   // strikethrough applied separately
}

export interface Translation {
  roleLabels: Record<RoleId, string>;
  scripts: {
    firstNight: ScriptLine[];
    secondNight: ScriptLine[];
    normalNight: ScriptLine[];
  };
  scriptDynamic: ScriptDynamicStrings;
  ui: UIStrings;
}
