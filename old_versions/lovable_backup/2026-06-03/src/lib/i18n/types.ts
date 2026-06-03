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

/** All status effect IDs known to the app. */
export type EffectKey =
  | "soldado"
  | "vote_against"
  | "vote_double"
  | "inocentado"
  | "hospede"
  | "immunity_full"
  | "profecia"
  | "acusado"
  | "werewolf_turned"
  | "enemy"
  | "immunity_onetime"
  | "namorado"
  | "immunity_cupid"
  | "evil_being"
  | "vote_revoked"
  | "adoptive_dad"
  | "incendiado"
  | "immunity_werewolf"
  | "tetanus"
  | "webbed"
  | "caught"
  | "spied_on";

/** Static translatable UI strings. */
export interface UIStrings {
  // App / lobby
  appTitle: string;
  appTagline: string;
  byline: string; // "por AnJoMorto e L_PT_1463"
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
  scriptOfNight: string;
  endNight: string;
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
  diedTonightSingular: string; // "morreu esta noite."
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
  revealVidenteTitle: string;
  revealVidenteSubtitle: string;
  revealManual: string;
  unknown: string;
  execution: string;
  // GM screen
  gameMaster: string;
  playersInRoom: string;       // " jogador(es) na sala"
  playersHeader: string;       // "Jogadores"
  rolesAssignmentHeader: string;
  gameInProgress: string;
  gameInProgressDesc: string;
  confirmAndAssign: string;
  sendRolesToPlayers: string;
  confirmChanges: string;
  advancedMode: string;
  devTestPlayers: string;
  waitingForPlayers: string;
  devTestPlayersAdded: string;
  rulebook: string;
  spiderEyeReveal: string;
  spyEyeReveal: string;
  amanteCheckboxLabel: string;
  shareCodeOrAdd: string;
  allSeated: string;
  showQR: string;
  close: string;
  // Join
  roomLabel: string;
  yourName: string;
  enter: string;
  roomNotFound: string;
  gameAlreadyStarted: string;
  addPlayerPlaceholder: string;
  // Popover actions
  actionPoison: string;
  actionKill: string;
  actionExecute: string;
  actionIllusion: string;
  actionPermaDeath: string;
  actionResurrect: string;
  removePrefix: string;       // "Remover " / "Retirer "
  removePoison: string;
  removeIllusion: string;
  // Status effect labels
  effectLabels: Record<EffectKey, string>;
}

export interface ScriptDynamicStrings {
  bearGrowl: string;
  bearSilent: string;
  bearConfused: string;
  crowReveal: string;
  crowConfused: string;
  rabbitHeard: string;
  rabbitNothing: string;
  rabbitConfused: string;
  werewolvesAsleep: string;
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
