import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  firstNightScript,
  secondNightScript,
  normalNightScript,
  parseScriptText,
  type ScriptLine,
} from "@/lib/nightScript";
import { ROLES, type RoleId } from "@/lib/roles";
import poisonedIcon from "@/assets/icons/poisoned.png";
import { toast } from "sonner";
import type { PlayerStatus } from "@/components/game/PlayerStatusPopover";

/** Evil roles for bear/crow mechanics */
const EVIL_ROLES: RoleId[] = ["e01", "e02", "s02", "a06", "m01", "m02", "m03", "m04", "m05"];
const WEREWOLF_ROLES: RoleId[] = ["e01", "m01", "m02", "m03", "s02"];

interface NightScriptProps {
  activeRoles: Set<RoleId>;
  permanentlyDead: Set<string>;
  poisonedPlayerId: string | null;
  illusionPlayerId: string | null;
  roleAssignments: Record<string, RoleId>;
  nightNumber: number;
  onEndNight: () => void;
  chamanCharges: number;
  onChamanChargeToggle: (index: number) => void;
  lastNightDeadPlayerIds: string[];
  players: Array<{ id: string; name: string; seat_position: number | null }>;
  onVidenteReveal?: () => void;
  playerStatuses?: Record<string, PlayerStatus>;
  foxDisabled: boolean;
  onFoxDisabledToggle: () => void;
  nightTargetedPlayerIds: Set<string>;
}

function isLineRelevant(line: ScriptLine, activeRoles: Set<RoleId>, permanentlyDeadRoles: Set<RoleId>): boolean {
  if (!line.requires) return true;
  return line.requires.some((r) => activeRoles.has(r) && !permanentlyDeadRoles.has(r));
}

function getLineDragAction(line: ScriptLine): "poison" | "kill" | "chaman" | "illusion" | null {
  if (!line.requires) return null;
  if (line.requires.length === 1 && line.requires[0] === ("e02" as RoleId)) return "poison";
  if (line.requires.length === 1 && line.requires[0] === ("e01" as RoleId)) return "kill";
  if (line.requires.length === 1 && line.requires[0] === ("e03" as RoleId)) return "chaman";
  if (line.requires.length === 1 && line.requires[0] === ("a06" as RoleId)) return "illusion";
  return null;
}

function ScriptLineDisplay({
  line,
  poisonedRoles,
  poisonedPlayerId,
  roleAssignments,
  chamanCharges,
  onChamanChargeToggle,
  isWerewolfLinePoisoned,
  lastNightDeadPlayerIds,
  onVidenteReveal,
  dynamicText,
  foxDisabled,
  onFoxDisabledToggle,
}: {
  line: ScriptLine;
  poisonedRoles: Set<RoleId>;
  poisonedPlayerId: string | null;
  roleAssignments: Record<string, RoleId>;
  chamanCharges: number;
  onChamanChargeToggle: (index: number) => void;
  isWerewolfLinePoisoned: boolean;
  lastNightDeadPlayerIds: string[];
  onVidenteReveal?: () => void;
  dynamicText?: string;
  foxDisabled?: boolean;
  onFoxDisabledToggle?: () => void;
}) {
  const rawDisplayText = dynamicText ?? line.text;
  const isStrikethrough = rawDisplayText.startsWith("~~") && rawDisplayText.endsWith("~~");
  const displayText = isStrikethrough ? rawDisplayText.slice(2, -2) : rawDisplayText;
  const { segments } = parseScriptText(displayText);
  const isPoisonedLine = line.requires?.some((r) => poisonedRoles.has(r));
  const dragAction = getLineDragAction(line);
  const isWerewolfLine = line.requires?.length === 1 && line.requires[0] === ("e01" as RoleId);
  const isChamanLine = line.requires?.length === 1 && line.requires[0] === ("e03" as RoleId);
  const isVidenteLine = line.requires?.length === 1 && line.requires[0] === ("e04" as RoleId);
  const isFoxLine = line.requires?.length === 1 && line.requires[0] === ("v04" as RoleId);

  const isChamanPoisoned = useMemo(() => {
    if (!poisonedPlayerId) return false;
    return roleAssignments[poisonedPlayerId] === "e03";
  }, [poisonedPlayerId, roleAssignments]);

  const isWerewolfPoisoned = useMemo(() => {
    if (!poisonedPlayerId) return false;
    const r = roleAssignments[poisonedPlayerId];
    return (["e01", "m01", "m02", "m03"] as RoleId[]).includes(r);
  }, [poisonedPlayerId, roleAssignments]);

  const handleNativeDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (dragAction) {
      if (dragAction === "chaman" && isChamanPoisoned) {
        e.preventDefault();
        toast.warning("O Chaman está envenenado e não pode agir!");
        return;
      }
      if (dragAction === "kill" && isWerewolfPoisoned) {
        e.preventDefault();
        toast.warning("Os Lobisomens estão envenenados e não podem agir!");
        return;
      }
      e.dataTransfer.setData("action", dragAction);
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleChamanCheck = (index: number) => {
    if (isChamanPoisoned) {
      toast.warning("O Chaman está envenenado e não pode agir!");
      return;
    }
    onChamanChargeToggle(index);
  };

  return (
    <div
      draggable={!!dragAction}
      onDragStart={handleNativeDragStart}
    >
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`py-2 px-3 rounded-lg text-sm font-body leading-relaxed ${
          isPoisonedLine
            ? "bg-green-900/30 border border-green-500/40 text-green-300"
            : "bg-card/50 border border-border/30"
        } ${dragAction ? "cursor-grab active:cursor-grabbing hover:border-primary/50" : ""}`}
      >
        {isWerewolfLine && isWerewolfLinePoisoned ? (
          <span className="line-through text-muted-foreground">Os Lobisomens não acordam.</span>
        ) : (
          <span className={isStrikethrough ? "line-through text-muted-foreground" : ""}>
            {segments.map((seg, i) =>
              seg.isRole ? (
                <span key={i} className={isPoisonedLine ? "font-bold text-green-400" : "font-bold text-blue-400"}>
                  {seg.text}
                </span>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </span>
        )}

        {/* Chaman power boxes */}
        {isChamanLine && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">Usos:</span>
            {[0, 1].map((idx) => (
              <Checkbox
                key={idx}
                checked={chamanCharges > idx}
                onCheckedChange={() => handleChamanCheck(idx)}
                className="h-5 w-5 border-primary data-[state=checked]:bg-primary"
              />
            ))}
            {isChamanPoisoned && (
              <img src={poisonedIcon} alt="envenenado" className="h-4 w-4 ml-1" />
            )}
          </div>
        )}

        {/* Fox checkbox */}
        {isFoxLine && onFoxDisabledToggle != null && (
          <div className="flex items-center gap-2 mt-2">
            <Checkbox
              checked={foxDisabled}
              onCheckedChange={() => onFoxDisabledToggle?.()}
              className="h-5 w-5 border-primary data-[state=checked]:bg-primary"
            />
            <span className="text-xs text-muted-foreground">Poder esgotado</span>
          </div>
        )}

        {/* Vidente eye icon */}
        {isVidenteLine && lastNightDeadPlayerIds.length > 0 && onVidenteReveal && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVidenteReveal();
            }}
            className="inline-flex items-center ml-2 p-1 rounded hover:bg-primary/20 transition-colors"
          >
            <Eye className="h-4 w-4 text-blue-400" />
          </button>
        )}
      </motion.div>
    </div>
  );
}

export const NightScript = ({
  activeRoles,
  permanentlyDead: _permanentlyDeadPlayerIds,
  poisonedPlayerId,
  illusionPlayerId,
  roleAssignments,
  nightNumber,
  onEndNight,
  chamanCharges,
  onChamanChargeToggle,
  lastNightDeadPlayerIds,
  players,
  onVidenteReveal,
  playerStatuses = {},
  foxDisabled,
  onFoxDisabledToggle,
  nightTargetedPlayerIds,
}: NightScriptProps) => {
  const permanentlyDeadRoles = useMemo(() => {
    const s = new Set<RoleId>();
    _permanentlyDeadPlayerIds.forEach((pid) => {
      const r = roleAssignments[pid];
      if (r) s.add(r);
    });
    return s;
  }, [_permanentlyDeadPlayerIds, roleAssignments]);

  const poisonedRoles = useMemo(() => {
    const s = new Set<RoleId>();
    if (poisonedPlayerId) {
      const r = roleAssignments[poisonedPlayerId];
      if (r) s.add(r);
    }
    return s;
  }, [poisonedPlayerId, roleAssignments]);

  const isWerewolfLinePoisoned = useMemo(() => {
    if (!poisonedPlayerId) return false;
    const r = roleAssignments[poisonedPlayerId];
    return WEREWOLF_ROLES.includes(r);
  }, [poisonedPlayerId, roleAssignments]);

  const shouldShowVidenteLine = lastNightDeadPlayerIds.length > 0;

  // Compute alive players (not permanently dead) for dynamic lines
  const alivePlayers = useMemo(() => {
    return players.filter((p) => !_permanentlyDeadPlayerIds.has(p.id));
  }, [players, _permanentlyDeadPlayerIds]);

  // Dynamic bear text
  const bearDynamicText = useMemo(() => {
    const bearPlayerId = Object.entries(roleAssignments).find(([, r]) => r === "v02")?.[0];
    if (!bearPlayerId) return undefined;
    const bearPlayer = players.find((p) => p.id === bearPlayerId);
    if (!bearPlayer || bearPlayer.seat_position === null) return undefined;

    const sorted = players
      .filter((p) => p.seat_position !== null)
      .sort((a, b) => a.seat_position! - b.seat_position!);
    const bearIndex = sorted.findIndex((p) => p.id === bearPlayerId);
    if (bearIndex === -1) return undefined;

    // Find closest alive neighbor in each direction (permanently dead skipped, red X counts as alive)
    const findNeighbor = (dir: 1 | -1) => {
      for (let i = 1; i < sorted.length; i++) {
        const idx = (bearIndex + dir * i + sorted.length) % sorted.length;
        const p = sorted[idx];
        if (!_permanentlyDeadPlayerIds.has(p.id)) return p;
      }
      return null;
    };

    const left = findNeighbor(-1);
    const right = findNeighbor(1);
    const neighbors = [left, right].filter(Boolean) as typeof players;

    const isBearPoisoned = poisonedPlayerId === bearPlayerId;
    if (isBearPoisoned) {
      return Math.random() > 0.5 ? "O Urso rosna." : "O Urso não rosna.";
    }

    const hasIllusionNeighbor = neighbors.some((n) => n.id === illusionPlayerId);
    if (hasIllusionNeighbor) return "O Urso está confuso.";

    const hasEvilNeighbor = neighbors.some((n) => EVIL_ROLES.includes(roleAssignments[n.id]));
    return hasEvilNeighbor ? "O Urso rosna." : "O Urso não rosna.";
  }, [roleAssignments, players, _permanentlyDeadPlayerIds, poisonedPlayerId, illusionPlayerId]);

  // Dynamic crow text
  const crowDynamicText = useMemo(() => {
    const crowPlayerId = Object.entries(roleAssignments).find(([, r]) => r === "v03")?.[0];
    if (!crowPlayerId) return undefined;

    const isCrowPoisoned = poisonedPlayerId === crowPlayerId;

    // Count evil beings alive (not permanently dead)
    const aliveEvilCount = alivePlayers.filter((p) => EVIL_ROLES.includes(roleAssignments[p.id])).length;

    // Check if any evil being is an illusion
    const hasIllusionEvil = alivePlayers.some(
      (p) => EVIL_ROLES.includes(roleAssignments[p.id]) && p.id === illusionPlayerId
    );
    // Or if any alive player is an illusion (more broadly, if illusion is in play on anyone)
    const illusionActive = illusionPlayerId && !_permanentlyDeadPlayerIds.has(illusionPlayerId);

    if (isCrowPoisoned) {
      // Random realistic number (±1-2 from actual)
      const offset = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      const fakeCount = Math.max(0, aliveEvilCount + offset);
      return `O {Domador do Corvo} acorda e é-lhe revelado o número de Criaturas Malvadas que ainda vivem na Aldeia: ${fakeCount}`;
    }

    if (illusionActive) {
      return "O Corvo está confuso.";
    }

    return `O {Domador do Corvo} acorda e é-lhe revelado o número de Criaturas Malvadas que ainda vivem na Aldeia: ${aliveEvilCount}`;
  }, [roleAssignments, alivePlayers, poisonedPlayerId, illusionPlayerId, _permanentlyDeadPlayerIds]);

  // Dynamic rabbit tamer text
  const rabbitDynamicText = useMemo(() => {
    const rabbitPlayerId = Object.entries(roleAssignments).find(([, r]) => r === "v05")?.[0];
    if (!rabbitPlayerId) return undefined;
    const rabbitPlayer = players.find((p) => p.id === rabbitPlayerId);
    if (!rabbitPlayer || rabbitPlayer.seat_position === null) return undefined;

    const sorted = players
      .filter((p) => p.seat_position !== null)
      .sort((a, b) => a.seat_position! - b.seat_position!);
    const rabbitIndex = sorted.findIndex((p) => p.id === rabbitPlayerId);
    if (rabbitIndex === -1) return undefined;

    // Find closest alive neighbors (permanently dead skipped, red X counts as alive)
    const findNeighbor = (dir: 1 | -1) => {
      for (let i = 1; i < sorted.length; i++) {
        const idx = (rabbitIndex + dir * i + sorted.length) % sorted.length;
        const p = sorted[idx];
        if (!_permanentlyDeadPlayerIds.has(p.id)) return p;
      }
      return null;
    };

    const left = findNeighbor(-1);
    const right = findNeighbor(1);
    const neighbors = [left, right].filter(Boolean) as typeof players;
    const relevantIds = [rabbitPlayerId, ...neighbors.map((n) => n.id)];

    // Check if any alive neighbor is an illusion (poisoned or not, attacked or not)
    const hasIllusionNeighbor = neighbors.some((n) => n.id === illusionPlayerId);
    if (hasIllusionNeighbor) return "Os coelhos estavam confusos esta noite.";

    // Check if rabbit tamer or neighbors were targeted by wolf/bruxa during the night
    const wasTargeted = relevantIds.some((id) => nightTargetedPlayerIds.has(id));
    if (wasTargeted) return "O {Domador dos Coelhos} ouviu os Coelhos assustados esta noite.";

    return "~~O {Domador dos Coelhos} não ouviu nada esta noite.~~";
  }, [roleAssignments, players, _permanentlyDeadPlayerIds, illusionPlayerId, nightTargetedPlayerIds]);

  // Build dynamic text map: keyed by "requires" signature
  const getDynamicText = (line: ScriptLine): string | undefined => {
    if (line.requires?.length === 1 && line.requires[0] === "v02") return bearDynamicText;
    if (line.requires?.length === 1 && line.requires[0] === "v03") return crowDynamicText;
    if (line.requires?.length === 1 && line.requires[0] === "v05") return rabbitDynamicText;
    return undefined;
  };

  const scriptLines = useMemo(() => {
    const lines: { section: string; items: ScriptLine[] }[] = [];

    if (nightNumber === 1) {
      const filtered = firstNightScript.filter((l) => isLineRelevant(l, activeRoles, permanentlyDeadRoles));
      if (filtered.length > 0) lines.push({ section: "Primeira Noite", items: filtered });
    } else if (nightNumber === 2) {
      const filtered2 = secondNightScript.filter((l) => isLineRelevant(l, activeRoles, permanentlyDeadRoles));
      if (filtered2.length > 0) lines.push({ section: "Início da Segunda Noite", items: filtered2 });
      const filteredNormal = normalNightScript.filter((l) => {
        if (!isLineRelevant(l, activeRoles, permanentlyDeadRoles)) return false;
        if (l.requires?.length === 1 && l.requires[0] === ("e03" as RoleId) && chamanCharges >= 2) return false;
        if (l.requires?.length === 1 && l.requires[0] === ("e04" as RoleId) && !shouldShowVidenteLine) return false;
        if (l.requires?.length === 1 && l.requires[0] === ("v04" as RoleId) && foxDisabled) return false;
        return true;
      });
      if (filteredNormal.length > 0) lines.push({ section: "Noite", items: filteredNormal });
    } else {
      const filteredNormal = normalNightScript.filter((l) => {
        if (!isLineRelevant(l, activeRoles, permanentlyDeadRoles)) return false;
        if (l.requires?.length === 1 && l.requires[0] === ("e03" as RoleId) && chamanCharges >= 2) return false;
        if (l.requires?.length === 1 && l.requires[0] === ("e04" as RoleId) && !shouldShowVidenteLine) return false;
        if (l.requires?.length === 1 && l.requires[0] === ("v04" as RoleId) && foxDisabled) return false;
        return true;
      });
      if (filteredNormal.length > 0) lines.push({ section: `Noite ${nightNumber}`, items: filteredNormal });
    }

    return lines;
  }, [nightNumber, activeRoles, permanentlyDeadRoles, chamanCharges, shouldShowVidenteLine, foxDisabled]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Moon className="h-5 w-5 text-moon" />
        <h2 className="font-display text-sm tracking-widest uppercase text-muted-foreground">
          Script da Noite {nightNumber}
        </h2>
      </div>

      <div className="space-y-4 pr-2">
        {scriptLines.map((section) => (
          <div key={section.section} className="space-y-2">
            <h3 className="font-display text-xs tracking-widest uppercase text-primary/70">
              {section.section}
            </h3>
            {section.items.map((line, i) => (
              <ScriptLineDisplay
                key={i}
                line={line}
                poisonedRoles={poisonedRoles}
                poisonedPlayerId={poisonedPlayerId}
                roleAssignments={roleAssignments}
                chamanCharges={chamanCharges}
                onChamanChargeToggle={onChamanChargeToggle}
                isWerewolfLinePoisoned={isWerewolfLinePoisoned}
                lastNightDeadPlayerIds={lastNightDeadPlayerIds}
                onVidenteReveal={onVidenteReveal}
                dynamicText={getDynamicText(line)}
                foxDisabled={foxDisabled}
                onFoxDisabledToggle={onFoxDisabledToggle}
              />
            ))}
          </div>
        ))}
      </div>

      <Button
        onClick={onEndNight}
        className="w-full h-12 font-display tracking-wider bg-secondary hover:bg-secondary/80 border border-moon/30 mt-2"
      >
        <Sun className="h-4 w-4 mr-2" />
        Terminar Noite {nightNumber}
      </Button>
    </div>
  );
};
