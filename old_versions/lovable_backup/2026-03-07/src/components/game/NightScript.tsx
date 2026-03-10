import { useMemo } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  firstNightScript,
  secondNightScript,
  normalNightScript,
  parseScriptText,
  type ScriptLine,
} from "@/lib/nightScript";
import type { RoleId } from "@/lib/roles";

interface NightScriptProps {
  activeRoles: Set<RoleId>;
  permanentlyDead: Set<string>;
  poisonedPlayerId: string | null;
  roleAssignments: Record<string, RoleId>;
  nightNumber: number;
  onEndNight: () => void;
}

function isLineRelevant(line: ScriptLine, activeRoles: Set<RoleId>, permanentlyDeadRoles: Set<RoleId>): boolean {
  if (!line.requires) return true;
  return line.requires.some((r) => activeRoles.has(r) && !permanentlyDeadRoles.has(r));
}

function getLineDragAction(line: ScriptLine): "poison" | "kill" | null {
  if (!line.requires) return null;
  if (line.requires.length === 1 && line.requires[0] === ("e02" as RoleId)) return "poison";
  if (line.requires.length === 1 && line.requires[0] === ("e01" as RoleId)) return "kill";
  return null;
}

function ScriptLineDisplay({
  line,
  poisonedRoles,
}: {
  line: ScriptLine;
  poisonedRoles: Set<RoleId>;
}) {
  const { segments } = parseScriptText(line.text);
  const isPoisonedLine = line.requires?.some((r) => poisonedRoles.has(r));
  const dragAction = getLineDragAction(line);

  const handleNativeDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (dragAction) {
      e.dataTransfer.setData("action", dragAction);
      e.dataTransfer.effectAllowed = "move";
    }
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
        {segments.map((seg, i) =>
          seg.isRole ? (
            <span key={i} className={isPoisonedLine ? "font-bold text-green-400" : "font-bold text-blue-400"}>
              {seg.text}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </motion.div>
    </div>
  );
}

export const NightScript = ({
  activeRoles,
  permanentlyDead: _permanentlyDeadPlayerIds,
  poisonedPlayerId,
  roleAssignments,
  nightNumber,
  onEndNight,
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

  const scriptLines = useMemo(() => {
    const lines: { section: string; items: ScriptLine[] }[] = [];

    if (nightNumber === 1) {
      const filtered = firstNightScript.filter((l) => isLineRelevant(l, activeRoles, permanentlyDeadRoles));
      if (filtered.length > 0) lines.push({ section: "Primeira Noite", items: filtered });
    } else if (nightNumber === 2) {
      const filtered2 = secondNightScript.filter((l) => isLineRelevant(l, activeRoles, permanentlyDeadRoles));
      if (filtered2.length > 0) lines.push({ section: "Início da Segunda Noite", items: filtered2 });
      const filteredNormal = normalNightScript.filter((l) => isLineRelevant(l, activeRoles, permanentlyDeadRoles));
      if (filteredNormal.length > 0) lines.push({ section: "Noite", items: filteredNormal });
    } else {
      const filteredNormal = normalNightScript.filter((l) => isLineRelevant(l, activeRoles, permanentlyDeadRoles));
      if (filteredNormal.length > 0) lines.push({ section: `Noite ${nightNumber}`, items: filteredNormal });
    }

    return lines;
  }, [nightNumber, activeRoles, permanentlyDeadRoles]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Moon className="h-5 w-5 text-moon" />
        <h2 className="font-display text-sm tracking-widest uppercase text-muted-foreground">
          Script da Noite {nightNumber}
        </h2>
      </div>

      <ScrollArea className="max-h-[60vh]">
        <div className="space-y-4 pr-2">
          {scriptLines.map((section) => (
            <div key={section.section} className="space-y-2">
              <h3 className="font-display text-xs tracking-widest uppercase text-primary/70">
                {section.section}
              </h3>
              {section.items.map((line, i) => (
                <ScriptLineDisplay key={i} line={line} poisonedRoles={poisonedRoles} />
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>

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
